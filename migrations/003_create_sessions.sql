CREATE TABLE
    IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        template_id UUID REFERENCES workout_templates (id) ON DELETE SET NULL,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW ()
    );

CREATE TABLE
    IF NOT EXISTS session_sets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        session_id UUID NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
        exercise_id UUID NOT NULL REFERENCES template_exercises (id) ON DELETE CASCADE,
        set_number INT NOT NULL,
        reps INT,
        weight DECIMAL(6, 2),
        duration_seconds INT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW ()
    );

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions (date);

CREATE INDEX IF NOT EXISTS idx_session_sets_session_id ON session_sets (session_id);