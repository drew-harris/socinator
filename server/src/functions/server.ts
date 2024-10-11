import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { Resource } from "sst";
import type { Env } from "../type";
import { testValue } from "core/index";
import { snowflake } from "../snowflake";

const app = new Hono<Env>();

const TABLE = "GHR_DIRECTACCESS_US.PRODUCTION_US.GREENWICH_ROLE_MAPPING_PROD";

app.use("*", async (c, next) => {
  c.set("snowflake", snowflake);
  await next();
});

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
  const result = await new Promise((resolve, reject) => {
    snowflake.execute({
      sqlText: `SELECT * FROM ${TABLE} LIMIT 5;`,
      complete: (err, stmt, rows) => {
        if (err) {
          console.error("Snowflake query error:", err);
          reject(err);
        } else {
          console.log("Snowflake query success");
          resolve(rows);
        }
      },
    });
  });

  return c.json({
    message: "Hello, world!",
    snowflakeConnected: true,
    rows: result,
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
