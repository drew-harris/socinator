import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { Job } from "core/jobs/index";
import { inference } from "inference/index";

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

  getFullData: publicProcedure
    .input(
      z.object({
        jobId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const sample = await Job.getFullJobData(input.jobId);
      return sample;
    }),

  getInference: publicProcedure
    .input(
      z.object({
        jobId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const sample = await Job.getFullJobData(input.jobId);

      const inferenceResult = await inference({
        jobId: input.jobId,
        metadata: sample,
      });
      return inferenceResult;
    }),
});
