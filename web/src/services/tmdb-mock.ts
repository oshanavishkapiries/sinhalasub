// Mock TMDB service for TV series search and details
// In production, this would call the real TMDB API

export interface TMDBTVSeries {
  id: number;
  tmdb_id: number;
  name: string;
  original_name: string;
  overview: string;
  tagline: string;
  homepage: string;
  poster_urls: string[];
  backdrop_urls: string[];
  first_air_date: string;
  last_air_date: string;
  status: string;
  type: string;
  original_language: string;
  adult: boolean;
  in_production: boolean;
  popularity: number;
  vote_average: number;
  vote_count: number;
  number_of_episodes: number;
  number_of_seasons: number;
  media_type: string;
  trailer_link: string;
  imdb_id: string;
  genres: { id: number; name: string }[];
  seasons: TMDBSeason[];
}

export interface TMDBSeason {
  id: number;
  season_number: number;
  title: string;
  episode_count: number;
  poster: string;
  air_date: string;
  episodes: TMDBEpisode[];
}

export interface TMDBEpisode {
  id: number;
  episode_number: number;
  title: string;
  overview: string;
  thumbnail: string;
  air_date: string;
  runtime: number;
}

export interface TMDBSearchResult {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string;
  first_air_date: string;
  vote_average: number;
}

