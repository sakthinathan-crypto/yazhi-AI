"""
Exotel Telephony Service for YAZHI.
Handles incoming call webhooks, AgentStream bidirectional WebSocket initiation,
call status callbacks, and telecom conditional forwarding configurations.
"""
import logging
from typing import Dict, Any, Optional
import httpx

from app.config import settings

logger = logging.getLogger("yazhi.telephony.exotel")

class ExotelClient:
    """
    Exotel API client for call screening, Voicebot stream initiation, and status queries.
    """

    def __init__(self):
        self.account_sid = settings.EXOTEL_ACCOUNT_SID
        self.api_key = settings.EXOTEL_API_KEY
        self.api_token = settings.EXOTEL_API_TOKEN
        self.subdomain = settings.EXOTEL_SUBDOMAIN
        self.phone_number = settings.EXOTEL_PHONE_NUMBER
        self.base_url = f"https://{self.api_key}:{self.api_token}@{self.subdomain}/v1/Accounts/{self.account_sid}"

    def is_configured(self) -> bool:
        return bool(self.account_sid and self.api_key and self.api_token)

    async def test_connection(self) -> Dict[str, Any]:
        """
        Validates Exotel API credentials by querying account details.
        """
        if not self.is_configured():
            return {
                "success": False,
                "message": "Exotel credentials are not fully configured in environment."
            }

        url = f"https://{self.subdomain}/v1/Accounts/{self.account_sid}.json"
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(url, auth=(self.api_key, self.api_token))
                if res.status_code == 200:
                    data = res.json()
                    return {
                        "success": True,
                        "message": f"Connected to Exotel Account {self.account_sid} successfully.",
                        "account_name": data.get("Account", {}).get("FriendlyName", "Exotel Account")
                    }
                else:
                    return {
                        "success": False,
                        "message": f"Exotel API returned status {res.status_code}: {res.text}"
                    }
        except Exception as exc:
            return {
                "success": False,
                "message": f"Failed to reach Exotel API: {str(exc)}"
            }

    def generate_voicebot_applet_response(self, call_sid: str, stream_url: str) -> str:
        """
        Generates Exotel Voicebot / AgentStream Applet JSON or XML response.
        Directs Exotel to bridge the call audio directly to YAZHI's WebSocket endpoint.
        """
        # Exotel AgentStream / Voicebot standard directive
        return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <!-- AI Telephony Disclosure Notice -->
    <Say voice="woman" language="en-IN">Connecting to personal assistant YAZHI.</Say>
    <!-- Bidirectional WebSocket audio streaming -->
    <Stream url="{stream_url}">
        <Parameter name="call_sid" value="{call_sid}" />
        <Parameter name="assistant" value="YAZHI" />
        <Parameter name="owner" value="Sakthinathan Jayakumar" />
    </Stream>
</Response>"""

    @staticmethod
    def get_airtel_forwarding_instructions(exotel_virtual_number: str, timeout_seconds: int = 25) -> Dict[str, Any]:
        """
        Provides exact USSD dial codes for Airtel conditional call forwarding.
        Sakthi dials these once on his phone to route unanswered calls to YAZHI.
        """
        clean_num = exotel_virtual_number.replace("+", "").replace(" ", "").replace("-", "")
        return {
            "provider": "Airtel India (and compatible GSM carriers)",
            "virtual_number": exotel_virtual_number,
            "forwarding_timeout_seconds": timeout_seconds,
            "ussd_codes": {
                "forward_when_no_answer": f"*61*{clean_num}*11*{timeout_seconds}#",
                "forward_when_unreachable": f"*62*{clean_num}#",
                "forward_when_busy": f"*67*{clean_num}#",
                "forward_all_unanswered": f"*004*{clean_num}*11*{timeout_seconds}#",
                "check_forwarding_status": "*#61#",
                "cancel_unanswered_forwarding": "##61#",
                "cancel_all_forwarding": "##004#"
            },
            "instructions": [
                f"1. Open the Phone dialer on your Airtel phone.",
                f"2. Dial *61*{clean_num}*11*{timeout_seconds}# and tap Call.",
                f"3. You will receive a confirmation: 'Call forwarding when unanswered for {timeout_seconds} seconds enabled.'",
                f"4. When someone calls you, your phone will ring for {timeout_seconds} seconds first.",
                f"5. If you do not answer, Airtel forwards the caller directly to YAZHI at {exotel_virtual_number}."
            ]
        }

exotel_service = ExotelClient()
