# Exotel Telephony & Airtel Conditional Call Forwarding Guide

## How the Call Forwarding Pipeline Works
```
Incoming Caller
      │
      ▼
Sakthi's Mobile Phone (Airtel SIM) rings for 25 seconds
      │
      ├───> If Sakthi answers: Normal telephone conversation.
      │
      └───> If Unanswered / Busy / Unreachable (after 25s):
                │
                ▼ (Airtel Conditional Forwarding via USSD)
            Exotel Virtual ExoPhone Number
                │
                ▼ (HTTP Webhook to YAZHI Backend)
            POST https://api.yazhi.your-domain.com/api/webhooks/exotel/incoming
                │
                ▼ (Returns XML/JSON Voicebot AgentStream Directive)
            Exotel bridges audio via WebSocket
                │
                ▼
            WSS wss://api.yazhi.your-domain.com/ws/exotel/media
                │
                ▼
            YAZHI Voice Agent (Gemini Live API) answers call
```

---

## 1. Configuring Airtel SIM Conditional Forwarding

Sakthi needs to dial the following USSD string on his phone keypad **once**:

### Enable Unanswered Call Forwarding (25 Seconds)
```
*61*<EXOTEL_PHONE_NUMBER>*11*25#
```
*Example:* If your Exotel number is `+918047199999`, dial:
`*61*918047199999*11*25#` and press **Call**.

### Enable When Phone is Switched Off / Unreachable
```
*62*<EXOTEL_PHONE_NUMBER>#
```

### Enable When Phone is Busy / Call Rejected
```
*67*<EXOTEL_PHONE_NUMBER>#
```

### To Cancel / Deactivate Forwarding At Any Time
- Cancel Unanswered Forwarding: `##61#`
- Cancel All Conditional Forwarding: `##004#`
- Check Current Status: `*#61#`

---

## 2. Exotel Applet Setup
1. Log into your **Exotel Dashboard** (`https://my.exotel.com`).
2. Go to **App Bazaar** > **Create Flow / Applet**.
3. Choose **Voicebot / Connect Applet**.
4. Set the **Stream URL** to:
   `wss://<YOUR_RAILWAY_URL>/ws/exotel/media`
5. Set the **Status Callback URL** to:
   `https://<YOUR_RAILWAY_URL>/api/webhooks/exotel/status`
6. Assign your Exotel ExoPhone Number to this Applet.