// Mock data for TV series
const mockTVSeries: TMDBTVSeries[] = [
  {
    id: 1,
    tmdb_id: 1396,
    name: "Breaking Bad",
    original_name: "Breaking Bad",
    overview: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
    tagline: "Change the Equation",
    homepage: "https://www.amc.com/shows/breaking-bad",
    poster_urls: [
      "https://image.tmdb.org/t/p/original/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
      "https://image.tmdb.org/t/p/original/1BP4xYv9ZG4ZVHkL7ocOziBbSYH.jpg",
      "https://image.tmdb.org/t/p/original/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg"
    ],
    backdrop_urls: [
      "https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
      "https://image.tmdb.org/t/p/original/eSzpy96DwBujGFj0xMbXBcGcfxX.jpg",
      "https://image.tmdb.org/t/p/original/9faGSFi5jam6pDWGNd0p8JcJgXQ.jpg"
    ],
    first_air_date: "2008-01-20",
    last_air_date: "2013-09-29",
    status: "Ended",
    type: "Scripted",
    original_language: "en",
    adult: false,
    in_production: false,
    popularity: 321.456,
    vote_average: 8.9,
    vote_count: 12345,
    number_of_episodes: 62,
    number_of_seasons: 5,
    media_type: "tv",
    trailer_link: "https://www.youtube.com/watch?v=HhesaQXLuRY",
    imdb_id: "tt0903747",
    genres: [
      { id: 18, name: "Drama" },
      { id: 80, name: "Crime" }
    ],
    seasons: [
      {
        id: 1,
        season_number: 1,
        title: "Season 1",
        episode_count: 7,
        poster: "/1BP4xYv9ZG4ZVHkL7ocOziBbSYH.jpg",
        air_date: "2008-01-20",
        episodes: [
          {
            id: 1,
            episode_number: 1,
            title: "Pilot",
            overview: "When an unassuming high school chemistry teacher discovers he has a rare form of lung cancer, he decides to team up with a former student and create a top of the line crystal meth.",
            thumbnail: "/ydlY3iPfeOAvu8gVqrxPoMvzNCn.jpg",
            air_date: "2008-01-20",
            runtime: 58
          },
          {
            id: 2,
            episode_number: 2,
            title: "Cat's in the Bag...",
            overview: "Walt and Jesse attempt to dispose of the bodies, which proves to be more difficult than anticipated.",
            thumbnail: "/A7ZLwgrwZSIZIrb4N5RLuq7zE1Q.jpg",
            air_date: "2008-01-27",
            runtime: 48
          },
          {
            id: 3,
            episode_number: 3,
            title: "...And the Bag's in the River",
            overview: "Walt and Jesse clean up after the bathtub incident before Walt decides what to do with their prisoner.",
            thumbnail: "/extIHzTjD24kxhAyZn94OPoDlqN.jpg",
            air_date: "2008-02-10",
            runtime: 48
          }
        ]
      },
      {
        id: 2,
        season_number: 2,
        title: "Season 2",
        episode_count: 13,
        poster: "/e3oGYpoTUhOFK0bjflx7H7E73Vq.jpg",
        air_date: "2009-03-08",
        episodes: [
          {
            id: 4,
            episode_number: 1,
            title: "Seven Thirty-Seven",
            overview: "Walt and Jesse realize how dire their situation is. They must come up with a plan to kill Tuco before he kills them.",
            thumbnail: "/o0WITd8tPPWKSmUD7dLtCx1bE5F.jpg",
            air_date: "2009-03-08",
            runtime: 47
          },
          {
            id: 5,
            episode_number: 2,
            title: "Grilled",
            overview: "Walt and Jesse manage to escape Tuco. With Hank on the case, Walt is under increasing pressure.",
            thumbnail: "/4S4GGZcBcArexHeAqDTWJqg1cPy.jpg",
            air_date: "2009-03-15",
            runtime: 47
          }
        ]
      }
    ]
  },
  {
    id: 2,
    tmdb_id: 1399,
    name: "Game of Thrones",
    original_name: "Game of Thrones",
    overview: "Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war.",
    tagline: "Winter Is Coming",
    homepage: "http://www.hbo.com/game-of-thrones",
    poster_urls: [
      "https://image.tmdb.org/t/p/original/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
      "https://image.tmdb.org/t/p/original/wgfKiqzuMrFIkU1M68DDDY8kGC1.jpg",
      "https://image.tmdb.org/t/p/original/7WUHnWGx5OO145IRxPDUkQSh4C7.jpg"
    ],
    backdrop_urls: [
      "https://image.tmdb.org/t/p/original/suopoADq0k8YZr4dQXcU6pToj6s.jpg",
      "https://image.tmdb.org/t/p/original/mUkuc2wyV9dHLG0D0Loaw5pO2s8.jpg",
      "https://image.tmdb.org/t/p/original/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg"
    ],
    first_air_date: "2011-04-17",
    last_air_date: "2019-05-19",
    status: "Ended",
    type: "Scripted",
    original_language: "en",
    adult: false,
    in_production: false,
    popularity: 529.789,
    vote_average: 8.4,
    vote_count: 23456,
    number_of_episodes: 73,
    number_of_seasons: 8,
    media_type: "tv",
    trailer_link: "https://www.youtube.com/watch?v=KPLWWIOCOOQ",
    imdb_id: "tt0944947",
    genres: [
      { id: 10765, name: "Sci-Fi & Fantasy" },
      { id: 18, name: "Drama" },
      { id: 10759, name: "Action & Adventure" }
    ],
    seasons: [
      {
        id: 3,
        season_number: 1,
        title: "Season 1",
        episode_count: 10,
        poster: "/wgfKiqzuMrFIkU1M68DDDY8kGC1.jpg",
        air_date: "2011-04-17",
        episodes: [
          {
            id: 6,
            episode_number: 1,
            title: "Winter Is Coming",
            overview: "Eddard Stark is torn between his family and an old friend when asked to serve at the side of King Robert Baratheon.",
            thumbnail: "/wrGWeW4WKxnaeA8sxJb2T9O6ryo.jpg",
            air_date: "2011-04-17",
            runtime: 62
          },
          {
            id: 7,
            episode_number: 2,
            title: "The Kingsroad",
            overview: "While Bran recuperates from his fall, Ned takes only his daughters to King's Landing.",
            thumbnail: "/xIfvIM7YgkADXsT91FjRNmFXmtI.jpg",
            air_date: "2011-04-24",
            runtime: 56
          }
        ]
      }
    ]
  },
  {
    id: 3,
    tmdb_id: 94605,
    name: "Arcane",
    original_name: "Arcane",
    overview: "Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and clashing convictions.",
    tagline: "The hunt is on.",
    homepage: "https://www.netflix.com/title/81435684",
    poster_urls: [
      "https://image.tmdb.org/t/p/original/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg",
      "https://image.tmdb.org/t/p/original/abf8tHznhSvl9BAElD2cQeRr7do.jpg",
      "https://image.tmdb.org/t/p/original/oMrgtLXs5bOPZDWPnIFz7bPUii.jpg"
    ],
    backdrop_urls: [
      "https://image.tmdb.org/t/p/original/rkB4LyZHo1NHXFEDHl9vSD9r1lI.jpg",
      "https://image.tmdb.org/t/p/original/fAWmVpcX9WyHJ7kKW3xgPJgWDmO.jpg",
      "https://image.tmdb.org/t/p/original/rspq8FLMvGiw3Y6cCBJmBqjLqWP.jpg"
    ],
    first_air_date: "2021-11-06",
    last_air_date: "2021-11-20",
    status: "Returning Series",
    type: "Scripted",
    original_language: "en",
    adult: false,
    in_production: true,
    popularity: 187.234,
    vote_average: 8.8,
    vote_count: 3456,
    number_of_episodes: 9,
    number_of_seasons: 1,
    media_type: "tv",
    trailer_link: "https://www.youtube.com/watch?v=fXmAurh012s",
    imdb_id: "tt11126994",
    genres: [
      { id: 16, name: "Animation" },
      { id: 10765, name: "Sci-Fi & Fantasy" },
      { id: 10759, name: "Action & Adventure" }
    ],
    seasons: [
      {
        id: 4,
        season_number: 1,
        title: "Season 1",
        episode_count: 9,
        poster: "/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg",
        air_date: "2021-11-06",
        episodes: [
          {
            id: 8,
            episode_number: 1,
            title: "Welcome to the Playground",
            overview: "Orphaned sisters Vi and Powder are part of a group that survives by committing crimes.",
            thumbnail: "/pmlqsebSQnKUO0qlhHWZHdx69F2.jpg",
            air_date: "2021-11-06",
            runtime: 41
          },
          {
            id: 9,
            episode_number: 2,
            title: "Some Mysteries Are Better Left Unsolved",
            overview: "Shimmering lights promise salvation, but Violet and Powder are forced to face the consequences of their actions.",
            thumbnail: "/4wEy0K8MU2LrFf0yZ1VqkKv5TiJ.jpg",
            air_date: "2021-11-06",
            runtime: 40
          },
          {
            id: 10,
            episode_number: 3,
            title: "The Base Violence Necessary for Change",
            overview: "Vander makes a deal. Powder, Vi and the boys fight to pull off a daring robbery.",
            thumbnail: "/nAO8CnlMxnmwcCL5qlMEZYSWAMU.jpg",
            air_date: "2021-11-06",
            runtime: 41
          }
        ]
      }
    ]
  }
];

export async function searchTVSeries(query: string): Promise<TMDBSearchResult[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  if (!query) return [];

  return mockTVSeries
    .filter(series => 
      series.name.toLowerCase().includes(query.toLowerCase()) ||
      series.original_name.toLowerCase().includes(query.toLowerCase())
    )
    .map(series => ({
      id: series.tmdb_id,
      name: series.name,
      original_name: series.original_name,
      overview: series.overview,
      poster_path: series.poster_urls[0], // Use first poster for search results
      first_air_date: series.first_air_date,
      vote_average: series.vote_average
    }));
}

export async function getTVSeriesDetails(tmdbId: number): Promise<TMDBTVSeries | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const series = mockTVSeries.find(s => s.tmdb_id === tmdbId);
  return series || null;
}

export async function getTVSeriesSeasons(tmdbId: number): Promise<TMDBSeason[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const series = mockTVSeries.find(s => s.tmdb_id === tmdbId);
  return series?.seasons || [];
}

export async function getSeasonEpisodes(tmdbId: number, seasonNumber: number): Promise<TMDBEpisode[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const series = mockTVSeries.find(s => s.tmdb_id === tmdbId);
  const season = series?.seasons.find(s => s.season_number === seasonNumber);
  return season?.episodes || [];
}
