import { Server } from "@modelcontextprotocol/sdk/server";
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'; 
import { z } from 'zod'; // For schema validation
import {
      ListPromptsRequestSchema,
      GetPromptRequestSchema
    } from "@modelcontextprotocol/sdk/types.js";

async function makeNWSRequest<T>(url: string): Promise<T | null> {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error("Error making NWS request:", error);
    return null;
  }
}

interface InitialValue {
    contextId: number;
    actualOptid: number;
    actualCoverageCategory: number;
    actualcoverageId: number;
    actualPriceAmount: number;
}

interface UpdatedContextValue {
    contextId: number;
    dataAssignmentId: number;
    dataAssignmentModule: string;
    actualOptid: number;
    actualCoverageCategory: number;
    actualcoverageId: number;
    actualPriceAmount: number;
}

interface HealthData {
    prsnIntnId: number;
    planId: number;
    planBrndCd: string;
    trnsId: number;
    initialValue: InitialValue;
    finalAssignedValue: InitialValue;
    updatedContextValue: UpdatedContextValue[];
}


const prompts = {
  "get-user-info": {
    name: "get-user-info",
    description: "Get the user information along with the platform they are using.",
    arguments: [
        { 
            name: "user",
            description: "PRSN INTN ID of the person to search",
            required: true,
        },
        {
            name: "platform",
            description: "The platform the user is using (e.g., TBA, CBA, etc.)",
            required: true,
        }
    ],
  },
};

const server = new Server({
      name: "example-prompts-server",
      version: "1.0.0"
    }, {
      capabilities: {
        prompts: {}
      }
    });

    // List available prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: Object.values(prompts)
      };
    });

// Get specific prompt
server.setRequestHandler(GetPromptRequestSchema, async (request) => {

  const { name, arguments: args } = request.params;

  const user = args?.user;
   
      if (!name) {
        throw new Error(`Prompt not found: ${request.params.name}`);
      }
  
    
      if (request.params.name === "get-user-info") {

      
        return {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Get the data assignment data for a user:${request.params.arguments?.user} using MCP tool get-healthdata-assignment-user`
              }
            }
          ]
        };
      }


      throw new Error("Prompt implementation not found");
    });

// Configure and start your server with a transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Prompt running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});