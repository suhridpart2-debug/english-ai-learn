-- SQL Setup for AI Conversation Buddy Module

-- 1. Create conversation_sessions table
CREATE TABLE IF NOT EXISTS conversation_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    persona VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create conversation_messages table
CREATE TABLE IF NOT EXISTS conversation_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES conversation_sessions(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'agent')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create conversation_feedback table
CREATE TABLE IF NOT EXISTS conversation_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES conversation_messages(id) ON DELETE CASCADE UNIQUE NOT NULL,
    session_id UUID REFERENCES conversation_sessions(id) ON DELETE CASCADE NOT NULL,
    grammar_correction TEXT,
    better_sentence TEXT,
    vocabulary_improvement TEXT,
    hinglish_explanation TEXT,
    fluency_score INTEGER DEFAULT 0,
    confidence_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies for conversation_sessions
ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversation sessions" 
    ON conversation_sessions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversation sessions" 
    ON conversation_sessions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversation sessions" 
    ON conversation_sessions FOR UPDATE 
    USING (auth.uid() = user_id);

-- RLS Policies for conversation_messages
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from their sessions" 
    ON conversation_messages FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM conversation_sessions 
        WHERE conversation_sessions.id = conversation_messages.session_id 
        AND conversation_sessions.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert messages into their sessions" 
    ON conversation_messages FOR INSERT 
    WITH CHECK (EXISTS (
        SELECT 1 FROM conversation_sessions 
        WHERE conversation_sessions.id = conversation_messages.session_id 
        AND conversation_sessions.user_id = auth.uid()
    ));

-- RLS Policies for conversation_feedback
ALTER TABLE conversation_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view feedback from their sessions" 
    ON conversation_feedback FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM conversation_sessions 
        WHERE conversation_sessions.id = conversation_feedback.session_id 
        AND conversation_sessions.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert feedback into their sessions" 
    ON conversation_feedback FOR INSERT 
    WITH CHECK (EXISTS (
        SELECT 1 FROM conversation_sessions 
        WHERE conversation_sessions.id = conversation_feedback.session_id 
        AND conversation_sessions.user_id = auth.uid()
    ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_user_id ON conversation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_session_id ON conversation_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_feedback_message_id ON conversation_feedback(message_id);
CREATE INDEX IF NOT EXISTS idx_conversation_feedback_session_id ON conversation_feedback(session_id);

-- Add updated_at trigger for conversation_sessions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_conversation_sessions_updated_at on conversation_sessions;

CREATE TRIGGER update_conversation_sessions_updated_at
BEFORE UPDATE ON conversation_sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
