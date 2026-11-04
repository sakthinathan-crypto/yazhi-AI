# Gemini Live API & Summarizer Setup Guide

## Gemini Architecture in YAZHI
YAZHI uses two distinct Gemini models:

1. **`gemini-3.8-live` (Gemini Live API)**:
   - Purpose: Real-time, bidirectional voice conversation with callers.
   - Low latency, native audio streaming.
   - Voice persona: `Zephyr` (warm, articulate, professional tone).
   - Audio input: 16-bit PCM little-endian at 16kHz (`audio/pcm;rate=16000`).
   - Audio output: 16-bit PCM little-endian at 24kHz.
   - Built-in interruption / barge-in support.

2. **`gemini-3.8-flash` (Structured Analysis)**:
   - Purpose: Executive call summarization, priority classification, and action item extraction.
   - Enforces structured JSON output.
   - Heuristic classification rules for emergency versus standard business/academic enquiries.

---

## Configuration
Set your Google AI Studio API key in `GEMINI_API_KEY`:
```bash
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_LIVE_MODEL="gemini-3.8-live"
GEMINI_SUMMARY_MODEL="gemini-3.8-flash"
```
