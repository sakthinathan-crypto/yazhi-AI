"""
Security, credential validation, and signature verification utilities.
"""
import hmac
import hashlib
import time
from typing import Optional
from app.config import settings

def verify_exotel_webhook_signature(signature: Optional[str], payload: str, token: Optional[str] = None) -> bool:
    """
    Verifies Exotel webhook HMAC signature if configured.
    """
    secret = token or settings.EXOTEL_API_TOKEN
    if not secret or not signature:
        # In development mode or unconfigured token, log warning
        return True
    
    try:
        computed = hmac.new(secret.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()
        return hmac.compare_digest(signature, computed)
    except Exception:
        return False

def mask_credential(val: Optional[str], show_last: int = 4) -> str:
    """
    Returns masked version of an API token or secret.
    """
    if not val:
        return "Not Configured"
    if len(val) <= show_last + 2:
        return "***"
    return f"{'*' * (len(val) - show_last)}{val[-show_last:]}"
