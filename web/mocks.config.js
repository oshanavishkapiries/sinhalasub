module.exports = {
  log: "info",
  mock: {
    collections: {
      selected: "base",
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
