"""
FastAPI REST API routes for YAZHI.
"""
from fastapi import APIRouter, HTTPException, Query, Header, Request, status, Response
from typing import List, Optional, Dict, Any
import time

from app.config import settings
from app.models.schemas import (
    CallResponse, CallCreate, CallUpdate, ContactResponse, ContactCreate,
    DashboardStats, AssistantSettingsModel, CallHandlingSettingsModel,
    NotificationSettingsModel, IntegrationTestResult, ExotelIncomingWebhook,
    ExotelStatusWebhook
)
from app.database.supabase_client import db_repository
from app.services.call_service import call_service
from app.telephony.exotel_client import exotel_service
from app.notifications.telegram_bot import telegram_service

router = APIRouter()

# Health
@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "YAZHI Telephony Backend",
        "version": settings.VERSION,
        "owner": settings.OWNER_NAME,
        "assistant": settings.ASSISTANT_NAME
    }

# Dashboard
@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    return await call_service.get_dashboard_stats()

# Calls
@router.get("/calls", response_model=List[CallResponse])
async def list_calls(
    limit: int = Query(50, ge=1, le=200),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None)
):
    return await db_repository.get_calls(limit=limit, priority=priority, category=category)

@router.get("/calls/{call_id}", response_model=CallResponse)
async def get_call_by_id(call_id: str):
    call = await db_repository.get_call(call_id)
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    return call

@router.post("/calls/{call_id}/notes")
async def add_call_notes(call_id: str, payload: Dict[str, str]):
    notes = payload.get("notes", "")
    update = CallUpdate(private_notes=notes)
    updated = await db_repository.update_call(call_id, update)
    if not updated:
        raise HTTPException(status_code=404, detail="Call not found")
    return {"success": True, "call_id": call_id, "notes": notes}

@router.patch("/calls/{call_id}/status")
async def update_call_status(call_id: str, payload: Dict[str, Any]):
    new_status = payload.get("status")
    new_priority = payload.get("priority")
    callback_requested = payload.get("callback_requested")
    
    update = CallUpdate(
        status=new_status,
        priority=new_priority,
        callback_requested=callback_requested
    )
    updated = await db_repository.update_call(call_id, update)
    if not updated:
        raise HTTPException(status_code=404, detail="Call not found")
    return updated

@router.delete("/calls/{call_id}")
async def delete_call(call_id: str):
    success = await db_repository.delete_call(call_id)
    if not success:
        raise HTTPException(status_code=404, detail="Call not found")
    return {"success": True, "message": "Call record deleted"}

# Contacts
@router.get("/contacts", response_model=List[ContactResponse])
async def list_contacts():
    return await db_repository.get_contacts()

@router.post("/contacts", response_model=ContactResponse)
async def create_contact(contact_in: ContactCreate):
    return await db_repository.create_contact(contact_in)

@router.put("/contacts/{contact_id}", response_model=ContactResponse)
async def update_contact(contact_id: str, contact_in: ContactCreate):
    updated = await db_repository.update_contact(contact_id, contact_in)
    if not updated:
        raise HTTPException(status_code=404, detail="Contact not found")
    return updated

@router.delete("/contacts/{contact_id}")
async def delete_contact(contact_id: str):
    success = await db_repository.delete_contact(contact_id)
    if not success:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"success": True, "message": "Contact deleted"}

# Settings
@router.get("/settings")
async def get_all_settings():
    assistant = await db_repository.get_assistant_settings()
    handling = await db_repository.get_handling_settings()
    notifications = await db_repository.get_notification_settings()
    airtel_codes = exotel_service.get_airtel_forwarding_instructions(
        settings.EXOTEL_PHONE_NUMBER or "+91XXXXXXXXXX",
        handling.forwarding_timeout_seconds
    )
    return {
        "assistant": assistant,
        "handling": handling,
        "notifications": notifications,
        "airtel_forwarding": airtel_codes
    }

@router.put("/settings/assistant", response_model=AssistantSettingsModel)
async def update_assistant_settings(payload: AssistantSettingsModel):
    return await db_repository.update_assistant_settings(payload)

@router.put("/settings/handling", response_model=CallHandlingSettingsModel)
async def update_handling_settings(payload: CallHandlingSettingsModel):
    return await db_repository.update_handling_settings(payload)

