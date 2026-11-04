"""
Pydantic schemas and data models for YAZHI.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime

PriorityLevel = Literal["URGENT", "HIGH", "NORMAL", "LOW"]
CallStatus = Literal["AI Answered", "Owner Answered", "Missed", "Failed", "Completed", "Transferred", "In Progress"]
SpeakerType = Literal["caller", "assistant", "system"]

class TranscriptItem(BaseModel):
    speaker: SpeakerType
    content: str
    timestamp_offset_ms: int = 0
    created_at: Optional[datetime] = None

class CallSummaryModel(BaseModel):
    purpose: str
    key_points: List[str] = []
    action_items: List[str] = []
    caller_sentiment: str = "Neutral"
    summary_text: str
    urgency_reason: Optional[str] = None
    priority: PriorityLevel = "NORMAL"
    callback_requested: bool = False
    callback_preference: Optional[str] = None
    category: str = "General"

class CallCreate(BaseModel):
    caller_phone: str
    caller_name: Optional[str] = None
    organization: Optional[str] = None
    status: CallStatus = "In Progress"
    category: str = "Enquiry"
    priority: PriorityLevel = "NORMAL"
    exotel_call_sid: Optional[str] = None
    is_simulation: bool = False

class CallUpdate(BaseModel):
    status: Optional[CallStatus] = None
    priority: Optional[PriorityLevel] = None
    duration_seconds: Optional[int] = None
    call_end_time: Optional[datetime] = None
    private_notes: Optional[str] = None
    callback_requested: Optional[bool] = None

class CallResponse(BaseModel):
    id: str
    caller_phone: str
    caller_name: Optional[str] = None
    organization: Optional[str] = None
    call_start_time: datetime
    call_end_time: Optional[datetime] = None
    duration_seconds: int = 0
    status: CallStatus
    category: str
    priority: PriorityLevel
    callback_requested: bool = False
    callback_preference: Optional[str] = None
    private_notes: Optional[str] = None
    recording_url: Optional[str] = None
    summary: Optional[CallSummaryModel] = None
    transcripts: List[TranscriptItem] = []
    is_simulation: bool = False
    created_at: datetime

class ContactCreate(BaseModel):
    name: str
    phone_number: str
    organization: Optional[str] = None
    email: Optional[str] = None
    category: str = "General"
    importance: str = "Normal"
    is_trusted: bool = False
    custom_handling_notes: Optional[str] = None

class ContactResponse(ContactCreate):
    id: str
    created_at: datetime
    updated_at: datetime

class AssistantSettingsModel(BaseModel):
    assistant_name: str = "YAZHI"
    voice_personality: str = "Zephyr"
    primary_language: str = "English"
    opening_message: str = "Hello! Thank you for calling Sakthinathan Jayakumar. I'm YAZHI, his personal AI assistant. Sakthi is currently unavailable to take your call. May I know your name and how I can help you?"
    response_style: str = "Professional, intelligent, polite, confident and friendly"
    max_call_duration_seconds: int = 300
    conversation_timeout_seconds: int = 20
    collect_callback_info: bool = True
    priority_classification_enabled: bool = True
    approved_business_info: str = "Sakthinathan Jayakumar (Sakthi) is a technology architect, educator at Aegis Academy, and AI researcher."
    approved_faqs: List[Dict[str, str]] = []
    is_active: bool = True

class CallHandlingSettingsModel(BaseModel):
    ai_enabled: bool = True
    unanswered_forwarding_enabled: bool = True
    forwarding_timeout_seconds: int = 25
    telecom_provider: str = "Airtel India"
    forwarding_number: Optional[str] = None
    working_hours_start: str = "09:00"
    working_hours_end: str = "20:00"
    weekend_availability: bool = True
    emergency_bypass_enabled: bool = True
    emergency_keywords: List[str] = ["hospital", "accident", "medical emergency", "critical failure"]

class NotificationSettingsModel(BaseModel):
    telegram_enabled: bool = True
    telegram_bot_token: Optional[str] = None
    telegram_chat_id: Optional[str] = None
    notify_on_all_calls: bool = True
    notify_on_urgent_only: bool = False
    include_transcript_preview: bool = True

class DashboardStats(BaseModel):
    total_calls: int
    ai_answered_calls: int
    missed_calls: int
    important_calls: int
    urgent_calls: int
    average_duration_seconds: int
    total_ai_conversations: int
    system_status: Dict[str, str]

class ExotelIncomingWebhook(BaseModel):
    CallSid: str
    From: str
    To: str
    CallType: Optional[str] = None
    Direction: Optional[str] = None
    ForwardedFrom: Optional[str] = None
    Timestamp: Optional[str] = None

class ExotelStatusWebhook(BaseModel):
    CallSid: str
    Status: str
    Duration: Optional[int] = 0
    RecordingUrl: Optional[str] = None

class IntegrationTestResult(BaseModel):
    provider: str
    success: bool
    message: str
    latency_ms: Optional[float] = None
