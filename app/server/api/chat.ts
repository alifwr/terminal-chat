import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { experimental_createMCPClient as createMCPClient } from 'ai';



export default defineLazyEventHandler(async () => {
  //   const apiKey = useRuntimeConfig().openaiApiKey;
  const apiKey = "mari_kita_berbuat_baik";
  const baseUrl = "http://10.8.0.86:9007/v1";
  if (!apiKey) throw new Error('Missing OpenAI API key');
  const openai = createOpenAI({
    apiKey: apiKey,
    baseURL: baseUrl
  });

  const mcpClient = await createMCPClient({
    transport: {
      type: 'sse',
      url: 'http://localhost:8080/mcp/sse',
      // url: 'http://localhost:8000/sse',
    },
  });

  const tools = await mcpClient.tools();
  console.log("TOOL:", tools)


  return defineEventHandler(async (event: any) => {
    const { messages } = await readBody(event);
    console.log(messages)

    const result = streamText({
      model: openai('aliframadhan/Qwen3-8B-Tool-Calling'),
      messages,
      tools: tools
      // {
      //   weather: tool({
      //     description: 'Get the weather in a location',
      //     parameters: z.object({
      //       location: z.string().describe('The location to get the weather for'),
      //     }),
      //     execute: async ({ location }) => ({
      //       location,
      //       temperature: 72 + Math.floor(Math.random() * 21) - 10,
      //     }),
      //   }),
      // },
      // onFinish: async () => {
      //     await mcpClient.close();
      // }
    });

    return result.toDataStreamResponse();
  });
});