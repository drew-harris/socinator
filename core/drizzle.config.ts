import { Resource } from "sst";
import { defineConfig } from "drizzle-kit";

console.log(Resource.db.dbUrl);

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    url: Resource.db.dbUrl,
    ssl: false,
  },
  // Pick up all our schema files
  schema: ["./src/**/*.sql.ts"],
  out: "./migrations",
});
