import postgres from "postgres";
import { Client as TSClient } from "typesense";
import { Resource } from "sst/resource";

console.log(Resource.TYPESENSE_HOST.value);
console.log(Resource.CAM_DB_URI.value);
console.log(Resource.TYPESENSE_KEY.value);

const db = postgres(Resource.CAM_DB_URI.value);

const typesense = new TSClient({
  nodes: [
    {
      host: Resource.TYPESENSE_HOST.value,
      port: 80,
      protocol: "http",
    },
  ],
  apiKey: Resource.TYPESENSE_KEY.value,
});

let stop = false;

let rowCount = 0;

const insertRows = async () => {
  // parse int of job_id text field and only get evens
  await db`SELECT * from job_predictions
  WHERE job_id::int % 10 != 0
`.cursor(40, async (rows) => {
    const mapped = rows.map((r) => ({
      id: r.job_id,
      ...r,
    }));

    await typesense
      .collections("llm_results")
      .documents()
      .import(mapped, { action: "upsert" });

    if (stop) throw new Error("STOp");
    rowCount += mapped.length;
    if (rowCount % 100 === 0) {
      console.log(`Inserted ${rowCount} rows`);
    }
    return true;
  });
};

const setupTable = async () => {
  typesense.collections().create({
    name: "llm_results",
    fields: [
      {
        name: "title",
        type: "string",
        stem: true,
        index: true,
      },
      {
        name: "company",
        type: "string",
        index: true,
      },
      {
        name: "tags",
        type: "string",
        index: true,
      },
      {
        name: "roles",
        type: "string",
        index: true,
      },
      {
        name: "predictedmajorsoctitle",
        type: "string",
        stem: true,
        index: true,
      },
      {
        name: "predictedminorsoctitle",
        type: "string",
        stem: true,
        index: true,
      },
      {
        name: "embedding",
        type: "float[]",
        embed: {
          from: ["title", "tags", "roles"],
          model_config: {
            model_name: "openai/text-embedding-3-small",
            api_key: "REDACTED LOL",
          },
        },
      },
      {
        name: ".*",
        type: "auto",
        index: true,
        facet: false,
      },
    ],
  });
};

const wipeIndex = async () => {
  await typesense.collections("llm_results").delete();
};

// When process is siginted kill db
process.on("SIGINT", async () => {
  stop = true;
});

insertRows();
// setupTable();
// wipeIndex();
