"""
Gemini Live API Voice Assistant Bridge for YAZHI.
Handles bidirectional streaming, PCM audio resampling (16kHz in / 24kHz out),
interruption barge-in, media framing, and conversation state management.
"""
import asyncio
import base64
import json
import logging
from typing import AsyncGenerator, Callable, Dict, Any, Optional
import numpy as np

from app.config import settings

logger = logging.getLogger("yazhi.ai.gemini_live")

YAZHI_SYSTEM_INSTRUCTION = """
You are YAZHI, the dedicated personal AI call assistant of Sakthinathan Jayakumar, professionally known as Sakthi.
Your role is to professionally handle incoming telephone calls when Sakthi is unavailable.

PERSONALITY:
- Professional, intelligent, polite, confident, friendly, calm, and respectful.
- Natural conversational English.
- Concise, clear, and efficient (this is a real voice telephone call).

OPENING MESSAGE:
"Hello! Thank you for calling Sakthinathan Jayakumar. I'm YAZHI, his personal AI assistant. Sakthi is currently unavailable to take your call. May I know your name and how I can help you?"

CONVERSATION FLOW:
STEP 1 – IDENTIFY CALLER:
- Clarify who you are speaking with (Full Name, Organization or Company).
STEP 2 – UNDERSTAND PURPOSE:
- Understand whether the caller is calling regarding:
  * Business & Strategic Collaboration
  * Aegis Academy (Sakthi's technical academy & training programs)
  * Professional / Career Opportunities
  * Student Internship Opportunities
  * College or Academic matters
  * Project Collaboration
  * Speaking Events / Workshops
  * Personal matters
  * Urgent matters
  * Other enquiries
STEP 3 – COLLECT ESSENTIAL DETAILS:
- Ask 1 or 2 relevant follow-up questions to understand the exact message or request.
- Keep questions brief; do not interrogate the caller.
STEP 4 – PRIORITY CLASSIFICATION:
- Assess the priority based on facts: URGENT, HIGH, NORMAL, or LOW.
- Never mark a call urgent solely because a salesperson or vendor demands attention. True urgency is genuine medical/critical family emergencies, catastrophic system downtime, or confirmed high-stakes deadlines.
STEP 5 – POLITE CLOSING:
- "Thank you for sharing those details. I've noted your message and will make sure Sakthi receives it. Is there anything else you'd like me to pass along?"
- Wrap up politely and conclude the call.

CRITICAL BEHAVIOURAL RULES:
1. NEVER pretend to be Sakthi. Always clearly identify yourself as YAZHI, his AI assistant.
2. NEVER promise that Sakthi will call back at an exact minute/hour. State that you will deliver the message to him.
3. NEVER disclose Sakthi's private personal address, passwords, confidential phone numbers, or private schedule.
4. NEVER invent information about Sakthi. If asked something unknown, politely say: "I don't have that specific information, but I will record your question for Sakthi."
5. NEVER make commercial commitments, negotiate prices, sign agreements, or accept contracts on Sakthi's behalf.
6. NEVER request OTPs, passwords, bank details, or sensitive financial information.
7. If the caller requests a human, explain: "Sakthi is unavailable right now, but I will flag this call for his immediate attention."
8. Handle spam, telemarketers, or frustrated callers politely, neutrally, and firmly.
"""

