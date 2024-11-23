// src/index.ts
export { matchJobToMajorSOCCode } from "./major";
export { matchJobToMinorSOCCode } from "./minor";
export { matchJobToBroadSOCCode } from "./broad";
export { matchJobToDetailedSOCCode } from "./detailed";
import { SOCGroup, SOCCodeResult } from "./types";
import { Inference, type JobData } from "core/types";

import socData from "./soc_defined.json";
import { matchJobToMajorSOCCode } from "./major";
import { matchJobToMinorSOCCode } from "./minor";
import { matchJobToBroadSOCCode } from "./broad";
import { matchJobToDetailedSOCCode } from "./detailed";
// Store all SOC groups
const allSocGroups: SOCGroup[] = socData.SOCGroups;
// Filter SOC groups for each type
export const majorSocGroups = allSocGroups.filter(
  (group: SOCGroup) => group.SOCGroup === "Major",
);
export const minorSocGroups = allSocGroups.filter(
  (group: SOCGroup) => group.SOCGroup === "Minor",
);
export const broadSocGroups = allSocGroups.filter(
  (group: SOCGroup) => group.SOCGroup === "Broad",
);
export const detailedSocGroups = allSocGroups.filter(
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
function filterJobData(jobData: Partial<JobData>): Partial<JobData> {
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

export const inference: Inference = async ({ metadata }) => {
  const jobData = metadata;
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
    throw new Error(
      "Unable to assign SOC code, major soc match was unassigned",
    );
  }

  if (!jobData.job_id) {
    throw new Error("Job ID is missing");
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

  try {
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

    // Update result with minor SOC code if different from major
    if (minorSocMatch.SOCCode !== majorSocMatch.SOCCode) {
      result.minorSOCCode = minorSocMatch.SOCCode;
      result.minorSOCTitle = minorSocMatch.SOCTitle;
      result.broadSOCCode = minorSocMatch.SOCCode;
      result.broadSOCTitle = minorSocMatch.SOCTitle;
      result.detailedSOCCode = minorSocMatch.SOCCode;
      result.detailedSOCTitle = minorSocMatch.SOCTitle;

      try {
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

        // Update result with broad SOC code if different from minor
        if (broadSocMatch.SOCCode !== minorSocMatch.SOCCode) {
          result.broadSOCCode = broadSocMatch.SOCCode;
          result.broadSOCTitle = broadSocMatch.SOCTitle;
          result.detailedSOCCode = broadSocMatch.SOCCode;
          result.detailedSOCTitle = broadSocMatch.SOCTitle;

          try {
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

            // Update result with detailed SOC code if different from broad
            if (detailedSocMatch.SOCCode !== broadSocMatch.SOCCode) {
              result.detailedSOCCode = detailedSocMatch.SOCCode;
              result.detailedSOCTitle = detailedSocMatch.SOCTitle;
            }
          } catch (error) {
            console.error("Error in detailed SOC code matching:", error);
            // Continue with existing broad SOC code
          }
        }
      } catch (error) {
        console.error("Error in broad SOC code matching:", error);
        // Continue with existing minor SOC code
      }
    }
  } catch (error) {
    console.error("Error in minor SOC code matching:", error);
    // Continue with existing major SOC code
  }

  // Always return a result, even if only major SOC code is assigned
  return result;
};

