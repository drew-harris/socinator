import { ollama } from "./ollama";
import { SOCGroup } from "./types";
import { JobData } from "core/types";

function assignDetailedSOCCode(
  args: { [key: string]: any },
  validDetailedSOCCodes: string[],
  detailedSocGroups: SOCGroup[],
  broadSOCCode: string,
): string {
  const socCode = args.socCode;
  const socTitle = args.socTitle;

  if (!validDetailedSOCCodes.includes(socCode) && socCode !== broadSOCCode) {
    return JSON.stringify({
      SOCCode: broadSOCCode,
      SOCTitle: "Unable to assign more specific SOC code",
    });
  }

  const group =
    detailedSocGroups.find((group) => group.SOCCode === socCode) ||
    detailedSocGroups.find((group) => group.SOCCode === broadSOCCode);

  return JSON.stringify({
    SOCCode: socCode,
    SOCTitle: group ? group.SOCTitle : socTitle,
  });
}

export async function matchJobToDetailedSOCCode(
  jobData: Partial<JobData>,
  broadSOCCode: string,
  allSocGroups: SOCGroup[],
): Promise<{ SOCCode: string; SOCTitle: string }> {
  const detailedSocGroups = allSocGroups.filter(
    (group) =>
      group.SOCGroup === "Detailed" &&
      group.SOCCode.startsWith(broadSOCCode.slice(0, 5)),
  );
  const validDetailedSOCCodes = detailedSocGroups.map((group) => group.SOCCode);

  const broadSOCTitle = allSocGroups.find(
    (group) => group.SOCCode === broadSOCCode,
  )?.SOCTitle;

  const messages = [
    {
      role: "system",
      content:
        "You are an expert in job classification and SOC code assignment. Your task is to match job details to the most appropriate SOC detailed group within the previously assigned broad group. If you cannot confidently assign a more specific detailed code, you must return the broad SOC code. Output only the function call.",
    },
    {
      role: "user",
      content: `The job has been assigned to the broad SOC group ${broadSOCCode}. Your task is to determine if it can be confidently classified into a more specific detailed group. If not, return the broad SOC code. All detailed groups start with ${broadSOCCode.slice(
        0,
        5,
      )}.

Job Data:
${JSON.stringify(jobData, null, 2)}

Available SOC Detailed Groups (SOCCode: SOCTitle):
${detailedSocGroups
  .map((group) => `${group.SOCCode}: ${group.SOCTitle} `)
  .join("\n")}

Instructions:
1. Carefully analyze the job data provided.
2. Compare the job data against each of the available detailed SOC groups.
3. **Only assign a detailed SOC code if the job data explicitly mentions job titles or responsibilities that match a detailed group.**
4. If there is any uncertainty, insufficient information, or if the job could potentially fit into multiple categories, return the broad SOC code (${broadSOCCode}).
5. **Do not make assumptions or inferences beyond what is explicitly stated in the job data, including any assumptions based on the company name or industry.**
6. Note: Do not use external knowledge or assumptions about the company or industry. Only classify based on the job data provided.

Provide your answer by calling the \`assign_detailed_soc_code\` function with the \`socCode\` and \`socTitle\` from the list above, or use the broad SOC code if you cannot confidently assign a more specific code.

Examples of the expected function calls:

1. Clear match to a detailed group:
assign_detailed_soc_code({
  socCode: "11-1011",
  socTitle: "Chief Executives"
});

2. Insufficient information to assign a specific detailed group:
assign_detailed_soc_code({
  socCode: "${broadSOCCode}",
  socTitle: "${broadSOCTitle}"
});

3. Job could fit multiple detailed categories:
assign_detailed_soc_code({
  socCode: "${broadSOCCode}",
  socTitle: "${broadSOCTitle}"
});
`,
    },
  ];

  console.log(
    "Calling LLM for detailed SOC code with messages:",
    JSON.stringify(messages, null, 2),
  );

  try {
    const response = await ollama.chat({
      model: "llama3.1:8b",
      messages: messages,
      options: {
        temperature: 0.2,
      },
      tools: [
        {
          type: "function",
          function: {
            name: "assign_detailed_soc_code",
            description:
              "Assign an SOC detailed group code and title to a job, or return the broad SOC code if unable to confidently assign a more specific code.",
            parameters: {
              type: "object",
              properties: {
                socCode: {
                  type: "string",
                  description:
                    "The SOC detailed group code in XX-XXXX format, or the broad SOC code if unable to confidently assign a more specific code.",
                },
                socTitle: {
                  type: "string",
                  description:
                    "The title of the SOC detailed group, or the broad group title if returning the broad SOC code.",
                },
              },
              required: ["socCode", "socTitle"],
            },
          },
        },
      ],
    });

    console.log(
      "Raw LLM response for detailed SOC code:",
      JSON.stringify(response.message, null, 2),
    );

    if (
      !response.message.tool_calls ||
      response.message.tool_calls.length === 0
    ) {
      console.log(
        "The model didn't use the function for detailed SOC code. Its response was:",
      );
      console.log(response.message.content);
      return {
        SOCCode: broadSOCCode,
        SOCTitle: "Unable to assign more specific SOC code",
      };
    }

    const functionResponse = assignDetailedSOCCode(
      response.message.tool_calls[0].function.arguments,
      validDetailedSOCCodes,
      detailedSocGroups,
      broadSOCCode,
    );
    const parsedResponse = JSON.parse(functionResponse);

    return {
      SOCCode: parsedResponse.SOCCode,
      SOCTitle: parsedResponse.SOCTitle,
    };
  } catch (error) {
    console.error("Error calling LLM for detailed SOC code:", error);
    return {
      SOCCode: broadSOCCode,
      SOCTitle: "Error in detailed SOC code assignment",
    };
  }
}