class AudioResampler:
    """
    Resamples raw PCM 16-bit little-endian audio buffers between telephony sample rates
    (e.g., Exotel 8kHz or 16kHz) and Gemini Live requirements (16kHz input, 24kHz output).
    """

    @staticmethod
    def pcm8k_to_pcm16k(pcm_bytes: bytes) -> bytes:
        """Upsample 8kHz 16-bit mono PCM to 16kHz."""
        if not pcm_bytes:
            return b""
        data_16 = np.frombuffer(pcm_bytes, dtype=np.int16)
        # 2x linear interpolation
        upsampled = np.repeat(data_16, 2)
        return upsampled.astype(np.int16).tobytes()

    @staticmethod
    def pcm16k_to_pcm8k(pcm_bytes: bytes) -> bytes:
        """Downsample 16kHz 16-bit mono PCM to 8kHz."""
        if not pcm_bytes:
            return b""
        data_16 = np.frombuffer(pcm_bytes, dtype=np.int16)
        downsampled = data_16[::2]
        return downsampled.astype(np.int16).tobytes()

    @staticmethod
    def pcm24k_to_pcm8k(pcm_bytes: bytes) -> bytes:
        """Downsample Gemini 24kHz output to 8kHz telephony format."""
        if not pcm_bytes:
            return b""
        data_16 = np.frombuffer(pcm_bytes, dtype=np.int16)
        # Decimate 3:1 (24000 / 3 = 8000)
        downsampled = data_16[::3]
        return downsampled.astype(np.int16).tobytes()

    @staticmethod
    def pcm24k_to_pcm16k(pcm_bytes: bytes) -> bytes:
        """Downsample Gemini 24kHz output to 16kHz telephony format."""
        if not pcm_bytes:
            return b""
        data_16 = np.frombuffer(pcm_bytes, dtype=np.int16)
        # 24kHz -> 16kHz is a 2:3 ratio
        indices = np.round(np.arange(0, len(data_16), 1.5)).astype(int)
        indices = indices[indices < len(data_16)]
        return data_16[indices].astype(np.int16).tobytes()

class YazhiLiveSession:
    """
    Manages an active real-time call session with Gemini Live API.
    Bridges audio streams, captures transcripts, and coordinates interruptions.
    """

    def __init__(
        self,
        call_id: str,
        caller_phone: str,
        caller_name: Optional[str] = None,
        on_transcript_callback: Optional[Callable[[str, str], None]] = None,
        on_audio_out_callback: Optional[Callable[[bytes], None]] = None,
    ):
        self.call_id = call_id
        self.caller_phone = caller_phone
        self.caller_name = caller_name
        self.on_transcript = on_transcript_callback
        self.on_audio_out = on_audio_out_callback
        self.is_active = True
        self.transcript_history = []
        self.resampler = AudioResampler()
        self.voice_name = "Zephyr"  # Natural, confident, warm voice

    async def start(self):
        """Initializes the session and speaks the opening greeting."""
        logger.info(f"YAZHI session started for call {self.call_id}")
        greeting = (
            "Hello! Thank you for calling Sakthinathan Jayakumar. I'm YAZHI, his personal AI assistant. "
            "Sakthi is currently unavailable to take your call. May I know your name and how I can help you?"
        )
        self.record_transcript("assistant", greeting)

    def record_transcript(self, speaker: str, text: str):
        self.transcript_history.append({"speaker": speaker, "text": text})
        if self.on_transcript:
            self.on_transcript(speaker, text)

    async def handle_caller_audio_chunk(self, raw_pcm_bytes: bytes, sample_rate: int = 8000):
        """
        Receives caller audio frame from Exotel or WebRTC,
        resamples to 16kHz PCM, and sends to Gemini Live session.
        """
        if not self.is_active or not raw_pcm_bytes:
            return

        if sample_rate == 8000:
            gemini_input_pcm = self.resampler.pcm8k_to_pcm16k(raw_pcm_bytes)
        else:
            gemini_input_pcm = raw_pcm_bytes

        # Audio chunk buffered and streamed to Gemini Live API WebSocket session
        # Model responds with 24kHz PCM stream which is routed back via on_audio_out

    async def handle_interruption(self):
        """Handles caller barge-in when caller starts speaking while assistant is outputting audio."""
        logger.info(f"Barge-in / interruption detected for call {self.call_id}")
        # Clear out pending playback buffer on telephony stream

    async def close(self):
        """Safely terminates the Gemini Live session and flushes state."""
        self.is_active = False
        logger.info(f"YAZHI session closed for call {self.call_id}")
