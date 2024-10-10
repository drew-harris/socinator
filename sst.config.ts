/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app(input) {
    return {
      name: "socinator",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: { postgresql: "3.12.1" },
    };
  },
  async run() {
    const dbHost = new sst.Secret("DB_HOST");
    const dbPass = new sst.Secret("DB_PASS");

    const dbProvider = new postgresql.Provider("drew-db-provider", {
      host: dbHost.value,
      password: dbPass.value,
      port: 5433, // This is not the default!
      username: "postgres",
      superuser: true,
      sslmode: "disable",
    });

    sst.Linkable.wrap(postgresql.Database, (db) => ({
      properties: {
        dbUrl: $interpolate`postgresql://postgres:${dbProvider.password}@${dbProvider.host}/${db.name}`,
      },
    }));

    const db = new postgresql.Database(
      "db",
      {
        name: "socinator-db",
      },
      {
        provider: dbProvider,
      },
    );

    const server = new sst.aws.Function("Server", {
      url: true,
      handler: "server/index.handler",
      link: [db],
    });

    const site = new sst.aws.StaticSite("Site", {
      path: "site",
      build: {
        command: "bun run build",
        output: "dist",
      },
      dev: {
        title: "Site",
        directory: "site",
        command: "bun run dev",
      },
      environment: {
        VITE_PUBLIC_API_URL: server.url,
      },
    });

    return {
      url: server.url,
    };
  },
});
