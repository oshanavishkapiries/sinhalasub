module.exports = {
  log: "info",
  mock: {
    collections: {
      // Available collections:
      // - "base" - Static mock data (default)
      // - "dynamic" - Real TMDB data (requires NEXT_PUBLIC_TMDB_API_KEY)
      // - "empty-data" - Empty results for testing
      // - "all-errors" - 500 errors
      // - "not-found-scenarios" - 404 errors
      selected: "dynamic", // Change to "base" for static data
    },
    routes: {
      delay: 500, // Simulate network delay
    },
  },
  server: {
    port: 3100,
    host: "0.0.0.0",
    cors: {
      enabled: true,
      options: {
        origin: "*",
        credentials: true,
      },
    },
  },
  files: {
    path: "mocks",
    watch: true,
  },
  plugins: {
    adminApi: {
      port: 3110,
      host: "0.0.0.0",
    },
    inquirerCli: {
      enabled: true,
    },
  },
};
