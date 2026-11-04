-- ==============================================================================
-- YAZHI – PERSONAL AI CALL ASSISTANT
-- Supabase PostgreSQL Schema & Security Architecture
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES / USERS TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL DEFAULT 'Sakthinathan Jayakumar',
    preferred_name TEXT NOT NULL DEFAULT 'Sakthi',
    phone_number TEXT NOT NULL DEFAULT '+919876543210',
    role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'viewer')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CONTACTS TABLE
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    organization TEXT,
    email TEXT,
    category TEXT NOT NULL DEFAULT 'General' CHECK (category IN ('Business', 'Aegis Academy', 'Professional', 'Internship', 'College', 'Personal', 'VIP', 'General')),
    importance TEXT NOT NULL DEFAULT 'Normal' CHECK (importance IN ('Low', 'Normal', 'High', 'VIP')),
    is_trusted BOOLEAN NOT NULL DEFAULT FALSE,
    custom_handling_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_contact_phone_owner UNIQUE (owner_id, phone_number)
);

-- Index for phone lookups on incoming calls
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone_number);
CREATE INDEX IF NOT EXISTS idx_contacts_owner ON contacts(owner_id);

-- 3. CALLS TABLE
CREATE TABLE IF NOT EXISTS calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    exotel_call_sid TEXT UNIQUE,
    caller_phone TEXT NOT NULL,
    caller_name TEXT,
    organization TEXT,
    call_start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    call_end_time TIMESTAMPTZ,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'AI Answered' CHECK (status IN ('AI Answered', 'Owner Answered', 'Missed', 'Failed', 'Completed', 'Transferred', 'In Progress')),
    category TEXT NOT NULL DEFAULT 'Enquiry' CHECK (category IN ('Business', 'Aegis Academy', 'Professional Opportunities', 'Internship', 'College Related', 'Project Collaboration', 'Events', 'Personal', 'Urgent Matters', 'Enquiry', 'Spam')),
    priority TEXT NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('URGENT', 'HIGH', 'NORMAL', 'LOW')),
    callback_requested BOOLEAN NOT NULL DEFAULT FALSE,
    callback_preference TEXT,
    private_notes TEXT,
    recording_url TEXT,
    recording_consent_obtained BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calls_caller_phone ON calls(caller_phone);
CREATE INDEX IF NOT EXISTS idx_calls_priority ON calls(priority);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at DESC);

-- 4. CALL SUMMARIES TABLE
CREATE TABLE IF NOT EXISTS call_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    purpose TEXT NOT NULL,
    key_points TEXT[] NOT NULL DEFAULT '{}',
    action_items TEXT[] NOT NULL DEFAULT '{}',
    caller_sentiment TEXT DEFAULT 'Neutral',
    summary_text TEXT NOT NULL,
    urgency_reason TEXT,
    generated_by_model TEXT NOT NULL DEFAULT 'gemini-3.8-flash',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_call_summaries_call_id ON call_summaries(call_id);

-- 5. CALL TRANSCRIPTS TABLE
CREATE TABLE IF NOT EXISTS call_transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    speaker TEXT NOT NULL CHECK (speaker IN ('caller', 'assistant', 'system')),
    content TEXT NOT NULL,
    timestamp_offset_ms INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_call_transcripts_call_id ON call_transcripts(call_id);

-- 6. ASSISTANT SETTINGS TABLE
CREATE TABLE IF NOT EXISTS assistant_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assistant_name TEXT NOT NULL DEFAULT 'YAZHI',
    voice_personality TEXT NOT NULL DEFAULT 'Zephyr' CHECK (voice_personality IN ('Zephyr', 'Puck', 'Charon', 'Fenrir', 'Kore')),
    primary_language TEXT NOT NULL DEFAULT 'English',
    opening_message TEXT NOT NULL DEFAULT 'Hello! Thank you for calling Sakthinathan Jayakumar. I''m YAZHI, his personal AI assistant. Sakthi is currently unavailable to take your call. May I know your name and how I can help you?',
    response_style TEXT NOT NULL DEFAULT 'Professional and concise',
    max_call_duration_seconds INTEGER NOT NULL DEFAULT 300,
    conversation_timeout_seconds INTEGER NOT NULL DEFAULT 20,
    collect_callback_info BOOLEAN NOT NULL DEFAULT TRUE,
    priority_classification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    approved_business_info TEXT DEFAULT 'Sakthinathan Jayakumar (Sakthi) is a technology architect, educator at Aegis Academy, and AI researcher. He is open to professional collaboration, student mentorship, and strategic engineering projects.',
    approved_faqs JSONB DEFAULT '[
        {"q": "What is Aegis Academy?", "a": "Aegis Academy is Sakthi''s premier technical education and mentorship academy focusing on advanced software and AI."},
        {"q": "Is Sakthi accepting new internships?", "a": "Yes, Sakthi reviews student internship applications for Aegis Academy and research projects based on merit."},
        {"q": "Can Sakthi take urgent calls?", "a": "Sakthi takes urgent matters when notified through YAZHI with high priority categorization."}
    ]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. CALL HANDLING CONFIGURATION TABLE
