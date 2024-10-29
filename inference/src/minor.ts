import ollama from "ollama";
import { SOCGroup, JobData } from "./types";

function assignMinorSOCCode(
  args: { [key: string]: any },
  validMinorSOCCodes: string[],
  minorSocGroups: SOCGroup[],
  majorSOCCode: string,
): string {
  const socCode = args.socCode;
  const socTitle = args.socTitle;

  if (!validMinorSOCCodes.includes(socCode) && socCode !== majorSOCCode) {
    return JSON.stringify({
      SOCCode: majorSOCCode,
      SOCTitle: "Unable to assign more specific SOC code",
    });
  }

  const group =
    minorSocGroups.find((group) => group.SOCCode === socCode) ||
    minorSocGroups.find((group) => group.SOCCode === majorSOCCode);

  return JSON.stringify({
    SOCCode: socCode,
    SOCTitle: group ? group.SOCTitle : socTitle,
  });
}

export async function matchJobToMinorSOCCode(
  jobData: Partial<JobData>,
  majorSOCCode: string,
  allSocGroups: SOCGroup[],
): Promise<{ SOCCode: string; SOCTitle: string }> {
  const minorSocGroups = allSocGroups.filter(
    (group) =>
      group.SOCGroup === "Minor" &&
      group.SOCCode.startsWith(majorSOCCode.slice(0, 2)),
  );
  const validMinorSOCCodes = minorSocGroups.map((group) => group.SOCCode);

  const messages = [
    {
      role: "system",
      content:
        "You are an expert in job classification and SOC code assignment. Your task is to match job details to the most appropriate SOC minor group within the previously assigned major group. If you cannot confidently assign a more specific minor code, you must return the major SOC code. Output only the function call.",
    },
    {
      role: "user",
      content: `The job has been assigned to the major SOC group ${majorSOCCode}. Your task is to determine if it can be confidently classified into a more specific minor group. If not, return the major SOC code. All minor groups start with ${majorSOCCode.slice(
        0,
        2,
      )} and end with a non-zero value.

Job Data:
${JSON.stringify(jobData, null, 2)}

Available SOC Minor Groups (SOCCode: SOCTitle):
${minorSocGroups
  .map((group) => `${group.SOCCode}: ${group.SOCTitle} `)
  .join("\n")}

Instructions:
1. Carefully analyze the job data provided.
2. Compare the job data against each of the available minor SOC groups.
3. **Only assign a minor SOC code if the job data explicitly mentions job titles or responsibilities that match a minor group.**
4. If there is any uncertainty, insufficient information, or if the job could potentially fit into multiple categories, return the major SOC code (${majorSOCCode}).
5. **Do not make assumptions or inferences beyond what is explicitly stated in the job data, including any assumptions based on the company name or industry.**
6. Note: Do not use external knowledge or assumptions about the company or industry. Only classify based on the job data provided.

Provide your answer by calling the \`assign_minor_soc_code\` function with the \`socCode\` and \`socTitle\` from the list above, or use the major SOC code if you cannot confidently assign a more specific code.

Examples of the expected function calls:

1. Clear match to a minor group:
assign_minor_soc_code({
  socCode: "35-1000",
  socTitle: "Supervisors of Food Preparation and Serving Workers"
});

2. Insufficient information to assign a specific minor group:
assign_minor_soc_code({
  socCode: "${majorSOCCode}",
  socTitle: "Food Preparation and Serving Related Occupations"
});

3. Job could fit multiple minor categories:
assign_minor_soc_code({
  socCode: "${majorSOCCode}",
  socTitle: "Food Preparation and Serving Related Occupations"
});
`,
    },
  ];

  console.log(
    "Calling LLM for minor SOC code with messages:",
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
            name: "assign_minor_soc_code",
            description:
              "Assign an SOC minor group code and title to a job, or return the major SOC code if unable to confidently assign a more specific code.",
            parameters: {
              type: "object",
              properties: {
                socCode: {
                  type: "string",
                  description:
                    "The SOC minor group code in XX-XXXX format, or the major SOC code if unable to confidently assign a more specific code.",
                },
                socTitle: {
                  type: "string",
                  description:
                    "The title of the SOC minor group, or the major group title if returning the major SOC code.",
                },
              },
              required: ["socCode", "socTitle"],
            },
          },
        },
      ],
    });

    console.log(
      "Raw LLM response for minor SOC code:",
      JSON.stringify(response.message, null, 2),
    );

    if (
      !response.message.tool_calls ||
      response.message.tool_calls.length === 0
    ) {
      console.log(
        "The model didn't use the function for minor SOC code. Its response was:",
      );
      console.log(response.message.content);
      return {
        SOCCode: majorSOCCode,
        SOCTitle: "Unable to assign more specific SOC code",
      };
    }

    const functionResponse = assignMinorSOCCode(
      response.message.tool_calls[0].function.arguments,
      validMinorSOCCodes,
      minorSocGroups,
      majorSOCCode,
    );
    const parsedResponse = JSON.parse(functionResponse);

    return {
      SOCCode: parsedResponse.SOCCode,
      SOCTitle: parsedResponse.SOCTitle,
    };
  } catch (error) {
    console.error("Error calling LLM for minor SOC code:", error);
    return {
      SOCCode: majorSOCCode,
      SOCTitle: "Error in minor SOC code assignment",
    };
  }
}
