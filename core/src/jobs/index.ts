import { z } from "zod";
import { redshift } from "../redshift";

export namespace Job {
  export const Info = z.object({
    JOB_ID: z.number().nullable(),
    ROLE_PRIMARY: z.string().nullable(),
    JOB_FAMILY: z.string().nullable(),
    SUB_JOB_FAMILY: z.string().nullable(),
    CAREER_STREAM: z.string().nullable(),
    SOC6D: z.string().nullable(),
    SOC6D_TITLE: z.string().nullable(),
    SENIORITY: z.string().nullable(),
    MODIFY_TIMESTAMP: z.date().nullable(),
    ROLE_EXTENDED: z.string().nullable(),
  });

  export type Info = z.infer<typeof Info>;

  export const TABLE = "directaccess_db.production.greenwich_role_mapping";

  export const getSampleJobs = async (offset: number = 0, limit = 5) => {
    const rows = await redshift.validatedQuery(
      `SELECT 
        job_id as "JOB_ID",
        role_primary as "ROLE_PRIMARY",
        job_family as "JOB_FAMILY",
        sub_job_family as "SUB_JOB_FAMILY",
        career_stream as "CAREER_STREAM",
        soc6d as "SOC6D",
        soc6d_title as "SOC6D_TITLE",
        seniority as "SENIORITY",
        modify_timestamp as "MODIFY_TIMESTAMP",
        role_extended as "ROLE_EXTENDED"
      FROM ${TABLE} 
      WHERE soc6d IS NOT NULL 
      LIMIT $1 OFFSET $2`,
      Info,
      [limit, offset]
    );
    return rows;
  };

  export const getJobDetails = async (id: number) => {
    const result = await redshift.query(
      `SELECT * FROM directaccess_db.production.greenwich_master WHERE job_id = $1`,
      [id]
    );
    return result;
  };
}
