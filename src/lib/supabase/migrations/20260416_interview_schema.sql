-- Create interview mode tables

-- 1. Question Bank
CREATE TABLE IF NOT EXISTS interview_question_bank (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company TEXT, -- "TCS", "Amazon", "Generic", etc.
    role TEXT, -- "Frontend", "Backend", "Full Stack", etc.
    year INTEGER,
    topic TEXT, -- "DSA", "Java", "HR", etc.
    question TEXT NOT NULL,
    expected_answer_points JSONB DEFAULT '[]',
    difficulty TEXT DEFAULT 'Medium', -- 'Easy', 'Medium', 'Hard'
    source_type TEXT DEFAULT 'Trend-based', -- 'Curated', 'Trend-based', 'AI-generated'
    source_confidence FLOAT DEFAULT 0.5,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Interview Sessions
CREATE TABLE IF NOT EXISTS interview_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    company TEXT DEFAULT 'Generic',
    difficulty TEXT DEFAULT 'Medium',
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'abandoned'
    round_type TEXT DEFAULT 'Mixed', -- 'HR', 'Technical', 'Behavioral', etc.
    current_question_index INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 5,
    final_report JSONB, -- Stores overall summary, scores, and readiness
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 3. Interview Responses (per-question)
CREATE TABLE IF NOT EXISTS interview_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    user_answer TEXT,
    audio_url TEXT,
    score FLOAT, -- 0-10
    technical_score FLOAT,
    communication_score FLOAT,
    confidence_score FLOAT,
    grammar_score FLOAT,
    feedback JSONB, -- { "short": "...", "detailed": "...", "grammar": "..." }
    hinglish_explanation TEXT,
    ideal_answer TEXT,
    is_follow_up BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_question_bank_company ON interview_question_bank(company);
CREATE INDEX IF NOT EXISTS idx_question_bank_role ON interview_question_bank(role);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_responses_session ON interview_responses(session_id);

-- RLS (Row Level Security)
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own interview sessions"
    ON interview_sessions
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own interview responses"
    ON interview_responses
    FOR ALL
    USING (auth.uid() = user_id);
