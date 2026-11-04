"""
Supabase PostgreSQL Database Client & Repository.
Includes resilient in-memory fallback for immediate operation before DB provisioning.
"""
import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
import httpx

from app.config import settings
from app.models.schemas import (
    CallResponse, CallCreate, CallUpdate, CallSummaryModel,
    ContactResponse, ContactCreate, TranscriptItem, AssistantSettingsModel,
    CallHandlingSettingsModel, NotificationSettingsModel
)

logger = logging.getLogger("yazhi.database.supabase")

class SupabaseRepository:
    """
    Manages data persistence with Supabase PostgreSQL and provides
    in-memory cache/mock records when Supabase keys are pending.
    """

    def __init__(self):
        self.supabase_url = settings.SUPABASE_URL
        self.supabase_anon_key = settings.SUPABASE_ANON_KEY
        self.supabase_service_key = settings.SUPABASE_SERVICE_ROLE_KEY
        
        # In-memory storage for active demo and offline support
        self._calls: Dict[str, CallResponse] = {}
        self._contacts: Dict[str, ContactResponse] = {}
        self._assistant_settings = AssistantSettingsModel()
        self._handling_settings = CallHandlingSettingsModel()
        self._notification_settings = NotificationSettingsModel()
        
        # Seed realistic initial records
        self._seed_initial_data()

    def is_configured(self) -> bool:
        return bool(self.supabase_url and (self.supabase_anon_key or self.supabase_service_key))

    async def test_connection(self) -> Dict[str, Any]:
        """Tests connection to Supabase REST / Auth endpoint."""
        if not self.is_configured():
            return {
                "success": False,
                "message": "Supabase URL and API keys are not configured in environment."
            }

        headers = {
            "apikey": self.supabase_service_key or self.supabase_anon_key,
            "Authorization": f"Bearer {self.supabase_service_key or self.supabase_anon_key}"
        }
        test_url = f"{self.supabase_url}/rest/v1/profiles?select=count"
        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                res = await client.get(test_url, headers=headers)
                if res.status_code in (200, 206):
                    return {
                        "success": True,
                        "message": "Successfully connected to Supabase PostgreSQL database."
                    }
                else:
                    return {
                        "success": False,
                        "message": f"Supabase responded with code {res.status_code}: {res.text}"
                    }
        except Exception as exc:
            return {
                "success": False,
                "message": f"Supabase connection test failed: {str(exc)}"
            }

    def _seed_initial_data(self):
        """Populates realistic initial contacts and calls for Sakthi."""
        now = datetime.now(timezone.utc)
        
        # Seed Contacts
        c1 = ContactResponse(
            id=str(uuid.uuid4()),
            name="Dr. Sundaramoorthy",
            phone_number="+919840123456",
            organization="Anna University / Aegis Partner",
            email="sundar@annauniv.edu",
            category="College",
            importance="High",
            is_trusted=True,
            custom_handling_notes="Academic dean; flag calls immediately.",
            created_at=now - timedelta(days=10),
            updated_at=now - timedelta(days=10)
        )
        c2 = ContactResponse(
            id=str(uuid.uuid4()),
            name="Priya Raman",
            phone_number="+919712345678",
            organization="HyperScale Cloud Labs",
            email="priya@hyperscalelabs.io",
            category="Business",
            importance="High",
            is_trusted=True,
            custom_handling_notes="Enterprise client discussing AI infrastructure contract.",
            created_at=now - timedelta(days=5),
            updated_at=now - timedelta(days=5)
        )
        c3 = ContactResponse(
            id=str(uuid.uuid4()),
            name="Kavitha M.",
            phone_number="+919884567890",
            organization="Aegis Academy Student Lead",
            email="kavitha@aegis.ac",
            category="Aegis Academy",
            importance="Normal",
            is_trusted=True,
            custom_handling_notes="Student coordinator for upcoming AI Hackathon.",
            created_at=now - timedelta(days=2),
            updated_at=now - timedelta(days=2)
        )
        self._contacts[c1.id] = c1
        self._contacts[c2.id] = c2
        self._contacts[c3.id] = c3

        # Seed realistic calls
        call1_id = str(uuid.uuid4())
        self._calls[call1_id] = CallResponse(
            id=call1_id,
            caller_phone="+919712345678",
            caller_name="Priya Raman",
            organization="HyperScale Cloud Labs",
            call_start_time=now - timedelta(hours=2, minutes=15),
            call_end_time=now - timedelta(hours=2, minutes=12),
            duration_seconds=165,
            status="AI Answered",
            category="Business",
            priority="HIGH",
            callback_requested=True,
            callback_preference="Today evening after 5 PM",
            private_notes="Discussed contract addendum. Sakthi needs to review proposal PDF.",
            recording_url=None,
            summary=CallSummaryModel(
                purpose="Urgent review of revised AI deployment SLA terms.",
                key_points=[
                    "HyperScale is finalizing their quarterly vendor onboarding.",
                    "Requested a brief 10-minute check-in with Sakthi.",
                    "Confirmed proposal document was emailed to Sakthi."
                ],
                action_items=[
                    "Sakthi to review HyperScale proposal in inbox.",
                    "Callback requested for today evening."
                ],
                caller_sentiment="Professional & Warm",
                summary_text="Priya Raman from HyperScale called regarding final SLA sign-off. YAZHI gathered requirements and noted callback request for this evening.",
                urgency_reason="Quarterly enterprise billing closes tomorrow.",
                priority="HIGH",
                callback_requested=True,
                callback_preference="Today evening after 5 PM",
                category="Business"
            ),
            transcripts=[
                TranscriptItem(speaker="assistant", content="Hello! Thank you for calling Sakthinathan Jayakumar. I'm YAZHI, his personal AI assistant. Sakthi is currently unavailable to take your call. May I know your name and how I can help you?"),
                TranscriptItem(speaker="caller", content="Hi YAZHI, this is Priya Raman from HyperScale Cloud Labs. I'm calling for Sakthi regarding our AI deployment contract terms."),
                TranscriptItem(speaker="assistant", content="Hello Priya. Thank you for reaching out. Sakthi is currently in a deep work session. Could you share the key update you'd like me to pass along?"),
                TranscriptItem(speaker="caller", content="Our executive team accepted his proposed revisions. We just need him to review the final addendum before 6 PM today so we can activate the cluster."),
                TranscriptItem(speaker="assistant", content="Understood. I will mark this as a high priority item and notify Sakthi immediately with your callback request for this evening. Is there anything else you'd like me to pass along?"),
                TranscriptItem(speaker="caller", content="No, that is perfect YAZHI. Thank you so much!"),
                TranscriptItem(speaker="assistant", content="You're welcome Priya. Have a great day!")
            ],
            is_simulation=False,
            created_at=now - timedelta(hours=2, minutes=15)
        )

        call2_id = str(uuid.uuid4())
        self._calls[call2_id] = CallResponse(
            id=call2_id,
            caller_phone="+919884567890",
            caller_name="Kavitha M.",
            organization="Aegis Academy",
            call_start_time=now - timedelta(hours=5),
            call_end_time=now - timedelta(hours=4, minutes=57),
            duration_seconds=142,
            status="Completed",
            category="Aegis Academy",
            priority="NORMAL",
            callback_requested=False,
            callback_preference=None,
            private_notes="Hackathon venue confirmed with student council.",
            recording_url=None,
            summary=CallSummaryModel(
                purpose="Update on Aegis Academy upcoming AI Hackathon registration numbers.",
                key_points=[
                    "Registrations crossed 240 students across 6 engineering colleges.",
                    "Requested Sakthi's confirmation on jury panel guidelines."
                ],
                action_items=[
                    "Review Hackathon problem statements draft when free."
                ],
                caller_sentiment="Enthusiastic",
                summary_text="Kavitha updated YAZHI that 240 students enrolled for the Aegis AI Hackathon. No urgent callback needed.",
                urgency_reason=None,
                priority="NORMAL",
                callback_requested=False,
                category="Aegis Academy"
            ),
            transcripts=[
                TranscriptItem(speaker="assistant", content="Hello! Thank you for calling Sakthinathan Jayakumar. I'm YAZHI, his personal AI assistant. May I know your name and how I can help you?"),
                TranscriptItem(speaker="caller", content="Hi YAZHI, it's Kavitha from Aegis Academy. Just wanted to let Sakthi know that registration crossed our target of 200 participants."),
                TranscriptItem(speaker="assistant", content="That's wonderful news Kavitha! I have noted the registration milestone and will include it in Sakthi's daily briefing.")
            ],
            is_simulation=False,
            created_at=now - timedelta(hours=5)
        )

        call3_id = str(uuid.uuid4())
        self._calls[call3_id] = CallResponse(
            id=call3_id,
            caller_phone="+918012399999",
            caller_name="Rohit Sharma",
            organization="QuickFin Loans",
            call_start_time=now - timedelta(hours=8),
            call_end_time=now - timedelta(hours=7, minutes=59),
            duration_seconds=48,
            status="AI Answered",
            category="Spam",
            priority="LOW",
            callback_requested=False,
            callback_preference=None,
            private_notes="Unsolicited business loan offer blocked.",
            recording_url=None,
            summary=CallSummaryModel(
                purpose="Unsolicited pre-approved loan cold call.",
                key_points=["Caller offered commercial line of credit."],
                action_items=["No action required."],
                caller_sentiment="Promotional",
                summary_text="Cold marketing call from QuickFin offering credit lines. YAZHI declined politely and ended the call.",
                urgency_reason=None,
                priority="LOW",
                callback_requested=False,
                category="Spam"
            ),
            transcripts=[],
            is_simulation=False,
            created_at=now - timedelta(hours=8)
        )

    # Call CRUD
    async def get_calls(self, limit: int = 50, priority: Optional[str] = None, category: Optional[str] = None) -> List[CallResponse]:
        calls = list(self._calls.values())
        if priority:
            calls = [c for c in calls if c.priority == priority]
        if category:
            calls = [c for c in calls if c.category == category]
        return sorted(calls, key=lambda x: x.created_at, reverse=True)[:limit]

    async def get_call(self, call_id: str) -> Optional[CallResponse]:
        return self._calls.get(call_id)

    async def create_call(self, call_in: CallCreate) -> CallResponse:
        call_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        new_call = CallResponse(
            id=call_id,
            caller_phone=call_in.caller_phone,
            caller_name=call_in.caller_name,
            organization=call_in.organization,
            call_start_time=now,
            status=call_in.status,
            category=call_in.category,
            priority=call_in.priority,
            exotel_call_sid=call_in.exotel_call_sid,
            is_simulation=call_in.is_simulation,
            created_at=now
        )
        self._calls[call_id] = new_call
        return new_call

    async def update_call(self, call_id: str, update: CallUpdate) -> Optional[CallResponse]:
        call = self._calls.get(call_id)
        if not call:
            return None
        
        updated_dict = call.model_dump()
        for field, value in update.model_dump(exclude_unset=True).items():
            updated_dict[field] = value
        
        updated_call = CallResponse(**updated_dict)
        self._calls[call_id] = updated_call
        return updated_call

    async def delete_call(self, call_id: str) -> bool:
        if call_id in self._calls:
            del self._calls[call_id]
            return True
        return False

    async def attach_summary(self, call_id: str, summary: CallSummaryModel):
        if call_id in self._calls:
            self._calls[call_id].summary = summary
            self._calls[call_id].priority = summary.priority
            self._calls[call_id].category = summary.category
            self._calls[call_id].callback_requested = summary.callback_requested
            self._calls[call_id].callback_preference = summary.callback_preference

    async def add_transcript(self, call_id: str, item: TranscriptItem):
        if call_id in self._calls:
            self._calls[call_id].transcripts.append(item)

    # Contacts CRUD
    async def get_contacts(self) -> List[ContactResponse]:
        return sorted(list(self._contacts.values()), key=lambda x: x.name)

    async def create_contact(self, contact_in: ContactCreate) -> ContactResponse:
        cid = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        new_contact = ContactResponse(
            id=cid,
            **contact_in.model_dump(),
            created_at=now,
            updated_at=now
        )
        self._contacts[cid] = new_contact
        return new_contact

    async def update_contact(self, contact_id: str, contact_in: ContactCreate) -> Optional[ContactResponse]:
        if contact_id not in self._contacts:
            return None
        now = datetime.now(timezone.utc)
        updated = ContactResponse(
            id=contact_id,
            **contact_in.model_dump(),
            created_at=self._contacts[contact_id].created_at,
            updated_at=now
        )
        self._contacts[contact_id] = updated
        return updated

    async def delete_contact(self, contact_id: str) -> bool:
        if contact_id in self._contacts:
            del self._contacts[contact_id]
            return True
        return False

    # Settings
    async def get_assistant_settings(self) -> AssistantSettingsModel:
        return self._assistant_settings

    async def update_assistant_settings(self, new_settings: AssistantSettingsModel) -> AssistantSettingsModel:
        self._assistant_settings = new_settings
        return self._assistant_settings

    async def get_handling_settings(self) -> CallHandlingSettingsModel:
        return self._handling_settings

    async def update_handling_settings(self, new_settings: CallHandlingSettingsModel) -> CallHandlingSettingsModel:
        self._handling_settings = new_settings
        return self._handling_settings

    async def get_notification_settings(self) -> NotificationSettingsModel:
        return self._notification_settings

db_repository = SupabaseRepository()
