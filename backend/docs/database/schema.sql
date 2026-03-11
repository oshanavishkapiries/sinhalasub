-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- admin, user, translator, reviewer
    avatar VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT users_email_key UNIQUE (email)
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at) WHERE deleted_at IS NULL;

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    url VARCHAR(500) NOT NULL,
    duration BIGINT, -- in seconds
    user_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, published, archived
    views BIGINT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_videos_user_id FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create index on user_id and status for faster lookups
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at) WHERE deleted_at IS NULL;

-- Create subtitles table
CREATE TABLE IF NOT EXISTS subtitles (
    id VARCHAR(255) PRIMARY KEY,
    video_id VARCHAR(255) NOT NULL,
    language VARCHAR(10) NOT NULL, -- e.g., 'en', 'si', 'ta'
    start_time BIGINT NOT NULL, -- in milliseconds
    end_time BIGINT NOT NULL, -- in milliseconds
    text TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_subtitles_video_id FOREIGN KEY (video_id) REFERENCES videos(id)
);

-- Create index on video_id and language for faster lookups
CREATE INDEX IF NOT EXISTS idx_subtitles_video_id ON subtitles(video_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_subtitles_language ON subtitles(language) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_subtitles_status ON subtitles(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_subtitles_video_language ON subtitles(video_id, language) WHERE deleted_at IS NULL;