CREATE TABLE IF NOT EXISTS call_handling_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    ai_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    unanswered_forwarding_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    forwarding_timeout_seconds INTEGER NOT NULL DEFAULT 25,
    telecom_provider TEXT NOT NULL DEFAULT 'Airtel India',
    forwarding_number TEXT,
    working_hours_start TIME NOT NULL DEFAULT '09:00:00',
    working_hours_end TIME NOT NULL DEFAULT '20:00:00',
    weekend_availability BOOLEAN NOT NULL DEFAULT TRUE,
    emergency_bypass_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    emergency_keyword_trigger TEXT[] DEFAULT ARRAY['hospital', 'accident', 'medical emergency', 'critical failure', 'immediate family'],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. NOTIFICATION SETTINGS TABLE
CREATE TABLE IF NOT EXISTS notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    telegram_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    telegram_bot_token_encrypted TEXT,
    telegram_chat_id TEXT,
    notify_on_all_calls BOOLEAN NOT NULL DEFAULT TRUE,
    notify_on_urgent_only BOOLEAN NOT NULL DEFAULT FALSE,
    include_transcript_preview BOOLEAN NOT NULL DEFAULT TRUE,
    send_audio_recording BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. INTEGRATION CREDENTIALS TABLE (Encrypted / Server Protected)
CREATE TABLE IF NOT EXISTS integration_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('gemini', 'exotel', 'supabase', 'telegram')),
    is_configured BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'Disconnected' CHECK (status IN ('Connected', 'Disconnected', 'Error')),
    last_tested_at TIMESTAMPTZ,
    test_result_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_owner_provider UNIQUE (owner_id, provider)
);

-- 10. ACTIVITY LOGS AUDIT TRAIL
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_handling_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Owner has access to own data
CREATE POLICY "Owner profiles access" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Owner contacts access" ON contacts FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Owner calls access" ON calls FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Owner call_summaries access" ON call_summaries FOR ALL USING (
    EXISTS (SELECT 1 FROM calls WHERE calls.id = call_summaries.call_id AND calls.owner_id = auth.uid())
);
CREATE POLICY "Owner call_transcripts access" ON call_transcripts FOR ALL USING (
    EXISTS (SELECT 1 FROM calls WHERE calls.id = call_transcripts.call_id AND calls.owner_id = auth.uid())
);
CREATE POLICY "Owner assistant_settings access" ON assistant_settings FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Owner call_handling access" ON call_handling_settings FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Owner notification_settings access" ON notification_settings FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Owner integration_settings access" ON integration_settings FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Owner activity_logs access" ON activity_logs FOR ALL USING (auth.uid() = owner_id);

-- ==============================================================================
-- SEED DATA FOR SAKTHINATHAN JAYAKUMAR
-- ==============================================================================
INSERT INTO profiles (id, email, full_name, preferred_name, phone_number, role)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'sakthisakthi7791@gmail.com',
    'Sakthinathan Jayakumar',
    'Sakthi',
    '+919840000000',
    'owner'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO assistant_settings (owner_id, assistant_name, voice_personality, opening_message, response_style)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'YAZHI',
    'Zephyr',
    'Hello! Thank you for calling Sakthinathan Jayakumar. I''m YAZHI, his personal AI assistant. Sakthi is currently unavailable to take your call. May I know your name and how I can help you?',
    'Professional, intelligent, polite, confident and friendly'
) ON CONFLICT DO NOTHING;

INSERT INTO call_handling_settings (owner_id, ai_enabled, unanswered_forwarding_enabled, forwarding_timeout_seconds)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    TRUE,
    TRUE,
    25
) ON CONFLICT DO NOTHING;

INSERT INTO notification_settings (owner_id, telegram_enabled, notify_on_all_calls, include_transcript_preview)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    TRUE,
    TRUE,
    TRUE
) ON CONFLICT DO NOTHING;

INSERT INTO integration_settings (owner_id, provider, is_configured, status)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'gemini', TRUE, 'Connected'),
    ('00000000-0000-0000-0000-000000000001', 'exotel', FALSE, 'Disconnected'),
    ('00000000-0000-0000-0000-000000000001', 'supabase', FALSE, 'Disconnected'),
    ('00000000-0000-0000-0000-000000000001', 'telegram', FALSE, 'Disconnected')
ON CONFLICT DO NOTHING;
