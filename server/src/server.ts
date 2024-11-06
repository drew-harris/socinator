import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import type { Env } from "./type";
import { redshift } from "core/redshift";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./routers/app";
import { Job } from "core/jobs/index";
import { inference } from "inference/index";

const app = new Hono<Env>();

app.use("*", async (c, next) => {
  c.set("redshift", redshift);
  await next();
});

app.post("/quick-infer", async (c) => {
  const { jobId } = (await c.req.json()) as unknown as { jobId: string };
  console.log("Job ID:", jobId);
  const jobInfo = await Job.getFullJobData(jobId);
  console.log(jobInfo);

  const inferResult = await inference({
    jobId: jobId,
    metadata: jobInfo,
  });

  console.log(inferResult);

  return c.json(inferResult);
});

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    onError: ({ error, path }) => {
      console.error(`Error in ${path}:`, error);
      if (error.cause) {
        console.error("Caused by:", error.cause);
      }
      throw error;
    },
  }),
);

app.get("/:path*", async (c) => {
  c.status(404);
  return c.json({
    message: "Not found",
  });
});

export const handler = handle(app);
