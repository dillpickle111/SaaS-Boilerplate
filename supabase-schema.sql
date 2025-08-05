-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Questions table
CREATE TABLE questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question_id VARCHAR(255) UNIQUE NOT NULL,
    external_id VARCHAR(255),
    skill_cd VARCHAR(50) NOT NULL,
    skill_desc TEXT NOT NULL,
    primary_class_cd VARCHAR(50) NOT NULL,
    primary_class_cd_desc VARCHAR(255) NOT NULL,
    difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('E', 'M', 'H')),
    module VARCHAR(50) NOT NULL CHECK (module IN ('math', 'reading', 'writing')),
    content JSONB NOT NULL,
    program VARCHAR(50) NOT NULL DEFAULT 'SAT',
    score_band_range_cd INTEGER NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress table
CREATE TABLE user_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    question_id VARCHAR(255) NOT NULL REFERENCES questions(question_id),
    is_correct BOOLEAN NOT NULL,
    time_spent INTEGER NOT NULL, -- in seconds
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_answer TEXT,
    UNIQUE(user_id, question_id)
);

-- Practice sessions table
CREATE TABLE practice_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('timed', 'untimed', 'review')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('math', 'reading', 'writing', 'mixed')),
    question_count INTEGER NOT NULL,
    time_limit INTEGER, -- in seconds, NULL for untimed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Session questions junction table
CREATE TABLE session_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
    question_id VARCHAR(255) NOT NULL REFERENCES questions(question_id),
    order_index INTEGER NOT NULL,
    is_correct BOOLEAN,
    time_spent INTEGER, -- in seconds
    user_answer TEXT,
    answered_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(session_id, question_id)
);

-- Indexes for better performance
CREATE INDEX idx_questions_module ON questions(module);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_skill_cd ON questions(skill_cd);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_question_id ON user_progress(question_id);
CREATE INDEX idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX idx_session_questions_session_id ON session_questions(session_id);

-- Row Level Security (RLS) policies
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_questions ENABLE ROW LEVEL SECURITY;

-- Questions: Read access for all authenticated users
CREATE POLICY "Questions are viewable by authenticated users" ON questions
    FOR SELECT USING (auth.role() = 'authenticated');

-- User progress: Users can only see their own progress
CREATE POLICY "Users can view own progress" ON user_progress
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Practice sessions: Users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON practice_sessions
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own sessions" ON practice_sessions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own sessions" ON practice_sessions
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Session questions: Users can only see questions from their own sessions
CREATE POLICY "Users can view own session questions" ON session_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM practice_sessions 
            WHERE practice_sessions.id = session_questions.session_id 
            AND practice_sessions.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert own session questions" ON session_questions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM practice_sessions 
            WHERE practice_sessions.id = session_questions.session_id 
            AND practice_sessions.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update own session questions" ON session_questions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM practice_sessions 
            WHERE practice_sessions.id = session_questions.session_id 
            AND practice_sessions.user_id = auth.uid()::text
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_questions_updated_at 
    BEFORE UPDATE ON questions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 