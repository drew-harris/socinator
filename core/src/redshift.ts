import pg from "pg";
import { Resource } from "sst";
import { z, ZodSchema } from "zod";

const redshiftConfig = {
  user: Resource.REDSHIFT_USER.value,
  password: Resource.REDSHIFT_PASSWORD.value,
  host: Resource.REDSHIFT_HOST.value,
  port: 5439,
  database: Resource.REDSHIFT_DATABASE.value,
  ssl: {
    rejectUnauthorized: false // This allows self-signed certificates
  }
};

export class Redshift {
  private pool: pg.Pool;

  constructor() {
    this.pool = new pg.Pool(redshiftConfig);

    // Add error handler to the pool
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  async query<R extends any = any>(query: string, params?: any[]): Promise<R[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(query, params);
      return result.rows as R[];
    } catch (error) {
      console.error("Error executing Redshift query:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  async validatedQuery<R extends ZodSchema>(
    query: string,
    schema: R,
    params?: any[]
  ): Promise<z.infer<R>[]> {
    const rows = await this.query(query, params);
    try {
      return rows.map((row) => {
        const parsed = schema.safeParse(row);
        if (!parsed.success) {
          console.error('Validation error:', parsed.error);
          throw new Error('Data validation failed');
        }
        return parsed.data;
      });
    } catch (error) {
      console.error('Error validating query results:', error);
      throw error;
    }
  }
}

export const redshift = new Redshift();