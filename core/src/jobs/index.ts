import { z } from "zod";
import { db } from "../redshift";

export namespace Job {
  export const Info = z
    .object({
      JOB_ID: z.string(),
      ROLE_PRIMARY: z.string(),
      JOB_FAMILY: z.string(),
      SUB_JOB_FAMILY: z.string(),
      CAREER_STREAM: z.string(),
      SOC6D: z.string(),
      SOC6D_TITLE: z.string(),
      SENIORITY: z.string(),
      MODIFY_TIMESTAMP: z.string(),
      ROLE_EXTENDED: z.string(),
    })
    .partial();

  export type Info = z.infer<typeof Info>;

  export const TABLE = "job_predictions";

  export const getSampleJobs = async (offset: number = 0, limit = 5) => {
    const rows = await db`SELECT 
        job_id as "JOB_ID",
        COALESCE(role_primary, role_extended, soc6d_title, 'No Role') as "ROLE_PRIMARY",
        COALESCE(job_family, '') as "JOB_FAMILY",
        COALESCE(sub_job_family, '') as "SUB_JOB_FAMILY",
        COALESCE(career_stream, '') as "CAREER_STREAM",
        COALESCE(soc6d, '') as "SOC6D",
        COALESCE(soc6d_title, '') as "SOC6D_TITLE",
        COALESCE(seniority, '') as "SENIORITY",
        COALESCE(title, '') as "ROLE_PRIMARY"
      FROM job_predictions
      WHERE soc6d IS NOT NULL 
      LIMIT ${limit} OFFSET ${offset}`.execute();

    return rows;
  };

  export const getJobDetails = async (id: string) => {
    const result =
      await db`SELECT * FROM job_predictions WHERE job_id = ${id}`.execute();
    return result;
  };

  export async function getFullJobData(jobId: string): Promise<any> {
    const queries = [
      `SELECT * FROM job_predictions WHERE job_id = '${jobId}'`,
      // `SELECT title FROM job_predictions WHERE job_id = '${jobId}'`,
      // `SELECT * FROM job_predictions WHERE job_id = '${jobId}'`,
      // `SELECT role FROM job_predictions WHERE job_id = '${jobId}'`,
      // `SELECT "tag" FROM job_predictions WHERE job_id = '${jobId}'`,
    ];

    try {
      const results = await Promise.all(
        queries.map((query) => db.unsafe(query).execute()),
      );
      const [master, titles, roleMapping, fulltext, roles, tags] = results;

      return {
        ...master[0],
      };
    } catch (error) {
      console.error("Error fetching job data:", error);
      throw error;
    }
  }
}
