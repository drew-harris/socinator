import { publicProcedure, router } from "../trpc";
import { Jobs } from "core/jobs/index";

export const jobRouter = router({
  getSample: publicProcedure.query(async () => {
    const sample = await Jobs.getSampleJobs();
    return sample;
  }),
});
