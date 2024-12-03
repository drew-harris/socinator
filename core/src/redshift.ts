import pg from "pg";
import postgres from "postgres";
import { Resource } from "sst";
import { z, ZodSchema } from "zod";

const redshiftConfig = {
  user: Resource.REDSHIFT_USER.value,
  password: Resource.REDSHIFT_PASSWORD.value,
  host: Resource.REDSHIFT_HOST.value,
  port: 5439,
  database: Resource.REDSHIFT_DATABASE.value,
  ssl: {
    rejectUnauthorized: false, // This allows self-signed certificates
  },
};

export const db = postgres(Resource.CAM_DB_URI.value, { debug: true });

export class Redshift {
  private pool: pg.Pool;

  constructor() {
    this.pool = new pg.Pool(redshiftConfig);

    // Add error handler to the pool
    this.pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
    });
  }

  async query<R extends any = any>(query: string): Promise<R[]> {
    const client = await this.pool.connect();
    try {
      const result = await db`${query}`.execute();
      return result as unknown as R[];
    } catch (error) {
      console.error("Error executing Redshift query:", error);
      throw error;
    } finally {
      client.release();
    }
  }
}

export const redshift = new Redshift();
