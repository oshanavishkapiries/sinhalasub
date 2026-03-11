const { MOCK_MOVIES, MOCK_TV_SHOWS } = require("../data");
const { 
  fetchContentDetails, 
  fetchSimilarContent, 
  searchContent 
} = require('../tmdb-fetcher');

module.exports = [
  {
    id: "get-movie-details",
    url: "/api/movie/:id",
    method: "GET",
    variants: [
      {
        id: "success",
        type: "middleware",
        options: {
          middleware: (req, res) => {
            const movieId = parseInt(req.params.id);
            const movie = MOCK_MOVIES.find((m) => m.id === movieId);
            if (movie) {
              res.status(200).send(movie);
            } else {
              res.status(404).send({ message: "Movie not found" });
            }
          },
        },
      },
      {
        id: "dynamic",
        type: "middleware",
        options: {
          middleware: async (req, res) => {
            const movieId = req.params.id;
            const movie = await fetchContentDetails(movieId, 'movie');
            if (movie) {
              res.status(200).json(movie);
            } else {
              res.status(404).json({ message: "Movie not found" });
            }
          },
        },
      },
      {
        id: "not-found",
        type: "json",
        options: {
          status: 404,
          body: { message: "Movie not found" },
        },
      },
    ],
  },
  {
    id: "get-tv-details",
    url: "/api/tv/:id",
    method: "GET",
    variants: [
      {
        id: "success",
        type: "middleware",
        options: {
          middleware: (req, res) => {
            const tvId = parseInt(req.params.id);
            const tv = MOCK_TV_SHOWS.find((t) => t.id === tvId);
            if (tv) {
              res.status(200).send(tv);
            } else {
              res.status(404).send({ message: "TV show not found" });
            }
          },
        },
      },
      {
        id: "dynamic",
        type: "middleware",
        options: {
          middleware: async (req, res) => {
            const tvId = req.params.id;
            const tv = await fetchContentDetails(tvId, 'tv');
            if (tv) {
              res.status(200).json(tv);
            } else {
              res.status(404).json({ message: "TV show not found" });
            }
          },
        },
      },
      {
        id: "not-found",
        type: "json",
        options: {
          status: 404,
          body: { message: "TV show not found" },
        },
      },
    ],
  },
  {
    id: "get-similar-movies",
    url: "/api/movie/:id/similar",
    method: "GET",
    variants: [
      {
        id: "success",
        type: "json",
        options: {
          status: 200,
          body: {
            page: 1,
            results: MOCK_MOVIES.slice(0, 2),
          },
        },
      },
      {
        id: "dynamic",
        type: "middleware",
        options: {
          middleware: async (req, res) => {
            const movieId = req.params.id;
            const data = await fetchSimilarContent(movieId, 'movie');
            res.status(200).json(data);
          },
        },
      },
    ],
  },
  {
    id: "get-similar-tv",
    url: "/api/tv/:id/similar",
    method: "GET",
    variants: [
      {
        id: "success",
        type: "json",
        options: {
          status: 200,
          body: {
            page: 1,
            results: MOCK_TV_SHOWS.slice(0, 2),
          },
        },
      },
      {
        id: "dynamic",
        type: "middleware",
        options: {
          middleware: async (req, res) => {
            const tvId = req.params.id;
            const data = await fetchSimilarContent(tvId, 'tv');
            res.status(200).json(data);
          },
        },
      },
    ],
  },
  {
    id: "search-content",
    url: "/api/search/multi",
    method: "GET",
    variants: [
      {
        id: "success",
        type: "middleware",
        options: {
          middleware: (req, res) => {
            const query = req.query.query?.toLowerCase() || "";
            const allContent = [...MOCK_MOVIES, ...MOCK_TV_SHOWS];
            const results = allContent.filter((item) => {
              const title = item.title || item.name || "";
              return title.toLowerCase().includes(query);
            });
            res.status(200).send({
              page: 1,
              results: results,
            });
          },
        },
      },
      {
        id: "dynamic",
        type: "middleware",
        options: {
          middleware: async (req, res) => {
            const query = req.query.query || "";
            const data = await searchContent(query);
            res.status(200).json(data);
          },
        },
      },
      {
        id: "empty",
        type: "json",
        options: {
          status: 200,
          body: {
            page: 1,
            results: [],
          },
        },
      },
    ],
  },
];
