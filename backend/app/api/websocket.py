"""
WebSocket Media and Real-Time Live Monitoring Hub for YAZHI.
Bridges Exotel Voicebot AgentStream with Gemini Live API audio pipeline
and broadcasts live telemetry to the owner dashboard.
"""
import asyncio
import base64
import json
import logging
from typing import Dict, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.config import settings
from app.ai.gemini_live import YazhiLiveSession, AudioResampler
from app.services.call_service import call_service

logger = logging.getLogger("yazhi.api.websocket")
ws_router = APIRouter()

# Active dashboard observer connections for live monitoring
active_dashboard_clients: Set[WebSocket] = set()

async def broadcast_live_event(event_type: str, data: dict):
    """Broadcasts live call state and transcription to all connected dashboard clients."""
    if not active_dashboard_clients:
        return
    message = json.dumps({"event": event_type, "data": data})
    disconnected = set()
    for client in active_dashboard_clients:
        try:
            await client.send_text(message)
        except Exception:
            disconnected.add(client)
    active_dashboard_clients.difference_update(disconnected)

@ws_router.websocket("/ws/live-monitor")
async def live_dashboard_monitor_ws(websocket: WebSocket):
    """
    WebSocket endpoint for Sakthi's dashboard to observe active live calls in real-time.
    """
    await websocket.accept()
    active_dashboard_clients.add(websocket)
    logger.info("Dashboard client subscribed to live monitor.")
    try:
        while True:
            # Keep-alive heartbeat from dashboard
            data = await websocket.receive_text()
            msg = json.loads(data)
            if msg.get("action") == "ping":
                await websocket.send_text(json.dumps({"event": "pong"}))
    except WebSocketDisconnect:
        logger.info("Dashboard client disconnected from live monitor.")
    finally:
        active_dashboard_clients.discard(websocket)

@ws_router.websocket("/ws/exotel/media")
async def exotel_media_stream_ws(websocket: WebSocket):
    """
    Bidirectional audio streaming WebSocket bridge for Exotel Voicebot / AgentStream.
    Exotel streams caller audio in base64 frames; YAZHI streams Gemini Live synthesized audio back.
    """
    await websocket.accept()
    logger.info("Exotel telephony WebSocket connected.")
    
    stream_sid = None
    call_sid = None
    session: YazhiLiveSession = None
    resampler = AudioResampler()

    try:
        while True:
            message_text = await websocket.receive_text()
            message = json.loads(message_text)
            event = message.get("event")

            # 1. Stream Connected / Start Event
            if event == "connected":
                logger.info("Exotel protocol handshake connected.")

            elif event == "start":
                stream_sid = message.get("streamSid")
                start_data = message.get("start", {})
                call_sid = start_data.get("callSid")
                custom_params = start_data.get("customParameters", {})
                
                logger.info(f"Exotel stream started: streamSid={stream_sid}, callSid={call_sid}")
                
                # Setup callbacks to broadcast live transcripts to the dashboard
                def on_transcript(speaker: str, text: str):
                    asyncio.create_task(broadcast_live_event("transcript", {
                        "callSid": call_sid,
                        "speaker": speaker,
                        "text": text
                    }))

                # Setup audio out callback to send PCM back to Exotel
                def on_audio_out(gemini_24k_pcm: bytes):
                    # Downsample 24kHz to 8kHz for Exotel
                    exotel_8k_pcm = resampler.pcm24k_to_pcm8k(gemini_24k_pcm)
                    payload_b64 = base64.b64encode(exotel_8k_pcm).decode("utf-8")
                    out_msg = {
                        "event": "media",
                        "streamSid": stream_sid,
                        "media": {
                            "payload": payload_b64
                        }
                    }
                    asyncio.create_task(websocket.send_text(json.dumps(out_msg)))

                session = YazhiLiveSession(
                    call_id=call_sid or "unknown",
                    caller_phone=start_data.get("from", "Unknown"),
                    on_transcript_callback=on_transcript,
                    on_audio_out_callback=on_audio_out
                )
                await session.start()
                
                # Notify dashboard of live active call
                await broadcast_live_event("call_started", {
                    "callSid": call_sid,
                    "callerPhone": start_data.get("from", "Unknown"),
                    "streamSid": stream_sid
                })

            # 2. Caller Media Frame Event
            elif event == "media":
                media = message.get("media", {})
                payload_b64 = media.get("payload")
                if payload_b64 and session:
                    raw_pcm_8k = base64.b64decode(payload_b64)
                    await session.handle_caller_audio_chunk(raw_pcm_8k, sample_rate=8000)

            # 3. Interruption / Clear Buffer Event
            elif event == "clear":
                if session:
                    await session.handle_interruption()

            # 4. Stream Stop / Call Termination Event
            elif event == "stop":
                logger.info(f"Exotel stream stop received for {call_sid}")
                break

    except WebSocketDisconnect:
        logger.info(f"Exotel WebSocket disconnected for {call_sid}")
    except Exception as exc:
        logger.error(f"Error in Exotel media WebSocket: {exc}")
    finally:
        if session:
            await session.close()
            await broadcast_live_event("call_ended", {"callSid": call_sid})
        try:
            await websocket.close()
        except Exception:
            pass
