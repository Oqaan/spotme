CREATE TABLE
    IF NOT EXISTS workout_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        day_of_week TEXT,
        order_index INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW ()
    );

CREATE TABLE
    IF NOT EXISTS template_exercises (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        template_id UUID NOT NULL REFERENCES workout_templates (id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        target_sets INT,
        target_reps INT,
        notes TEXT,
        is_timed BOOLEAN NOT NULL DEFAULT FALSE,
        order_index INT NOT NULL DEFAULT 0
    );