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
  retryIntervalSeconds: 2,
  numRetries: 999,
  timeoutSeconds: 9999,
});

let stop = false;

let rowCount = 0;

let broadCorrect = 0;
let detailedCorrect = 0;
let majorCorrect = 0;
let minorCorrect = 0;

const reportStats = () => {
  console.log(`\n`);
  console.log(`Processed ${rowCount} rows`);
  console.log(
    `Broad Correct: ${broadCorrect} (${((broadCorrect / rowCount) * 100).toFixed(2)}%)`,
  );
  console.log(
    `Detailed Correct: ${detailedCorrect} (${((detailedCorrect / rowCount) * 100).toFixed(2)}%)`,
  );
  console.log(
    `Major Correct: ${majorCorrect} (${((majorCorrect / rowCount) * 100).toFixed(2)}%)`,
  );
  console.log(
    `Minor Correct: ${minorCorrect} (${((minorCorrect / rowCount) * 100).toFixed(2)}%)`,
  );
};

const guessRows = async () => {
  // parse int of job_id text field and only get ODDS
  await db`SELECT * from job_predictions
  WHERE job_id::int % 10 = 0
`.cursor(4, async (rows) => {
    rowCount += 4;
    await Promise.all(
      rows.map(async (row) => {
        if (stop) throw new Error("STOop");
        if (!row.title && !row.role_extended) return;
        const query = `${row.title || row.role_extended}`;

        const results = await typesense
          .collections("llm_results")
          .documents()
          .search({
            q: query,
            prefix: false,
            query_by:
              "title,roles,tags,predictedbroadsoctitle,predictedmajorsoctitle",
            limit_hits: 1,
            prioritize_exact_match: true,
            // vector_query: "embedding:([], alpha: 0.8)",
            limit: 1,
          });

        if (!results.found) {
          return;
        }

        const hit = results.hits?.at(0)!.document as Record<string, string>;
        console.log(results.search_time_ms);

        let fulltext_broad = hit.predictedbroadsoccode;
        let fulltext_detailed = hit.predicteddetailedsoccode;
        let fulltext_major = hit.predictedmajorsoccode;
        let fulltext_minor = hit.predictedminorsoccode;

        let fulltext_broad_actual = row.predictedbroadsoccode;
        let fulltext_detailed_actual = row.predicteddetailedsoccode;
        let fulltext_major_actual = row.predictedmajorsoccode;
        let fulltext_minor_actual = row.predictedminorsoccode;

        if (
          fulltext_broad &&
          fulltext_broad_actual &&
          fulltext_broad === fulltext_broad_actual
        ) {
          broadCorrect++;
          // console.log("Broad Correct");
        }
        if (
          fulltext_detailed &&
          fulltext_detailed_actual &&
          fulltext_detailed === fulltext_detailed_actual
        ) {
          detailedCorrect++;
          // console.log("Detailed Correct");
        }
        if (
          fulltext_major &&
          fulltext_major_actual &&
          fulltext_major === fulltext_major_actual
        ) {
          majorCorrect++;
          // console.log("Major Correct");
        }
        if (
          fulltext_minor &&
          fulltext_minor_actual &&
          fulltext_minor === fulltext_minor_actual
        ) {
          minorCorrect++;
          // console.log("Minor Correct");
        }

        return true;
      }),
    );
    reportStats();
  });
};

// When process is siginted kill db
process.on("SIGINT", async () => {
  stop = true;
});

guessRows();
// setupTable();
