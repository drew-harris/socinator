import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { Jobs } from "core/jobs/index";

export const jobRouter = router({
  getSample: publicProcedure
    .input(
      z.object({
        offset: z.number().optional(),
      }),
    )
    .query(async ({ input }) => {
      const sample = await Jobs.getSampleJobs(input.offset);
      return sample;
    }),
});
