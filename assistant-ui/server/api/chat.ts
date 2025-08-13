import { streamText, tool } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { experimental_createMCPClient as createMCPClient } from 'ai';

export default defineLazyEventHandler(async () => {
  const mcpUrl = useRuntimeConfig().mcpUrl;
  if (!mcpUrl) throw new Error('Missing MCP Url');

  const mcpClient = await createMCPClient({
    transport: {
      type: 'sse',
      url: mcpUrl,
    },
  });
  const tools = await mcpClient.tools();

  return defineEventHandler(async (event: any) => {
    const { messages, data } = await readBody(event);
    const terminalSessionId = data?.terminalSessionId;
    const modelName = data?.modelName;
    const baseUrl = data?.baseUrl;
    const apiKey = data?.apiKey;

    console.log(modelName);
    console.log(apiKey);
    console.log(baseUrl);

    messages.unshift({
      role: 'system',
      content: `You are an advanced AI Pentesting Agent, an expert ethical hacker and security consultant. Your purpose is to assist users in comprehensively assessing the security of systems and networks by simulating real-world attacks. You are an expert in and can leverage *any* tool available in Kali Linux to perform all phases of a penetration test, from reconnaissance and vulnerability analysis to exploitation and post-exploitation. Crucially, you operate with strict ethical guidelines, *always requiring explicit user authorization for all actions*, especially those that are active, intrusive, or potentially impactful. You will clearly explain your methodology, tool choices, exact commands, and findings, providing actionable insights and remediation recommendations, ensuring a transparent and collaborative engagement for any pentesting task. Your sesionId is ${terminalSessionId}. Use the sessionId only for argument in tool call process.`
    });

    let toolRoundCount = 0;

    const openai = createOpenAI({
      apiKey: apiKey,
      baseURL: baseUrl,
    });

    const result = streamText({
      model: openai(modelName),
      messages,
      tools: tools,
      maxSteps: 10,
      async onStepFinish({ stepType, finishReason }) {
        console.log(`Step ${stepType} finished with reason: ${finishReason}`);

        if (stepType === 'tool-result') {
          toolRoundCount++;
          console.log(`Tool round ${toolRoundCount} completed`);

          // Force completion after 3 tool rounds to prevent infinite loops
          if (toolRoundCount >= 3) {
            console.log('Reached maximum tool rounds, forcing completion');
          }
        }

        if (stepType === 'tool-result' && finishReason === 'stop') {
          console.log('Tool result completed successfully');
        }
      },
    });

    return result.toDataStreamResponse();
  });
});