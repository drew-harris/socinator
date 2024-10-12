import { router } from "../trpc";
import { jobRouter } from "./jobRouter";

export const appRouter = router({
  jobs: jobRouter,
});

export type AppRouter = typeof appRouter;
