import ollama from "ollama";
import { SOCGroup, JobData } from "./types";

function assignBroadSOCCode(
  args: { [key: string]: any },
  validBroadSOCCodes: string[],
  broadSocGroups: SOCGroup[],
  minorSOCCode: string,
): string {
  const socCode = args.socCode;
  const socTitle = args.socTitle;

  if (!validBroadSOCCodes.includes(socCode) && socCode !== minorSOCCode) {
    return JSON.stringify({
      SOCCode: minorSOCCode,
      SOCTitle: "Unable to assign more specific SOC code",
    });
  }

  const group =
    broadSocGroups.find((group) => group.SOCCode === socCode) ||
    broadSocGroups.find((group) => group.SOCCode === minorSOCCode);

  return JSON.stringify({
    SOCCode: socCode,
    SOCTitle: group ? group.SOCTitle : socTitle,
  });
}

export async function matchJobToBroadSOCCode(
  jobData: Partial<JobData>,
  minorSOCCode: string,
  allSocGroups: SOCGroup[],
): Promise<{ SOCCode: string; SOCTitle: string }> {
  const broadSocGroups = allSocGroups.filter(
    (group) =>
      group.SOCGroup === "Broad" &&
      group.SOCCode.startsWith(minorSOCCode.slice(0, 4)),
  );
  const validBroadSOCCodes = broadSocGroups.map((group) => group.SOCCode);

  const messages = [
    {
      role: "system",
      content:
        "You are an expert in job classification and SOC code assignment. Your task is to match job details to the most appropriate SOC broad group within the previously assigned minor group. If you cannot confidently assign a more specific broad code, you must return the minor SOC code. Output only the function call.",
    },
    {
      role: "user",
      content: `The job has been assigned to the minor SOC group ${minorSOCCode}. Your task is to determine if it can be confidently classified into a more specific broad group. If not, return the minor SOC code. All broad groups start with ${minorSOCCode.slice(
        0,
        4,
      )}.

Job Data:
${JSON.stringify(jobData, null, 2)}

Available SOC Broad Groups (SOCCode: SOCTitle):
${broadSocGroups
  .map((group) => `${group.SOCCode}: ${group.SOCTitle} `)
  .join("\n")}

Instructions:
1. Carefully analyze the job data provided.
2. Compare the job data against each of the available broad SOC groups.
3. **Only assign a broad SOC code if the job data explicitly mentions job titles or responsibilities that match a broad group.**
4. If there is any uncertainty, insufficient information, or if the job could potentially fit into multiple categories, return the minor SOC code (${minorSOCCode}).
5. **Do not make assumptions or inferences beyond what is explicitly stated in the job data, including any assumptions based on the company name or industry.**
6. Note: Do not use external knowledge or assumptions about the company or industry. Only classify based on the job data provided.

Provide your answer by calling the \`assign_broad_soc_code\` function with the \`socCode\` and \`socTitle\` from the list above, or use the minor SOC code if you cannot confidently assign a more specific code.

Examples of the expected function calls:

1. Clear match to a broad group:
assign_broad_soc_code({
  socCode: "11-1010",
  socTitle: "Chief Executives"
});

2. Insufficient information to assign a specific broad group:
assign_broad_soc_code({
  socCode: "${minorSOCCode}",
  socTitle: "Top Executives"
});

3. Job could fit multiple broad categories:
assign_broad_soc_code({
  socCode: "${minorSOCCode}",
  socTitle: "Top Executives"
});
`,
    },
  ];

  console.log(
    "Calling LLM for broad SOC code with messages:",
    JSON.stringify(messages, null, 2),
  );

  try {
    const response = await ollama.chat({
      model: "llama3.1:latest",
      messages: messages,
      options: {
        temperature: 0.2,
      },
      tools: [
        {
          type: "function",
          function: {
            name: "assign_broad_soc_code",
            description:
              "Assign an SOC broad group code and title to a job, or return the minor SOC code if unable to confidently assign a more specific code.",
            parameters: {
              type: "object",
              properties: {
                socCode: {
                  type: "string",
                  description:
                    "The SOC broad group code in XX-XXXX format, or the minor SOC code if unable to confidently assign a more specific code.",
                },
                socTitle: {
                  type: "string",
                  description:
                    "The title of the SOC broad group, or the minor group title if returning the minor SOC code.",
                },
              },
              required: ["socCode", "socTitle"],
            },
          },
        },
      ],
    });

    console.log(
      "Raw LLM response for broad SOC code:",
      JSON.stringify(response.message, null, 2),
    );

    if (
      !response.message.tool_calls ||
      response.message.tool_calls.length === 0
    ) {
      console.log(
        "The model didn't use the function for broad SOC code. Its response was:",
      );
      console.log(response.message.content);
      return {
        SOCCode: minorSOCCode,
        SOCTitle: "Unable to assign more specific SOC code",
      };
    }

    const functionResponse = assignBroadSOCCode(
      response.message.tool_calls[0].function.arguments,
      validBroadSOCCodes,
      broadSocGroups,
      minorSOCCode,
    );
    const parsedResponse = JSON.parse(functionResponse);

    return {
      SOCCode: parsedResponse.SOCCode,
      SOCTitle: parsedResponse.SOCTitle,
    };
  } catch (error) {
    console.error("Error calling LLM for broad SOC code:", error);
    return {
      SOCCode: minorSOCCode,
      SOCTitle: "Error in broad SOC code assignment",
    };
  }
}
