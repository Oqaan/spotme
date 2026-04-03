CREATE TABLE
    IF NOT EXISTS friendships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        friend_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
        UNIQUE (user_id, friend_id)
    );

CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships (user_id);

CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships (friend_id);