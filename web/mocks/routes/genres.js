const { fetchTVGenres, fetchMovieGenres } = require('../tmdb-fetcher');

// Static TV genres
const TV_GENRES = [
  { id: 10759, name: "Action & Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 10762, name: "Kids" },
  { id: 9648, name: "Mystery" },
  { id: 10763, name: "News" },
  { id: 10764, name: "Reality" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 10766, name: "Soap" },
  { id: 10767, name: "Talk" },
  { id: 10768, name: "War & Politics" },
  { id: 37, name: "Western" },
];

// Static movie genres
const MOVIE_GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

module.exports = [
  {
    id: "get-tv-genres",
    url: "/api/genre/tv/list",
    method: "GET",
    variants: [
      {
        id: "success",
        type: "json",
        options: {
          status: 200,
          body: { genres: TV_GENRES },
        },
      },
      {
        id: "dynamic",
        type: "middleware",
        options: {
          middleware: async (req, res) => {
            const data = await fetchTVGenres();
            res.status(200).json(data);
          },
        },
      },
      {
        id: "error",
        type: "json",
        options: {
          status: 500,
          body: { message: "Failed to fetch TV genres" },
        },
      },
    ],
  },
  {
    id: "get-movie-genres",
    url: "/api/genre/movie/list",
    method: "GET",
    variants: [
      {
        id: "success",
        type: "json",
        options: {
          status: 200,
          body: { genres: MOVIE_GENRES },
        },
      },
      {
        id: "dynamic",
        type: "middleware",
        options: {
          middleware: async (req, res) => {
            const data = await fetchMovieGenres();
            res.status(200).json(data);
          },
        },
      },
      {
        id: "error",
        type: "json",
        options: {
          status: 500,
          body: { message: "Failed to fetch movie genres" },
        },
      },
    ],
  },
];
