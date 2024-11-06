import { z } from "zod";
import { redshift } from "../redshift";

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

  export const TABLE = "directaccess_db.production.greenwich_role_mapping";

  export const getSampleJobs = async (offset: number = 0, limit = 5) => {
    const rows = await redshift.validatedQuery(
      `SELECT 
        job_id as "JOB_ID",
        COALESCE(role_primary, role_extended, soc6d_title, 'No Role') as "ROLE_PRIMARY",
        COALESCE(job_family, '') as "JOB_FAMILY",
        COALESCE(sub_job_family, '') as "SUB_JOB_FAMILY",
        COALESCE(career_stream, '') as "CAREER_STREAM",
        COALESCE(soc6d, '') as "SOC6D",
        COALESCE(soc6d_title, '') as "SOC6D_TITLE",
        COALESCE(seniority, '') as "SENIORITY",
        COALESCE(modify_timestamp::text, '') as "MODIFY_TIMESTAMP",
        COALESCE(role_extended, '') as "ROLE_EXTENDED"
      FROM ${TABLE} 
      WHERE soc6d IS NOT NULL 
      LIMIT $1 OFFSET $2`,
      Info,
      [limit, offset],
    );

    return rows;
  };

  export const getJobDetails = async (id: string) => {
    const result = await redshift.query(
      `SELECT * FROM directaccess_db.production.greenwich_master WHERE job_id = $1`,
      [id],
    );
    return result;
  };

  export async function getFullJobData(jobId: string): Promise<any> {
    const queries = [
      `SELECT * FROM directaccess_db.production.greenwich_master WHERE job_id = '${jobId}'`,
      `SELECT title FROM directaccess_db.production.greenwich_titles WHERE job_id = '${jobId}'`,
      `SELECT * FROM directaccess_db.production.greenwich_role_mapping WHERE job_id = '${jobId}'`,
      `SELECT job_summary FROM directaccess_db.production.greenwich_fulltext WHERE job_id = '${jobId}'`,
      `SELECT role FROM directaccess_db.production.greenwich_role WHERE job_id = '${jobId}'`,
      `SELECT "tag" FROM directaccess_db.production.greenwich_tags WHERE job_id = '${jobId}'`,
    ];

    try {
      const results = await Promise.all(
        queries.map((query) => redshift.query(query)),
      );
      const [master, titles, roleMapping, fulltext, roles, tags] = results;

      return {
        ...master[0],
        title: titles[0]?.title,
        ...roleMapping[0],
        job_summary: fulltext[0]?.job_summary,
        roles: roles.map((r) => r.role),
        tags: tags.map((t) => t.tag),
      };
    } catch (error) {
      console.error("Error fetching job data:", error);
      throw error;
    }
  }
}
