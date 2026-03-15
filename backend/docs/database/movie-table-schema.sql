-- Create movies table
CREATE TABLE IF NOT EXISTS movies (
                                      id SERIAL PRIMARY KEY,
                                      title VARCHAR(255) NOT NULL,
                                      slug VARCHAR(255) NOT NULL UNIQUE,
                                      rating DECIMAL(3, 1),
                                      release_date DATE,
                                      poster_url TEXT,
                                      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for movies table
CREATE INDEX idx_movies_slug ON movies(slug);
CREATE INDEX idx_movies_release_date ON movies(release_date);
CREATE INDEX idx_movies_rating ON movies(rating);
CREATE INDEX idx_movies_created_at ON movies(created_at);

-- Create cast table
CREATE TABLE IF NOT EXISTS "cast" (
                                    id SERIAL PRIMARY KEY,
                                    movie_id INTEGER NOT NULL,
                                    tmdb_id INTEGER NOT NULL UNIQUE,
                                    actor_name VARCHAR(255) NOT NULL,
                                    actor_image_url TEXT,
                                    character_name VARCHAR(255),
                                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                    CONSTRAINT fk_cast_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

-- Create indexes for cast table
CREATE INDEX idx_cast_movie_id ON "cast"(movie_id);
CREATE INDEX idx_cast_tmdb_id ON "cast"(tmdb_id);
CREATE INDEX idx_cast_actor_name ON "cast"(actor_name);

-- Create movie_categories table
CREATE TABLE IF NOT EXISTS movie_categories (
                                                id SERIAL PRIMARY KEY,
                                                movie_id INTEGER NOT NULL,
                                                category_id INTEGER NOT NULL,
                                                category_name VARCHAR(255) NOT NULL,
                                                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                                CONSTRAINT fk_movie_categories_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
                                                CONSTRAINT uq_movie_category UNIQUE (movie_id, category_id)
);

-- Create indexes for movie_categories table
CREATE INDEX idx_movie_categories_movie_id ON movie_categories(movie_id);
CREATE INDEX idx_movie_categories_category_id ON movie_categories(category_id);

-- Create movie_details table
CREATE TABLE IF NOT EXISTS movie_details (
                                             id SERIAL PRIMARY KEY,
                                             movie_id INTEGER NOT NULL UNIQUE,
                                             overview TEXT,
                                             tmdb_id INTEGER,
                                             imdb_id VARCHAR(50),
                                             adult BOOLEAN DEFAULT FALSE,
                                             language VARCHAR(50),
                                             duration INTEGER,
                                             backdrop_url TEXT,
                                             trailer_url TEXT,
                                             director VARCHAR(255),
                                             country VARCHAR(255),
                                             created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                             updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                             CONSTRAINT fk_movie_details_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

-- Create indexes for movie_details table
CREATE INDEX idx_movie_details_movie_id ON movie_details(movie_id);
CREATE INDEX idx_movie_details_imdb_id ON movie_details(imdb_id);

-- Create movie_subtitles table
CREATE TABLE IF NOT EXISTS movie_subtitles (
                                               id SERIAL PRIMARY KEY,
                                               movie_id INTEGER NOT NULL,
                                               language VARCHAR(100) NOT NULL,
                                               subtitle_url TEXT NOT NULL,
                                               subtitle_author VARCHAR(255),
                                               created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                               updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                               CONSTRAINT fk_movie_subtitles_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

-- Create indexes for movie_subtitles table
CREATE INDEX idx_movie_subtitles_movie_id ON movie_subtitles(movie_id);
CREATE INDEX idx_movie_subtitles_language ON movie_subtitles(language);

-- Create movie_player_providers table
CREATE TABLE IF NOT EXISTS movie_player_providers (
                                                      id SERIAL PRIMARY KEY,
                                                      movie_id INTEGER NOT NULL,
                                                      player_provider VARCHAR(100) NOT NULL,
                                                      player_provider_url TEXT NOT NULL,
                                                      player_provider_type VARCHAR(50),
                                                      video_quality VARCHAR(50),
                                                      is_default BOOLEAN DEFAULT FALSE,
                                                      is_ads_available BOOLEAN DEFAULT FALSE,
                                                      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                                      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                                      CONSTRAINT fk_movie_player_providers_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

-- Create indexes for movie_player_providers table
CREATE INDEX idx_movie_player_providers_movie_id ON movie_player_providers(movie_id);
CREATE INDEX idx_movie_player_providers_is_default ON movie_player_providers(is_default);
CREATE INDEX idx_movie_player_providers_video_quality ON movie_player_providers(video_quality);

-- Create movie_download_options table
CREATE TABLE IF NOT EXISTS movie_download_options (
                                                      id SERIAL PRIMARY KEY,
                                                      movie_id INTEGER NOT NULL,
                                                      download_option VARCHAR(255) NOT NULL,
                                                      download_option_url TEXT NOT NULL,
                                                      download_option_type VARCHAR(50),
                                                      file_size VARCHAR(50),
                                                      video_quality VARCHAR(50),
                                                      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                                      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                                      CONSTRAINT fk_movie_download_options_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

-- Create indexes for movie_download_options table
CREATE INDEX idx_movie_download_options_movie_id ON movie_download_options(movie_id);
CREATE INDEX idx_movie_download_options_video_quality ON movie_download_options(video_quality);
CREATE INDEX idx_movie_download_options_type ON movie_download_options(download_option_type);
