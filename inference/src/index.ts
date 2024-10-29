// src/index.ts
import { Hono } from "hono";
import { getJobData } from "./db";
import { matchJobToMajorSOCCode } from "./major";
import { matchJobToMinorSOCCode } from "./minor";
import { matchJobToBroadSOCCode } from "./broad";
import { matchJobToDetailedSOCCode } from "./detailed";
import { SOCGroup, JobData, SOCCodeResult } from "./types";

import socData from "./soc_defined.json";
// Store all SOC groups
const allSocGroups: SOCGroup[] = socData.SOCGroups;
// Filter SOC groups for each type
const majorSocGroups: SOCGroup[] = allSocGroups.filter(
  (group: SOCGroup) => group.SOCGroup === "Major",
);
const minorSocGroups: SOCGroup[] = allSocGroups.filter(
  (group: SOCGroup) => group.SOCGroup === "Minor",
);
const broadSocGroups: SOCGroup[] = allSocGroups.filter(
  (group: SOCGroup) => group.SOCGroup === "Broad",
);
const detailedSocGroups: SOCGroup[] = allSocGroups.filter(
  (group: SOCGroup) => group.SOCGroup === "Detailed",
);

// Make validSOCCodes available globally for each group type
export const validMajorSOCCodes = majorSocGroups.map((group) => group.SOCCode);
export const validMinorSOCCodes = minorSocGroups.map((group) => group.SOCCode);
export const validBroadSOCCodes = broadSocGroups.map((group) => group.SOCCode);
export const validDetailedSOCCodes = detailedSocGroups.map(
  (group) => group.SOCCode,
);

// Function to filter out specific fields from job data
function filterJobData(jobData: JobData): Partial<JobData> {
  const {
    soc6d,
    soc6d_title,
    location,
    city,
    state,
    state_long,
    zip,
    county,
    region_state,
    country,
    latitude,
    longitude,
    language,
    region_country,
    region_global,
    region_local,
    currency,
    scrape_timestamp,
    modify_timestamp,
    meta_num_roles,
    meta_num_tags,
    meta_num_titles,
    ...filteredData
  } = jobData;
  return filteredData;
}

app.get("/assign-soc-code/:jobId", async (c) => {
  const jobId = c.req.param("jobId");
  try {
    const jobData: JobData = await getJobData(jobId);
    if (!jobData) {
      return c.json({ error: "Job not found" }, 404);
    }
    console.log("Job data:", JSON.stringify(jobData, null, 2));

    // Filter the job data
    const filteredJobData = filterJobData(jobData);

    console.log("Filtered Job data:", JSON.stringify(filteredJobData, null, 2));

    const majorSocMatch = await matchJobToMajorSOCCode(
      filteredJobData,
      majorSocGroups,
    );
    console.log(
      "Major SOC match result:",
      JSON.stringify(majorSocMatch, null, 2),
    );

    if (majorSocMatch.SOCCode === "Unassigned") {
      return c.json(
        {
          error: "Unable to assign SOC code",
          details: majorSocMatch.SOCTitle,
        },
        400,
      );
    }

    let result: SOCCodeResult = {
      jobId: jobData.job_id,
      jobTitle: jobData.title || "Unknown",
      majorSOCCode: majorSocMatch.SOCCode,
      majorSOCTitle: majorSocMatch.SOCTitle,
      minorSOCCode: majorSocMatch.SOCCode,
      minorSOCTitle: majorSocMatch.SOCTitle,
      broadSOCCode: majorSocMatch.SOCCode,
      broadSOCTitle: majorSocMatch.SOCTitle,
      detailedSOCCode: majorSocMatch.SOCCode,
      detailedSOCTitle: majorSocMatch.SOCTitle,
    };

    // If major SOC code is assigned, try to assign a minor SOC code
    const minorSocMatch = await matchJobToMinorSOCCode(
      filteredJobData,
      majorSocMatch.SOCCode,
      minorSocGroups,
    );
    console.log(
      "Minor SOC match result:",
      JSON.stringify(minorSocMatch, null, 2),
    );

    if (minorSocMatch.SOCCode !== majorSocMatch.SOCCode) {
      result.minorSOCCode = minorSocMatch.SOCCode;
      result.minorSOCTitle = minorSocMatch.SOCTitle;
      result.broadSOCCode = minorSocMatch.SOCCode;
      result.broadSOCTitle = minorSocMatch.SOCTitle;
      result.detailedSOCCode = minorSocMatch.SOCCode;
      result.detailedSOCTitle = minorSocMatch.SOCTitle;

      // If minor SOC code is different, try to assign a broad SOC code
      const broadSocMatch = await matchJobToBroadSOCCode(
        filteredJobData,
        minorSocMatch.SOCCode,
        broadSocGroups,
      );
      console.log(
        "Broad SOC match result:",
        JSON.stringify(broadSocMatch, null, 2),
      );

      if (broadSocMatch.SOCCode !== minorSocMatch.SOCCode) {
        result.broadSOCCode = broadSocMatch.SOCCode;
        result.broadSOCTitle = broadSocMatch.SOCTitle;
        result.detailedSOCCode = broadSocMatch.SOCCode;
        result.detailedSOCTitle = broadSocMatch.SOCTitle;

        // If broad SOC code is different, try to assign a detailed SOC code
        const detailedSocMatch = await matchJobToDetailedSOCCode(
          filteredJobData,
          broadSocMatch.SOCCode,
          detailedSocGroups,
        );
        console.log(
          "Detailed SOC match result:",
          JSON.stringify(detailedSocMatch, null, 2),
        );

        if (detailedSocMatch.SOCCode !== broadSocMatch.SOCCode) {
          result.detailedSOCCode = detailedSocMatch.SOCCode;
          result.detailedSOCTitle = detailedSocMatch.SOCTitle;
        }
      }
    }

    // Return the final result
    return c.json(result);
  } catch (error: any) {
    console.error("Error in /assign-soc-code:", error);
    return c.json(
      {
        error: "An error occurred while assigning SOC code",
        details: error.message,
      },
      500,
    );
  }
});
