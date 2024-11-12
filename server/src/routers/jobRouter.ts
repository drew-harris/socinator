import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { Job } from "core/jobs/index";
import {
  matchJobToMajorSOCCode,
  matchJobToMinorSOCCode,
  matchJobToBroadSOCCode,
  matchJobToDetailedSOCCode,
  majorSocGroups,
  minorSocGroups,
  broadSocGroups,
  detailedSocGroups,
} from "inference/index";

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

  inferMajorSOC: publicProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(async ({ input }) => {
      const jobData = await Job.getFullJobData(input.jobId);
      return matchJobToMajorSOCCode(jobData, majorSocGroups);
    }),

  inferMinorSOC: publicProcedure
    .input(z.object({ jobId: z.string(), majorSOCCode: z.string() }))
    .mutation(async ({ input }) => {
      const jobData = await Job.getFullJobData(input.jobId);
      return matchJobToMinorSOCCode(jobData, input.majorSOCCode, minorSocGroups);
    }),

  inferBroadSOC: publicProcedure
    .input(z.object({ jobId: z.string(), minorSOCCode: z.string() }))
    .mutation(async ({ input }) => {
      const jobData = await Job.getFullJobData(input.jobId);
      return matchJobToBroadSOCCode(jobData, input.minorSOCCode, broadSocGroups);
    }),

  inferDetailedSOC: publicProcedure
    .input(z.object({ jobId: z.string(), broadSOCCode: z.string() }))
    .mutation(async ({ input }) => {
      const jobData = await Job.getFullJobData(input.jobId);
      return matchJobToDetailedSOCCode(jobData, input.broadSOCCode, detailedSocGroups);
    }),
});
