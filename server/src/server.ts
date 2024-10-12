import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { Resource } from "sst";
import type { Env } from "./type";
import { testValue } from "core/index";
import { snowflake } from "core/snowflake";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./routers/app";

const app = new Hono<Env>();

const TABLE = "GHR_DIRECTACCESS_US.PRODUCTION_US.GREENWICH_ROLE_MAPPING_PROD";

app.use("*", async (c, next) => {
  c.set("snowflake", snowflake);
  await next();
});

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
  }),
);

app.get("/", async (c) => {
  return c.json({
    message: "Hello, there!",
  });
});

app.get("/core", async (c) => {
  return c.json({
    msg: testValue,
  });
});

app.get("/snowflake", async (c) => {
  const rows = await snowflake.query({
    sqlText: `SELECT * FROM ${TABLE} LIMIT 5;`,
  });

  return c.json({
    message: "Hello, world!",
    snowflakeConnected: true,
    rows,
  });
});

app.get("/db", async (c) => {
  return c.json({
    db: Resource.db.dbUrl,
  });
});

// 404
app.get("/:path*", async (c) => {
  c.status(404);
  return c.json({
    message: "Not found",
  });
});

export const handler = handle(app);
