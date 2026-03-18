# db_table schema : movies

id : integer (primary key)
title : string
slug : string (unique)
rating : float (imdb)
release_date : date
poster_url : string
overview : string
created_at : timestamp
updated_at : timestamp

# db_table schema : cast

id : integer (primary key)
movie_id : integer (foreign key to movies.id)
tmdb_id : integer (unique identifier from TMDB)
actor_name : string
actor_image_url : string
character_name : string
created_at : timestamp
updated_at : timestamp

# db_table schema : movie_categories

id : integer (primary key)
movie_id : integer (foreign key to movies.id)
category_id : integer
category_name : string
created_at : timestamp
updated_at : timestamp

# db_table schema : movie_details

id : integer (primary key)
movie_id : integer (foreign key to movies.id)
overview : string
tmdb_id : integer
imdb_id : string
adult : boolean
language : string
duration : integer (minutes)
backdrop_url : string
trailer_url : string
director : string
country : string
created_at : timestamp
updated_at : timestamp

# db_table schema : movie_subtitles

id : integer (primary key)
movie_id : integer (foreign key to movies.id)
language : string
subtitle_url : string
subtitle_author : string
created_at : timestamp
updated_at : timestamp

# db_table schema : movie_player_providers

id : integer (primary key)
movie_id : integer (foreign key to movies.id)
player_provider : string
player_provider_url : string
player_provider_type : string
video_quality : string
is_default : boolean
is_ads_available : boolean
created_at : timestamp
updated_at : timestamp

# db_table schema : movie_download_options

id : integer (primary key)
movie_id : integer (foreign key to movies.id)
download_option : string
download_option_url : string
download_option_type : string
file_size : string
video_quality : string
created_at : timestamp
updated_at : timestamp
