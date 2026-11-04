# YAZHI – Personal AI Call Assistant
> *"Your Personal AI. Your Calls. Your Control."*

**YAZHI** is a full-stack, production-grade personal AI call screening and secretary system designed for **Sakthinathan Jayakumar (Sakthi)**.

When Sakthi's phone rings and remains unanswered (after a configurable 25-second timeout), the carrier forwards the call to YAZHI via Exotel Voicebot telephony. YAZHI answers with natural speech using Google's **Gemini Live API**, identifies the caller, understands their purpose, determines priority (URGENT / HIGH / NORMAL / LOW), logs the transcript, stores it in **Supabase PostgreSQL**, and immediately sends an executive summary via **Telegram Bot API**.

---

## Key Features
- **Intelligent Call Screening**: Rings the owner's phone first; answers gracefully when unavailable.
- **Natural Voice Agent**: Powered by `gemini-3.8-live` with bidirectional PCM audio streaming and barge-in interruption.
- **Telecom Compatibility**: Uses GSM standard USSD conditional call forwarding (`*61*...*11*25#`) with Airtel India and major providers.
- **Instant Telegram Alerts**: Sends concise, high-impact call briefs with action items and callback requests.
- **Executive Dark SaaS Dashboard**: Built with React, Tailwind CSS, and Recharts, featuring real-time call monitoring, call history filtering, contacts manager, and audio simulations.
- **Production Architecture**: Decoupled Python FastAPI backend (ready for Railway) + React frontend (ready for Vercel) + Supabase database.

---

## Quick Start
1. Read [docs/SETUP.md](docs/SETUP.md) for full configuration.
2. Read [docs/EXOTEL_SETUP.md](docs/EXOTEL_SETUP.md) for Exotel and Airtel USSD codes.
3. Read [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Railway and Vercel setup.
