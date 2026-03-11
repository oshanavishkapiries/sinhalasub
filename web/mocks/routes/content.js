const { MOCK_MOVIES, MOCK_TV_SHOWS } = require("../data");

module.exports = [
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
            total_pages: 1,
            total_results: 5,
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
            total_pages: 1,
            total_results: 0,
          },
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
          body: {
            page: 1,
            results: MOCK_MOVIES,
            total_pages: 1,
            total_results: MOCK_MOVIES.length,
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
          body: {
            page: 1,
            results: MOCK_TV_SHOWS,
            total_pages: 1,
            total_results: MOCK_TV_SHOWS.length,
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
          body: {
            page: 1,
            results: MOCK_MOVIES.slice(0, 3),
            total_pages: 1,
            total_results: 3,
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
          body: {
            page: 1,
            results: MOCK_TV_SHOWS.slice(0, 3),
            total_pages: 1,
            total_results: 3,
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
          body: {
            page: 1,
            results: MOCK_MOVIES.slice(2, 5),
            total_pages: 1,
            total_results: 3,
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
