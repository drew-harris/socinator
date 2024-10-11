import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const TEST_ROW = pgTable("test-row", {
  id: text("id").primaryKey(),
  jobId: integer("job_id").notNull(),
  metadata: jsonb("metadata"),
  prediction: text("prediction"),
  actual: text("actual"),
  isCorrect: text("is_correct"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  trialName: text("trial_name"),
});
