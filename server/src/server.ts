import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import type { Env } from "./type";
import { snowflake } from "core/snowflake";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./routers/app";

const app = new Hono<Env>();

app.use("*", async (c, next) => {
  c.set("snowflake", snowflake);
  await next();
});

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    onError: ({ error }) => {
      console.error(error);
      throw error;
    },
  }),
);

// 404
app.get("/:path*", async (c) => {
  c.status(404);
  return c.json({
    message: "Not found",
  });
});

export const handler = handle(app);
