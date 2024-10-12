import { snowflake } from "core/snowflake";
import { publicProcedure, router } from "../trpc";

const TABLE = "GHR_DIRECTACCESS_US.PRODUCTION_US.GREENWICH_ROLE_MAPPING_PROD";

export const jobRouter = router({
  getSample: publicProcedure.query(async ({ ctx }) => {
    const rows = await snowflake.query({
      sqlText: `SELECT * FROM ${TABLE} LIMIT 5;`,
    });
    return {
      test: "working" as const,
      rows: rows,
    };
  }),
});
