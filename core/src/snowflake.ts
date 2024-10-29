import { type Connection, createConnection } from "snowflake-sdk";
import { Resource } from "sst";
import { z, ZodSchema } from "zod";

const snowClient = createConnection({
  account: "NTHBCVT-TALENTEDGE",
  username: "TALENTEDGE",
  warehouse: "TALENTEDGE_WH",
  password: Resource.SNOWFLAKE_PASSWORD.value,
  authenticator: "SNOWFLAKE",
});

snowClient.connect((err, connection) => {
  if (err) {
    console.error("Snowflake connection error:", err);
    process.exit(1);
  } else {
    console.log("connected to snowflake");
  }
});

// Snowflake utilities

type QueryOptions = Pick<
  Parameters<Connection["execute"]>[0],
  "sqlText" | "binds"
>;

export class Snowflake {
  client: Connection;
  constructor() {
    this.client = snowClient;
  }

  async query<R extends any = any>(query: QueryOptions): Promise<R[]> {
    return new Promise<R[]>((resolve, reject) => {
      this.client.execute({
        ...query,
        complete: (err, stmt, rows) => {
          if (err) {
            reject(err);
          } else {
            if (!rows) {
              console.log("Snowflake query returned undefined");
              resolve([]);
            } else {
              resolve(rows as R[]);
            }
          }
        },
      });
    });
  }

  async validatedQuery<R extends ZodSchema>(
    query: QueryOptions,
    schema: R,
  ): Promise<z.infer<R>[]> {
    const rows = await this.query<R>(query);
    return rows.map((row) => schema.parse(row));
  }

  get conn() {
    return this.client;
  }
}

export const snowflake = new Snowflake();
