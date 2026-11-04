"""
Call Lifecycle Orchestrator for YAZHI.
Coordinates call creation, real-time audio sessions, transcription,
Gemini structured summarization, and Telegram notifications.
"""
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List

from app.database.supabase_client import db_repository
from app.ai.summarizer import summarize_call
from app.notifications.telegram_bot import telegram_service
from app.models.schemas import (
    CallCreate, CallUpdate, CallResponse, TranscriptItem,
    CallSummaryModel, DashboardStats
)

logger = logging.getLogger("yazhi.services.call")

class CallService:
    """
    Coordinates the lifecycle of live and simulated incoming calls.
    """

    async def initiate_incoming_call(
        self,
        caller_phone: str,
        caller_name: Optional[str] = None,
        organization: Optional[str] = None,
        exotel_call_sid: Optional[str] = None,
        is_simulation: bool = False
    ) -> CallResponse:
        """
        Invoked when Exotel forwards an unanswered call or when user initiates a simulation.
        """
        # Lookup caller in contacts if name is not provided
        if not caller_name:
            contacts = await db_repository.get_contacts()
            for c in contacts:
                if c.phone_number.replace("+", "").replace(" ", "") in caller_phone.replace("+", "").replace(" ", ""):
                    caller_name = c.name
                    organization = c.organization
                    break

        call_in = CallCreate(
            caller_phone=caller_phone,
            caller_name=caller_name,
            organization=organization,
            status="In Progress",
            category="Enquiry",
            priority="NORMAL",
            exotel_call_sid=exotel_call_sid,
            is_simulation=is_simulation
        )
        call = await db_repository.create_call(call_in)
        
        # Add initial assistant greeting to transcript
        greeting = (
            "Hello! Thank you for calling Sakthinathan Jayakumar. I'm YAZHI, his personal AI assistant. "
            "Sakthi is currently unavailable to take your call. May I know your name and how I can help you?"
        )
        await db_repository.add_transcript(
            call.id,
            TranscriptItem(speaker="assistant", content=greeting, timestamp_offset_ms=0)
        )
        return call

    async def record_dialogue_turn(self, call_id: str, speaker: str, content: str, offset_ms: int = 0):
        """Records an audio transcript turn from caller or YAZHI."""
        await db_repository.add_transcript(
            call_id,
            TranscriptItem(speaker=speaker, content=content, timestamp_offset_ms=offset_ms)
        )

    async def complete_call(
        self,
        call_id: str,
        duration_seconds: int,
        status: str = "AI Answered"
    ) -> Optional[CallResponse]:
        """
        Finalizes call: runs Gemini structured summarizer, stores summary, and sends Telegram alert.
        """
        call = await db_repository.get_call(call_id)
        if not call:
            return None

        now = datetime.now(timezone.utc)
        
        # Run AI summarizer on accumulated transcripts
        summary = await summarize_call(
            caller_phone=call.caller_phone,
            caller_name=call.caller_name,
            organization=call.organization,
            transcripts=call.transcripts
        )

        # Update call record
        update = CallUpdate(
            status=status,
            priority=summary.priority,
            duration_seconds=duration_seconds,
            call_end_time=now,
            callback_requested=summary.callback_requested
        )
        updated_call = await db_repository.update_call(call_id, update)
        await db_repository.attach_summary(call_id, summary)

        # Dispatch instant Telegram alert to Sakthi
        try:
            await telegram_service.send_call_summary(
                caller_name=call.caller_name,
                caller_phone=call.caller_phone,
                organization=call.organization,
                duration_seconds=duration_seconds,
                summary=summary,
                is_simulation=call.is_simulation
            )
        except Exception as exc:
            logger.warning(f"Failed to dispatch Telegram summary: {exc}")

        return await db_repository.get_call(call_id)

    async def get_dashboard_stats(self) -> DashboardStats:
        """Computes comprehensive dashboard KPIs for Sakthi."""
        calls = await db_repository.get_calls(limit=500)
        
        total_calls = len(calls)
        ai_answered = sum(1 for c in calls if c.status in ("AI Answered", "Completed"))
        missed = sum(1 for c in calls if c.status == "Missed")
        urgent = sum(1 for c in calls if c.priority == "URGENT")
        important = sum(1 for c in calls if c.priority in ("URGENT", "HIGH"))
        
        durations = [c.duration_seconds for c in calls if c.duration_seconds > 0]
        avg_duration = int(sum(durations) / len(durations)) if durations else 0

        # Integration status checks
        # Never display Connected unless actually configured
        from app.config import settings
        system_status = {
            "gemini": "Connected" if bool(settings.GEMINI_API_KEY) else "Disconnected",
            "telephony": "Connected" if bool(settings.EXOTEL_ACCOUNT_SID and settings.EXOTEL_API_KEY) else "Disconnected",
            "database": "Connected" if bool(settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY) else "Disconnected",
            "telegram": "Connected" if bool(settings.TELEGRAM_BOT_TOKEN and settings.TELEGRAM_CHAT_ID) else "Disconnected"
        }

        return DashboardStats(
            total_calls=total_calls,
            ai_answered_calls=ai_answered,
            missed_calls=missed,
            important_calls=important,
            urgent_calls=urgent,
            average_duration_seconds=avg_duration,
            total_ai_conversations=ai_answered,
            system_status=system_status
        )

call_service = CallService()
