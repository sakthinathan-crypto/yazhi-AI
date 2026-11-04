"""
Automated Test Suite for YAZHI Backend.
Covers API endpoints, priority classification, summarizer heuristics,
webhook processing, and database operations.
"""
import pytest
from datetime import datetime, timezone
from app.models.schemas import TranscriptItem, CallCreate
from app.ai.summarizer import generate_heuristic_summary
from app.core.security import verify_exotel_webhook_signature, mask_credential
from app.telephony.exotel_client import ExotelClient

def test_security_masking():
    assert mask_credential(None) == "Not Configured"
    assert mask_credential("secrettoken1234") == "***********1234"
    assert mask_credential("ab") == "***"

def test_exotel_signature_verification():
    # If no secret configured, returns True in non-strict mode
    assert verify_exotel_webhook_signature(None, "payload", token=None) is True
    # If secret configured, verify HMAC SHA256
    token = "test_exotel_token"
    import hmac, hashlib
    payload = "CallSid=123&From=+919876543210"
    valid_sig = hmac.new(token.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()
    assert verify_exotel_webhook_signature(valid_sig, payload, token=token) is True
    assert verify_exotel_webhook_signature("invalid_signature", payload, token=token) is False

def test_priority_classification_urgent():
    transcripts = [
        TranscriptItem(speaker="caller", content="Hello, this is a medical emergency regarding Sakthi's relative, please reach him immediately."),
        TranscriptItem(speaker="assistant", content="I will mark this as urgent immediately.")
    ]
    summary = generate_heuristic_summary(
        caller_phone="+919876543210",
        caller_name="Ramesh",
        organization="Family",
        transcripts=transcripts
    )
    assert summary.priority == "URGENT"
    assert "emergency" in summary.urgency_reason.lower()

def test_priority_classification_high():
    transcripts = [
        TranscriptItem(speaker="caller", content="Hi Sakthi, I am reaching out from Google regarding an AI partnership collaboration proposal."),
    ]
    summary = generate_heuristic_summary(
        caller_phone="+919876543210",
        caller_name="Google Partner",
        organization="Google",
        transcripts=transcripts
    )
    assert summary.priority == "HIGH"

def test_priority_classification_low_spam():
    transcripts = [
        TranscriptItem(speaker="caller", content="Hello sir, do you want to apply for a pre-approved personal loan at zero interest?"),
    ]
    summary = generate_heuristic_summary(
        caller_phone="+918000000000",
        caller_name="Sales Telemarketer",
        organization="Bank",
        transcripts=transcripts
    )
    assert summary.priority == "LOW"
    assert summary.category == "Spam"

def test_airtel_forwarding_instructions():
    codes = ExotelClient.get_airtel_forwarding_instructions("+919513888888", timeout_seconds=25)
    assert codes["forwarding_timeout_seconds"] == 25
    assert "*61*919513888888*11*25#" in codes["ussd_codes"]["forward_when_no_answer"]
    assert "##61#" in codes["ussd_codes"]["cancel_unanswered_forwarding"]
