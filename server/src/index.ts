import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { Resource } from "sst";
import { createConnection } from "snowflake-sdk";
import type { Env } from "./type";

const app = new Hono<Env>();

app.use("*", async (c, next) => {
  c.set("snowflake", snowflake);
  await next();
});

app.get("/", async (c) => {
  return c.json({
    message: "Hello, there!",
  });
});

const snowflake = createConnection({
  account: "NTHBCVT-TALENTEDGE",
  username: "TALENTEDGE",
  warehouse: "TALENTEDGE_WH",
  password: Resource.SNOWFLAKE_PASSWORD.value,
  authenticator: "SNOWFLAKE",
});

app.get("/snowflake", async (c) => {
  const connectionStatus = await new Promise<boolean>((resolve, reject) => {
    console.log("connecting to snowflake...");
    snowflake.connect((err, connection) => {
      if (err) {
        console.error("Snowflake connection error:", err);
        reject(err);
      } else {
        console.log("connected to snowflake");
        resolve(connection.isUp());
      }
    });
  });
  return c.json({
    message: "Hello, world!",
    snowflakeConnected: connectionStatus,
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
