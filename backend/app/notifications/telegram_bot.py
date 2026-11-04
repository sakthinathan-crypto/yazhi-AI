"""
Telegram Bot Notification Service for YAZHI.
Dispatches real-time, structured executive call summaries directly to Sakthi.
"""
import logging
from typing import Optional, Dict, Any
import httpx

from app.config import settings
from app.models.schemas import CallSummaryModel

logger = logging.getLogger("yazhi.notifications.telegram")

class TelegramNotificationService:
    """
    Delivers instant high-priority call summaries to Sakthi via Telegram Bot API.
    """

    def __init__(self):
        self.bot_token = settings.TELEGRAM_BOT_TOKEN
        self.chat_id = settings.TELEGRAM_CHAT_ID

    def is_configured(self) -> bool:
        return bool(self.bot_token and self.chat_id)

    async def test_connection(self) -> Dict[str, Any]:
        """
        Tests Telegram bot authentication and sends a ping message.
        """
        if not self.is_configured():
            return {
                "success": False,
                "message": "Telegram Bot Token or Chat ID not configured."
            }

        url = f"https://api.telegram.org/bot{self.bot_token}/getMe"
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    bot_name = data.get("result", {}).get("username", "YazhiBot")
                    # Send a quick test message
                    test_msg_url = f"https://api.telegram.org/bot{self.bot_token}/sendMessage"
                    await client.post(test_msg_url, json={
                        "chat_id": self.chat_id,
                        "text": f"🤖 *YAZHI System Notification*\nTelegram notification pipeline is connected successfully to Sakthi's phone.",
                        "parse_mode": "Markdown"
                    })
                    return {
                        "success": True,
                        "message": f"Connected to @{bot_name} and delivered test ping to chat {self.chat_id}."
                    }
                else:
                    return {
                        "success": False,
                        "message": f"Telegram API returned status {res.status_code}: {res.text}"
                    }
        except Exception as exc:
            return {
                "success": False,
                "message": f"Failed to connect to Telegram: {str(exc)}"
            }

    async def send_call_summary(
        self,
        caller_name: Optional[str],
        caller_phone: str,
        organization: Optional[str],
        duration_seconds: int,
        summary: CallSummaryModel,
        is_simulation: bool = False
    ) -> bool:
        """
        Formats and dispatches the exact executive call summary required.
        """
        if not self.is_configured():
            logger.info("Telegram not configured; skipping dispatch.")
            return False

        minutes = duration_seconds // 60
        seconds = duration_seconds % 60
        duration_formatted = f"{minutes:02d}:{seconds:02d}"

        priority_emoji = {
            "URGENT": "🚨",
            "HIGH": "🔥",
            "NORMAL": "📋",
            "LOW": "ℹ️"
        }.get(summary.priority, "📋")

        sim_tag = " [TEST / SIMULATION]" if is_simulation else ""

        status_text = "Callback Required" if summary.callback_requested else "Handled by AI (No Callback Needed)"
        if summary.callback_preference:
            status_text += f" (Preferred: {summary.callback_preference})"

        message = (
            f"⚡ *YAZHI – NEW CALL SUMMARY{sim_tag}*\n\n"
            f"👤 *Caller:* {caller_name or 'Not identified'}\n"
            f"📞 *Phone:* `{caller_phone}`\n"
            f"🏢 *Organization:* {organization or 'Independent / Personal'}\n\n"
            f"🎯 *Purpose:*\n{summary.purpose}\n\n"
            f"{priority_emoji} *Priority:* *{summary.priority}*\n"
            f"⏱️ *Duration:* {duration_formatted}\n\n"
            f"📝 *Summary:*\n{summary.summary_text}\n\n"
            f"📌 *Status:* {status_text}\n"
        )

        if summary.action_items:
            action_list = "\n".join([f"• {act}" for act in summary.action_items])
            message += f"\n✅ *Action Items:*\n{action_list}\n"

        url = f"https://api.telegram.org/bot{self.bot_token}/sendMessage"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json={
                    "chat_id": self.chat_id,
                    "text": message,
                    "parse_mode": "Markdown"
                })
                if res.status_code == 200:
                    logger.info(f"Telegram summary delivered for caller {caller_phone}")
                    return True
                else:
                    logger.error(f"Telegram delivery failed with code {res.status_code}: {res.text}")
                    return False
        except Exception as exc:
            logger.error(f"Telegram dispatch exception: {exc}")
            return False

telegram_service = TelegramNotificationService()
