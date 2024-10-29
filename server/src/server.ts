import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import type { Env } from "./type";
import { redshift } from "core/redshift";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./routers/app";

const app = new Hono<Env>();

app.use("*", async (c, next) => {
  c.set("redshift", redshift);
  await next();
});

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    onError: ({ error, path }) => {
      console.error(`Error in ${path}:`, error);
      if (error.cause) {
        console.error('Caused by:', error.cause);
      }
      throw error;
    },
  }),
);

app.get("/:path*", async (c) => {
  c.status(404);
  return c.json({
    message: "Not found",
  });
});

export const handler = handle(app);
