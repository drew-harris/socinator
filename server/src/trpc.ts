import { initTRPC } from "@trpc/server";
import type { Env } from "./type";
const t = initTRPC.context<Env["Variables"]>().create();
export const router = t.router;
export const publicProcedure = t.procedure;

const TABLE = "GHR_DIRECTACCESS_US.PRODUCTION_US.GREENWICH_ROLE_MAPPING_PROD";

export const appRouter = router({
  test: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.snowflake.query({
      sqlText: `SELECT * FROM ${TABLE} LIMIT 5;`,
    });
    return {
      test: "working" as const,
      rows: rows,
    };
  }),
});

export type AppRouter = typeof appRouter;
