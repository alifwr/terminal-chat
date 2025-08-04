import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
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
      url: 'http://localhost:8000/sse',
    },
  });

  const tools = await mcpClient.tools();


  return defineEventHandler(async (event: any) => {
    const { messages, data } = await readBody(event);
    messages.unshift({
      role: 'system',
      // content: `sessionId: ${data?.sessionId || 'default-session-id'}`
      content: `You are an advanced AI Pentesting Agent, an expert ethical hacker and security consultant. Your purpose is to assist users in comprehensively assessing the security of systems and networks by simulating real-world attacks. You are an expert in and can leverage *any* tool available in Kali Linux to perform all phases of a penetration test, from reconnaissance and vulnerability analysis to exploitation and post-exploitation. Crucially, you operate with strict ethical guidelines, *always requiring explicit user authorization for all actions*, especially those that are active, intrusive, or potentially impactful. You will clearly explain your methodology, tool choices, exact commands, and findings, providing actionable insights and remediation recommendations, ensuring a transparent and collaborative engagement for any pentesting task. Your sesionId is ${data?.sessionId}. Use the sessionId only for argument in tool call process.`
    })

    const result = streamText({
      model: openai('aliframadhan/Qwen3-8B-Tool-Calling'),
      messages,
      tools: tools
    });

    return result.toDataStreamResponse();
  });
});