# Integration tests
@router.post("/integrations/gemini/test", response_model=IntegrationTestResult)
async def test_gemini_integration():
    t0 = time.time()
    if not settings.GEMINI_API_KEY:
        return IntegrationTestResult(
            provider="gemini",
            success=False,
            message="GEMINI_API_KEY is not configured.",
            latency_ms=0
        )
    try:
        from google import genai
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        res = client.models.generate_content(
            model=settings.GEMINI_SUMMARY_MODEL,
            contents="Say 'YAZHI voice assistant operational' in 4 words."
        )
        latency = (time.time() - t0) * 1000
        return IntegrationTestResult(
            provider="gemini",
            success=True,
            message=f"Gemini API verified. Model output: '{res.text.strip()}'",
            latency_ms=round(latency, 1)
        )
    except Exception as exc:
        return IntegrationTestResult(
            provider="gemini",
            success=False,
            message=f"Gemini test failed: {str(exc)}",
            latency_ms=round((time.time() - t0) * 1000, 1)
        )

@router.post("/integrations/exotel/test", response_model=IntegrationTestResult)
async def test_exotel_integration():
    t0 = time.time()
    result = await exotel_service.test_connection()
    latency = (time.time() - t0) * 1000
    return IntegrationTestResult(
        provider="exotel",
        success=result["success"],
        message=result["message"],
        latency_ms=round(latency, 1)
    )

@router.post("/integrations/telegram/test", response_model=IntegrationTestResult)
async def test_telegram_integration():
    t0 = time.time()
    result = await telegram_service.test_connection()
    latency = (time.time() - t0) * 1000
    return IntegrationTestResult(
        provider="telegram",
        success=result["success"],
        message=result["message"],
        latency_ms=round(latency, 1)
    )

# Exotel Telephony Webhooks
@router.post("/webhooks/exotel/incoming")
async def handle_exotel_incoming_call(request: Request):
    """
    Exotel calls this webhook when a call is forwarded to the Exotel Virtual Number.
    Returns the Voicebot Applet response that connects the caller's audio to /ws/exotel/media.
    """
    form_data = await request.form()
    call_sid = form_data.get("CallSid", f"exo_{int(time.time())}")
    caller_phone = form_data.get("From", "Unknown")
    
    # Register the incoming call in our database
    call = await call_service.initiate_incoming_call(
        caller_phone=caller_phone,
        exotel_call_sid=call_sid,
        is_simulation=False
    )
    
    # Build the WebSocket stream URL pointing back to our server
    scheme = "wss" if request.url.scheme == "https" else "ws"
    host = request.headers.get("host", "localhost:8000")
    ws_stream_url = f"{scheme}://{host}/ws/exotel/media?call_sid={call_sid}&call_id={call.id}"
    
    xml_response = exotel_service.generate_voicebot_applet_response(call_sid, ws_stream_url)
    return Response(content=xml_response, media_type="application/xml")

@router.post("/webhooks/exotel/status")
async def handle_exotel_status_callback(request: Request):
    """
    Exotel status callback when call ends or changes state.
    """
    form_data = await request.form()
    call_sid = form_data.get("CallSid")
    call_status = form_data.get("Status", "completed")
    duration = int(form_data.get("Duration", 0) or 0)
    
    # Locate call and finalize
    calls = await db_repository.get_calls()
    for c in calls:
        if c.exotel_call_sid == call_sid:
            await call_service.complete_call(
                call_id=c.id,
                duration_seconds=duration,
                status="Completed" if call_status.lower() == "completed" else "Missed"
            )
            break
            
    return {"status": "received"}

# Interactive Demo Simulator Trigger
@router.post("/simulator/trigger")
async def trigger_simulated_call(payload: Dict[str, Any]):
    """
    Trigger a simulated incoming call with custom or predefined scenarios.
    Useful for testing YAZHI's conversational intelligence without dialing real phone numbers.
    """
    caller_name = payload.get("caller_name", "Arjun Srinivasan")
    caller_phone = payload.get("caller_phone", "+919876599999")
    organization = payload.get("organization", "Aegis Academy Applicant")
    dialogue_script = payload.get("dialogue_script", [])
    
    # 1. Initiate call
    call = await call_service.initiate_incoming_call(
        caller_phone=caller_phone,
        caller_name=caller_name,
        organization=organization,
        is_simulation=True
    )
    
    # 2. Record transcripts
    for turn in dialogue_script:
        await call_service.record_dialogue_turn(
            call.id,
            speaker=turn.get("speaker", "caller"),
            content=turn.get("content", ""),
            offset_ms=turn.get("offset_ms", 1000)
        )
        
    # 3. Finalize call and trigger summary
    duration = payload.get("duration_seconds", 120)
    completed_call = await call_service.complete_call(
        call_id=call.id,
        duration_seconds=duration,
        status="AI Answered"
    )
    
    return {
        "success": True,
        "call": completed_call,
        "message": "Simulated call processed successfully by YAZHI."
    }
