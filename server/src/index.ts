import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { Resource } from "sst";
import { createConnection } from "snowflake-sdk";
import type { Env } from "./type";
import { testValue } from "core/index";

const app = new Hono<Env>();

const TABLE = "GHR_DIRECTACCESS_US.PRODUCTION_US.GREENWICH_ROLE_MAPPING_PROD";

app.use("*", async (c, next) => {
  const connectionStatus = await new Promise<boolean>((resolve, reject) => {
    console.log("connecting to snowflake...");
    if (snowflake.isUp()) {
      resolve(true);
    }
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

const snowflake = createConnection({
  account: "NTHBCVT-TALENTEDGE",
  username: "TALENTEDGE",
  warehouse: "TALENTEDGE_WH",
  password: Resource.SNOWFLAKE_PASSWORD.value,
  authenticator: "SNOWFLAKE",
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
