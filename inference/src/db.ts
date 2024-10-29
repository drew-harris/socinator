// src/db.ts
import pg from "pg";

interface RedshiftConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
}

const redshiftConfig: RedshiftConfig = {
  user: "REDACTED",
  password: "REDACTED",
  host: "REDACTED",
  port: 5439,
  database: "REDACTED",
};

export async function executeQuery(query: string): Promise<any[]> {
  const client = new pg.Client(redshiftConfig);
  try {
    await client.connect();
    const result = await client.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  } finally {
    await client.end();
  }
}

export async function getJobData(jobId: string): Promise<any> {
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
      queries.map((query) => executeQuery(query)),
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

const productionTables = [
  "greenwich_master",
  "greenwich_role",
  "greenwich_tags",
  "greenwich_titles",
  "greenwich_timelog",
  "greenwich_role_mapping",
  "greenwich_salary",
  "greenwich_fulltext",
];
