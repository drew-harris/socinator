import { Snowflake } from "../snowflake";

export namespace Jobs {
  export const TABLE =
    "GHR_DIRECTACCESS_US.PRODUCTION_US.GREENWICH_ROLE_MAPPING_PROD";
  const bigQuery = `
WITH base_data AS (
    SELECT 
        r.JOB_ID,
        r.JOB_FAMILY,
        r.SUB_JOB_FAMILY,
        r.CAREER_STREAM,
        r.SENIORITY,
        r.ROLE_EXTENDED,
        r.SOC6D,
        r.SOC6D_TITLE,
        m.VERTICAL,
        m.ROLE_PRIMARY,
        m.COMPANY,
        m.POST_DATE,
        m.SALARY,
        m.LOCATION,
        m.CITY,
        m.STATE,
        m.STATE_LONG,
        m.ZIP,
        m.COUNTY,
        m.REGION_STATE,
        m.COUNTRY,
        m.LATITUDE,
        m.LONGITUDE,
        m.SIC_PRIMARY,
        m.NAICS_PRIMARY,
        m.COMPANY_REF,
        m.TICKER,
        m.COMPANY_PARENT,
        m.REGION_COUNTRY,
        m.REGION_GLOBAL,
        m.REGION_LOCAL,
        m.CURRENCY,
        m.LANGUAGE,
        m.SCRAPE_TIMESTAMP,
        m.MODIFY_TIMESTAMP,
        m.META_NUM_ROLES,
        m.META_NUM_TAGS,
        m.META_NUM_TITLES
    FROM 
        GHR_DIRECTACCESS_US.PRODUCTION_US.GREENWICH_ROLE_MAPPING_PROD r
    WHERE 
        r.JOB_ID = ?
    JOIN 
        GHR_DIRECTACCESS_US.PRODUCTION_US.GREENWICH_MASTER_PROD m ON r.JOB_ID = m.JOB_ID
)
SELECT 
    b.*,
    rl.ROLE AS ROLE_PROD,
    t.TITLE,
    tl.STATUS,
    tl.REMOVE_DATE,
    tl.DURATION_DAYS,
    s.SALARY_MODELED,
    s.SALARY_ESTIMATED,
    s.SALARY_COMPANY,
    s.SALARY_DISCOVERED,
    s.SAL_EST_LOW,
    s.SAL_EST_HIGH,
    s.SAL_COMP_LOW,
    s.SAL_COMP_HIGH,
    s.SAL_DISC_LOW,
    s.SAL_DISC_HIGH,
    s.QUAL_FLAG_EST,
    s.QUAL_FLAG_COMP,
    s.QUAL_FLAG_DISC,
    s.SALARY_PUBLISHED,
    s.SALARY_PUBLISHED_SOURCE
FROM 
    base_data b
WHERE 
    b.JOB_ID = ?
LEFT JOIN 
    GHR_DIRECTACCESS_US.PRODUCTION_US.GREENWICH_ROLE_PROD rl ON b.JOB_ID = rl.JOB_ID
LEFT JOIN 
    GHR_DIRECTACCESS_US.PRODUCTION_US.GREENWICH_SALARY_PROD s ON b.JOB_ID = s.JOB_ID
LEFT JOIN 
    GHR_DIRECTACCESS_US.PRODUCTION_US.GREENWICH_TIMELOG_PROD tl ON b.JOB_ID = tl.JOB_ID
LEFT JOIN 
    GHR_DIRECTACCESS_US.PRODUCTION_US.GREENWICH_TITLES_PROD t ON b.JOB_ID = t.JOB_ID;
`;

  export const getJobDetails = async (snowflake: Snowflake, id: number) => {
    const result = await snowflake.query({
      sqlText: bigQuery,
      binds: [id, id],
    });
    return result;
  };

  export const getSampleJobs = async (snowflake: Snowflake) => {
    const rows = await snowflake.query({
      sqlText: `SELECT * FROM ${TABLE} LIMIT 5;`,
    });
    return rows;
  };
}
