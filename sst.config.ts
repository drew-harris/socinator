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

    const camDbUri = new sst.Secret("CAM_DB_URI");
    const typesenseKey = new sst.Secret("TYPESENSE_KEY");
    const typesenseHost = new sst.Secret("TYPESENSE_HOST");

    const server = new sst.aws.Function("Server", {
      url: true,
      handler: "server/src/server.handler",
      link: [redshiftUser, redshiftPassword, redshiftHost, redshiftDatabase],
      timeout: "80 second",
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

    // const vpc = new sst.aws.Vpc("MyVpc");
    //
    // const fullTextCluster = new sst.aws.Cluster("fulltext-cluster", {
    //   vpc,
    //   forceUpgrade: "v2",
    // });
    //
    // const typesenseStorage = new sst.aws.Efs("MyEfs", { vpc });
    //
    // const typesense = fullTextCluster.addService("typesense", {
    //   loadBalancer: {
    //     ports: [
    //       {
    //         listen: "8108/http",
    //         forward: "8108/http",
    //       },
    //     ],
    //   },
    //   scaling: {
    //     max: 1,
    //   },
    //   memory: "0.5 GB",
    //   command: [
    //     "--data-dir",
    //     "/data",
    //     "--api-key",
    //     typesenseKey.value,
    //     "--enable-cors",
    //   ],
    //   image: "typesense/typesense",
    //   volumes: [
    //     {
    //       efs: typesenseStorage,
    //       path: "/data",
    //     },
    //   ],
    // });

    return {
      backendUrl: server.url,
      site: site.url,
      // fulltextUrl: typesense.url,
    };
  },
});
