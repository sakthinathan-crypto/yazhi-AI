# YAZHI – Setup and Configuration Guide

Welcome to **YAZHI**, the production-grade personal AI call assistant built specifically for **Sakthinathan Jayakumar (Sakthi)**.

## Architecture Summary
1. **Frontend**: React + TypeScript + Tailwind CSS + Lucide Icons + Recharts (Deployable on Vercel).
2. **Backend**: Python FastAPI with WebSocket audio streaming and Pydantic validation (Deployable on Railway).
3. **Database**: Supabase PostgreSQL with Row Level Security and indexes.
4. **AI Engine**: Google Gemini Live API (`gemini-3.8-live` for bidirectional voice, `gemini-3.8-flash` for structured summarization).
5. **Telephony**: Exotel Voicebot / AgentStream with Airtel conditional call forwarding.
6. **Notifications**: Telegram Bot API for instant executive call briefings.

---

## 1. Local Development Setup

### Backend (Python FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env
# Edit .env with your credentials
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be available at `http://localhost:8000/docs`.

### Frontend (React + Vite)
```bash
# In project root
npm install
npm run dev
```
Dashboard will be available at `http://localhost:3000`.

---

## 2. Environment Variables Checklist

| Variable | Description | Where to Obtain |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API Key | [Google AI Studio](https://aistudio.google.com/) |
| `GEMINI_LIVE_MODEL` | Set to `gemini-3.8-live` | Built-in |
| `EXOTEL_ACCOUNT_SID` | Exotel Account SID | [Exotel Console](https://my.exotel.com/) |
| `EXOTEL_API_KEY` | Exotel API Key | Exotel API Credentials |
| `EXOTEL_API_TOKEN` | Exotel API Token | Exotel API Credentials |
| `EXOTEL_PHONE_NUMBER` | Exotel Virtual Number | Allocated ExoPhone Number |
| `SUPABASE_URL` | Supabase Project URL | [Supabase Console](https://supabase.com/) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Key | Supabase Settings > API |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot Token | [@BotFather](https://t.me/BotFather) |
| `TELEGRAM_CHAT_ID` | Sakthi's Telegram Chat ID | [@userinfobot](https://t.me/userinfobot) |
| `APP_URL` | Public backend URL | Railway/Cloud Run Public Domain |
