const { MOCK_MOVIES, MOCK_TV_SHOWS } = require("../data");
const { 
  fetchTrending, 
  fetchPopular, 
  fetchTopRated, 
  fetchNowPlaying 
} = require('../tmdb-fetcher');

module.exports = [
  // Trending content
  {
    id: "get-trending",
    url: "/api/trending/all/week",
    method: "GET",
    variants: [
      {
        id: "success",
        type: "json",
        options: {
          status: 200,
          body: {
            page: 1,
            results: [...MOCK_MOVIES.slice(0, 3), ...MOCK_TV_SHOWS.slice(0, 2)],
          },
        },
      },
      {
        id: "dynamic",
        type: "middleware",
        options: {
          middleware: async (req, res) => {
            const data = await fetchTrending();
            res.status(200).json(data);
          },
        },
      },
      {
        id: "empty",
        type: "json",
        options: {
          status: 200,
          body: { page: 1, results: [] },
        },
      },
      {
        id: "error",
        type: "json",
        options: {
          status: 500,
          body: { message: "Failed to fetch trending content" },
        },
      },
    ],
  },

  // Popular movies
  {
    id: "get-popular-movies",
    url: "/api/movie/popular",
    method: "GET",
    variants: [
      {
        id: "success",
        type: "json",
        options: {
          status: 200,
          body: { page: 1, results: MOCK_MOVIES },
        },
      },
      {
        id: "dynamic",
        type: "middleware",
        options: {
          middleware: async (req, res) => {
            const data = await fetchPopular();
            const movies = data.results.filter(item => item.media_type === 'movie');
            res.status(200).json({ page: 1, results: movies });
          },
        },
      },
      {
        id: "error",
        type: "json",
        options: {
          status: 500,
          body: { message: "Failed to fetch popular movies" },
        },
      },
    ],
  },

  // Popular TV shows
  {
    id: "get-popular-tv",
    url: "/api/tv/popular",
    method: "GET",
    variants: [
      {
        id: "success",
        type: "json",
        options: {
          status: 200,
          body: { page: 1, results: MOCK_TV_SHOWS },
        },
      },
      {
        id: "dynamic",
        type: "middleware",
        options: {
          middleware: async (req, res) => {
            const data = await fetchPopular();
            const tvShows = data.results.filter(item => item.media_type === 'tv');
            res.status(200).json({ page: 1, results: tvShows });
          },
        },
      },
      {
        id: "error",
        type: "json",
        options: {
          status: 500,
          body: { message: "Failed to fetch popular TV shows" },
        },
      },
    ],
  },

  // Top rated movies
  {
    id: "get-top-rated-movies",
    url: "/api/movie/top_rated",
    method: "GET",
    variants: [
      {
        id: "success",
        type: "json",
        options: {
          status: 200,
          body: { page: 1, results: MOCK_MOVIES.slice(0, 3) },
        },
      },
      {
        id: "dynamic",
        type: "middleware",
        options: {
          middleware: async (req, res) => {
            const data = await fetchTopRated();
            const movies = data.results.filter(item => item.media_type === 'movie');
            res.status(200).json({ page: 1, results: movies });
          },
        },
      },
      {
        id: "error",
        type: "json",
        options: {
          status: 500,
          body: { message: "Failed to fetch top rated movies" },
        },
      },
    ],
  },

  // Top rated TV shows
  {
    id: "get-top-rated-tv",
    url: "/api/tv/top_rated",
    method: "GET",
    variants: [
      {
        id: "success",
        type: "json",
        options: {
          status: 200,
          body: { page: 1, results: MOCK_TV_SHOWS.slice(0, 3) },
        },
      },
      {
        id: "dynamic",
        type: "middleware",
        options: {
          middleware: async (req, res) => {
            const data = await fetchTopRated();
            const tvShows = data.results.filter(item => item.media_type === 'tv');
            res.status(200).json({ page: 1, results: tvShows });
          },
        },
      },
      {
        id: "error",
        type: "json",
        options: {
          status: 500,
          body: { message: "Failed to fetch top rated TV shows" },
        },
      },
    ],
  },

  // Now playing movies
  {
    id: "get-now-playing",
    url: "/api/movie/now_playing",
    method: "GET",
    variants: [
      {
        id: "success",
        type: "json",
        options: {
          status: 200,
          body: { page: 1, results: MOCK_MOVIES.slice(2, 5) },
        },
      },
      {
        id: "dynamic",
        type: "middleware",
        options: {
          middleware: async (req, res) => {
            const data = await fetchNowPlaying();
            res.status(200).json(data);
          },
        },
      },
      {
        id: "error",
        type: "json",
        options: {
          status: 500,
          body: { message: "Failed to fetch now playing movies" },
        },
      },
    ],
  },
];
