/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app(input) {
    return {
      name: "socinator",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        postgresql: "3.12.1",
        aws: {
          profile: "socinator",
        },
      },
    };
  },
  async run() {
    const redshiftUser = new sst.Secret("REDSHIFT_USER");
    const redshiftPassword = new sst.Secret("REDSHIFT_PASSWORD");
    const redshiftHost = new sst.Secret("REDSHIFT_HOST");
    const redshiftDatabase = new sst.Secret("REDSHIFT_DATABASE");

    const server = new sst.aws.Function("Server", {
      url: true,
      handler: "server/src/server.handler",
      link: [redshiftUser, redshiftPassword, redshiftHost, redshiftDatabase],
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
