import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { Job } from "core/jobs/index";

export const jobRouter = router({
  getSample: publicProcedure
    .input(
      z.object({
        offset: z.number().optional(),
        limit: z.number().optional(),
      }),
    )
    .query(async ({ input }) => {
      const sample = await Job.getSampleJobs(input.offset, input.limit);
      return sample;
    }),
});
