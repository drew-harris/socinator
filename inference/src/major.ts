// src/llm.ts
import { ollama } from "./ollama";
import { SOCGroup } from "./types";
import { JobData } from "core/types";

function assignMajorSOCCode(
  args: { [key: string]: any },
  validSOCCodes: string[],
  socGroups: SOCGroup[],
): string {
  const socCode = args.socCode;
  const socTitle = args.socTitle;

  if (socCode === "Unassigned") {
    return JSON.stringify({
      SOCCode: "Unassigned",
      SOCTitle: "Unable to assign SOC code",
    });
  }

  if (!validSOCCodes.includes(socCode)) {
    return JSON.stringify({ error: "Invalid SOC code" });
  }

  const majorGroup = socGroups.find((group) => group.SOCCode === socCode);

  return JSON.stringify({
    SOCCode: socCode,
    SOCTitle: majorGroup ? majorGroup.SOCTitle : socTitle,
  });
}

export async function matchJobToMajorSOCCode(
  jobData: Partial<JobData>,
  socGroups: SOCGroup[],
): Promise<{ SOCCode: string; SOCTitle: string }> {
  const validSOCCodes = socGroups.map((group) => group.SOCCode);

  const messages = [
    {
      role: "system",
      content:
        "You are an expert in job classification and SOC code assignment. Your task is to match job details to the most appropriate SOC major group from the list provided. You must only choose from the major SOC codes provided or return 'Unassigned' if you cannot confidently assign a code. Output only the function call.",
    },
    {
      role: "user",
      content: `Please match the following job to the most appropriate SOC Major Groups (XX-0000 format) from the list provided below. All major groups end in 0000. If you cannot confidently assign a Major Group SOC code, return 'Unassigned'.

Job Data:
${JSON.stringify(jobData, null, 2)}

Available SOC Major Groups (SOCCode: SOCTitle):
${socGroups.map((group) => `${group.SOCCode}: ${group.SOCTitle} `).join("\n")}

Instructions:
1. Carefully analyze the job data provided.
2. Compare the job data against each of the available major SOC groups.
3. **Only assign a major SOC code if the job data explicitly mentions job titles or responsibilities that match a major group.**
4. If there is any uncertainty, insufficient information, or if the job could potentially fit into multiple categories, return 'Unassigned'.
5. **Do not make assumptions or inferences beyond what is explicitly stated in the job data, including any assumptions based on the company name or industry.**
6. Note: Do not use external knowledge or assumptions about the company or industry. Only classify based on the job data provided.

Provide your answer by calling the \`assign_major_soc_code\` function with the \`socCode\` and \`socTitle\` from the list above, or use 'Unassigned' if you cannot confidently assign a code.

Example of the expected function calls:

1. Clear match to a major group:
assign_major_soc_code({
  socCode: "11-0000",
  socTitle: "Management Occupations"
});

2. Insufficient information to assign a major group:
assign_major_soc_code({
  socCode: "Unassigned",
  socTitle: "Unable to assign SOC code"
});

3. Job could fit multiple major categories:
assign_major_soc_code({
  socCode: "Unassigned",
  socTitle: "Unable to assign SOC code"
});
`,
    },
  ];

  console.log("Calling LLM with messages:", JSON.stringify(messages, null, 2));

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
            name: "assign_major_soc_code",
            description:
              "Assign an SOC major group code and title to a job, or return 'Unassigned'.",
            parameters: {
              type: "object",
              properties: {
                socCode: {
                  type: "string",
                  description:
                    "The SOC major group code in XX-0000 format (Required ending in -0000), or 'Unassigned'.",
                },
                socTitle: {
                  type: "string",
                  description:
                    "The title of the SOC major group, or 'Unable to assign SOC code'.",
                },
              },
              required: ["socCode", "socTitle"],
            },
          },
        },
      ],
    });

    console.log("Raw LLM response:", JSON.stringify(response.message, null, 2));

    if (
      !response.message.tool_calls ||
      response.message.tool_calls.length === 0
    ) {
      console.log("The model didn't use the function. Its response was:");
      console.log(response.message.content);
      return { SOCCode: "Unassigned", SOCTitle: "Model Error" };
    }

    const functionResponse = assignMajorSOCCode(
      response.message.tool_calls[0].function.arguments,
      validSOCCodes,
      socGroups,
    );
    const parsedResponse = JSON.parse(functionResponse);

    if (parsedResponse.error) {
      console.error(`Error: ${parsedResponse.error}`);
      return { SOCCode: "Unassigned", SOCTitle: parsedResponse.error };
    }

    return {
      SOCCode: parsedResponse.SOCCode,
      SOCTitle: parsedResponse.SOCTitle,
    };
  } catch (error) {
    console.error("Error calling LLM:", error);
    return { SOCCode: "Unassigned", SOCTitle: "Error" };
  }
}
