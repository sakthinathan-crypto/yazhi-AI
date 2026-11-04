"""
Intelligent Call Summarization and Priority Classification Engine.
Leverages Gemini 3.8 Flash to generate structured, actionable briefings.
"""
import json
import logging
from typing import List, Dict, Any, Optional

from app.config import settings
from app.models.schemas import CallSummaryModel, TranscriptItem, PriorityLevel

logger = logging.getLogger("yazhi.ai.summarizer")

SUMMARY_SYSTEM_INSTRUCTION = """
You are an executive call analyst and intelligence officer for Sakthinathan Jayakumar (Sakthi).
Your job is to analyze the full transcript of a telephone call handled by YAZHI (his AI assistant) and produce an accurate, structured JSON summary.

OWNER PROFILE:
- Full Name: Sakthinathan Jayakumar
- Professional Name: Sakthi
- Organizations: Aegis Academy (Founder/Educator), AI Research & Engineering Collaborations.

PRIORITY CRITERIA:
- URGENT: Life/safety emergency, confirmed hospital admission of close family/friend, critical infrastructure catastrophic failure requiring immediate intervention, irreversible same-day legal or financial deadline.
- HIGH: High-value enterprise business deal, key partner meeting request, Aegis Academy VIP inquiry, candidate for senior role, time-sensitive collaboration with clear deadline within 24-48 hours.
- NORMAL: Standard student questions, general internship inquiries, routine networking, event invitations, follow-ups on past discussions.
- LOW: Telemarketers, unsolicited sales pitches, vague or non-specific inquiries, wrong numbers.

IMPORTANT:
Never classify a call as URGENT merely because the caller demanded urgent attention or spoke aggressively. Evaluate the actual factual content.
"""

def generate_heuristic_summary(
    caller_phone: str,
    caller_name: Optional[str],
    organization: Optional[str],
    transcripts: List[TranscriptItem]
) -> CallSummaryModel:
    """
    Fallback deterministic summarizer when Gemini API is offline or during offline testing.
    """
    combined_text = " ".join([t.content.lower() for t in transcripts])
    
    # Priority detection
    urgent_keywords = ["emergency", "hospital", "critical", "accident", "immediate", "urgent"]
    high_keywords = ["partnership", "contract", "internship", "aegis academy", "investor", "client", "collaboration", "opportunity"]
    
    priority: PriorityLevel = "NORMAL"
    urgency_reason = None
    
    if any(k in combined_text for k in urgent_keywords):
        priority = "URGENT"
        urgency_reason = "Caller mentioned emergency or time-critical matter."
    elif any(k in combined_text for k in high_keywords):
        priority = "HIGH"
        urgency_reason = "High-priority professional, Aegis Academy, or business inquiry."
    elif "loan" in combined_text or "credit card" in combined_text or "buy insurance" in combined_text:
        priority = "LOW"
        urgency_reason = "Commercial telemarketing or cold promotion."

    # Callback detection
    callback_requested = "call back" in combined_text or "callback" in combined_text or "reach sakthi" in combined_text
    
    # Category detection
    category = "General"
    if "internship" in combined_text:
        category = "Internship"
    elif "aegis" in combined_text or "course" in combined_text or "training" in combined_text:
        category = "Aegis Academy"
    elif "business" in combined_text or "project" in combined_text:
        category = "Business"
    elif "college" in combined_text or "exam" in combined_text or "degree" in combined_text:
        category = "College Related"

    name_str = caller_name or "The caller"
    org_str = f" from {organization}" if organization else ""

    return CallSummaryModel(
        purpose=f"Enquiry regarding {category.lower()} matters by {name_str}{org_str}.",
        key_points=[
            f"Caller identified as {name_str}{org_str}.",
            f"Discussed {category} topic with YAZHI.",
            "Contact number verified."
        ],
        action_items=[
            "Review call transcript" if not callback_requested else f"Schedule callback to {caller_phone} at convenient time.",
            "Verify contact in YAZHI directory"
        ],
        caller_sentiment="Professional & Courteous",
        summary_text=f"{name_str}{org_str} reached out regarding {category}. YAZHI gathered caller details and explained Sakthi's current unavailability. Call marked as {priority} priority.",
        urgency_reason=urgency_reason,
        priority=priority,
        callback_requested=callback_requested,
        callback_preference="Morning" if "morning" in combined_text else "As soon as available",
        category=category
    )

async def summarize_call(
    caller_phone: str,
    caller_name: Optional[str],
    organization: Optional[str],
    transcripts: List[TranscriptItem]
) -> CallSummaryModel:
    """
    Summarizes a call using Gemini 3.8 Flash with structured JSON output.
    Gracefully falls back to heuristic engine if API key is unconfigured.
    """
    if not settings.GEMINI_API_KEY or len(transcripts) == 0:
        return generate_heuristic_summary(caller_phone, caller_name, organization, transcripts)

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        transcript_formatted = "\n".join([f"{t.speaker.upper()}: {t.content}" for t in transcripts])
        
        prompt = f"""
Caller Phone: {caller_phone}
Caller Identified Name: {caller_name or 'Unknown'}
Caller Organization: {organization or 'Unknown'}

Transcript:
{transcript_formatted}

Generate a concise, high-impact summary following the required JSON schema.
"""
        response = client.models.generate_content(
            model=settings.GEMINI_SUMMARY_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SUMMARY_SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
            )
        )

        data = json.loads(response.text)
        return CallSummaryModel(
            purpose=data.get("purpose", f"Call from {caller_name or caller_phone}"),
            key_points=data.get("key_points", []),
            action_items=data.get("action_items", []),
            caller_sentiment=data.get("caller_sentiment", "Neutral"),
            summary_text=data.get("summary_text", "Call handled by YAZHI."),
            urgency_reason=data.get("urgency_reason"),
            priority=data.get("priority", "NORMAL"),
            callback_requested=data.get("callback_requested", False),
            callback_preference=data.get("callback_preference"),
            category=data.get("category", "General")
        )
    except Exception as exc:
        logger.warning(f"Gemini summarization encountered error: {exc}. Using fallback summarizer.")
        return generate_heuristic_summary(caller_phone, caller_name, organization, transcripts)
