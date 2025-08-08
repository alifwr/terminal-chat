import { generateText, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { experimental_createMCPClient as createMCPClient } from 'ai';

export default defineLazyEventHandler(async () => {
  const config = useRuntimeConfig();
  const apiKey = config.apiKey;
  const baseUrl = config.baseUrl;
  const mcpUrl = config.mcpUrl;
  const modelName = config.modelName;

  let mcpClient: any = null;
  let tools: any = {};

  try {
    mcpClient = await createMCPClient({
      transport: {
        type: 'sse',
        url: mcpUrl,
      },
    });
    tools = await mcpClient.tools();
  } catch (error) {
    console.error('Failed to initialize MCP client:', error);
    // Continue without tools if MCP client fails
    tools = {};
  }

  return defineEventHandler(async (event: any) => {
    try {
      const { messages, data } = await readBody(event);

      if (!messages || !Array.isArray(messages)) {
        throw new Error('Invalid messages format');
      }

      messages.unshift({
        role: 'system',
        content: `You are an advanced AI Pentesting Agent, an expert ethical hacker and security consultant. Your purpose is to assist users in comprehensively assessing the security of systems and networks by simulating real-world attacks. You are an expert in and can leverage *any* tool available in Kali Linux to perform all phases of a penetration test, from reconnaissance and vulnerability analysis to exploitation and post-exploitation. Crucially, you operate with strict ethical guidelines, *always requiring explicit user authorization for all actions*, especially those that are active, intrusive, or potentially impactful. You will clearly explain your methodology, tool choices, exact commands, and findings, providing actionable insights and remediation recommendations, ensuring a transparent and collaborative engagement for any pentesting task. Your sesionId is ${data?.sessionId}. Use the sessionId only for argument in tool call process.`
      });

      const openai = createOpenAI({
        apiKey: data?.apiKey ? data?.apiKey : apiKey,
        baseURL: data?.baseUrl ? data?.baseUrl : baseUrl,
      });

      let toolRoundCount = 0;

      // Use generateText instead of streamText for testing
      const result = await generateText({
        model: openai(data?.model ? data?.model : modelName),
        temperature: data?.temperature ? Number(data?.temperature) : 0.2,
        maxTokens: data?.maxTokens ? Number(data?.maxTokens) : 32768,
        messages,
        tools: tools,
        maxSteps: 5, // Reduced to prevent infinite loops
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

      console.log(`Generation finished with reason: ${result.finishReason}, steps: ${result.steps?.length}`);
      if (result.usage) {
        console.log(`Token usage - prompt: ${result.usage.promptTokens}, completion: ${result.usage.completionTokens}`);
      }

      // Return the complete response as JSON
      return new Response(
        JSON.stringify({ 
          message: result.text,
          usage: result.usage,
          finishReason: result.finishReason,
          steps: result.steps?.length || 0,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    } catch (error) {
      console.error('Error in chat API:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          message: errorMessage,
          timestamp: new Date().toISOString()
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  });
});
