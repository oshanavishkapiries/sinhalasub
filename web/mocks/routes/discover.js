const { MOCK_MOVIES, MOCK_TV_SHOWS } = require("../data");

module.exports = [
  {
    id: "discover-movies",
    url: "/api/movie/:category",
    method: "GET",
    variants: [
      {
        id: "success",
        type: "middleware",
        options: {
          middleware: (req, res) => {
            const { category } = req.params;
            const { with_genres, with_original_language } = req.query;

            let results = [...MOCK_MOVIES];

            // Filter by genres
            if (with_genres) {
              const genreIds = with_genres.split(",").map(Number);
              results = results.filter((movie) =>
                movie.genre_ids.some((id) => genreIds.includes(id))
              );
            }

            // Filter by language (simplified)
            if (with_original_language && with_original_language !== "en") {
              results = [];
            }

            res.status(200).send({
              page: 1,
              results: results,
              total_pages: 1,
              total_results: results.length,
            });
          },
        },
      },
    ],
  },
  {
    id: "discover-tv",
    url: "/api/discover/tv",
    method: "GET",
    variants: [
      {
        id: "success",
        type: "middleware",
        options: {
          middleware: (req, res) => {
            const { with_genres, with_original_language, on_the_air } = req.query;

            let results = [...MOCK_TV_SHOWS];

            // Filter by genres
            if (with_genres) {
              const genreIds = with_genres.split(",").map(Number);
              results = results.filter((tv) =>
                tv.genre_ids.some((id) => genreIds.includes(id))
              );
            }

            // Filter by language (simplified)
            if (with_original_language && with_original_language !== "en") {
              results = [];
            }

            res.status(200).send({
              page: 1,
              results: results,
              total_pages: 1,
              total_results: results.length,
            });
          },
        },
      },
    ],
  },
  {
    id: "discover-tv-category",
    url: "/api/tv/:category",
    method: "GET",
    variants: [
      {
        id: "success",
        type: "middleware",
        options: {
          middleware: (req, res) => {
            const { category } = req.params;
            const { with_genres, with_original_language } = req.query;

            let results = [...MOCK_TV_SHOWS];

            // Filter by genres
            if (with_genres) {
              const genreIds = with_genres.split(",").map(Number);
              results = results.filter((tv) =>
                tv.genre_ids.some((id) => genreIds.includes(id))
              );
            }

            // Filter by language (simplified)
            if (with_original_language && with_original_language !== "en") {
              results = [];
            }

            res.status(200).send({
              page: 1,
              results: results,
              total_pages: 1,
              total_results: results.length,
            });
          },
        },
      },
    ],
  },
  {
    id: "get-tv-season",
    url: "/api/tv/:tvId/season/:seasonNumber",
    method: "GET",
    variants: [
      {
        id: "success",
        type: "middleware",
        options: {
          middleware: (req, res) => {
            const tvId = parseInt(req.params.tvId);
            const seasonNumber = parseInt(req.params.seasonNumber);
            const tv = MOCK_TV_SHOWS.find((t) => t.id === tvId);

            if (tv && tv.seasons) {
              const season = tv.seasons.find(
                (s) => s.season_number === seasonNumber
              );
              if (season) {
                const fullSeason = {
                  ...season,
                  episodes: [
                    {
                      id: 1,
                      name: "Pilot",
                      overview: "The first episode of the season.",
                      episode_number: 1,
                      air_date: season.air_date,
                      still_path: "/example.jpg",
                    },
                    {
                      id: 2,
                      name: "Episode 2",
                      overview: "The second episode of the season.",
                      episode_number: 2,
                      air_date: season.air_date,
                      still_path: "/example2.jpg",
                    },
                  ],
                };
                res.status(200).send(fullSeason);
              } else {
                res.status(404).send({ message: "Season not found" });
              }
            } else {
              res.status(404).send({ message: "TV show not found" });
            }
          },
        },
      },
      {
        id: "not-found",
        type: "json",
        options: {
          status: 404,
          body: { message: "Season not found" },
        },
      },
    ],
  },
];
