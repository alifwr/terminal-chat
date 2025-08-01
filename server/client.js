// Simple example showing core MCP client usage with AI SDK and SSE transport (ES modules)
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, experimental_createMCPClient as createMCPClient } from 'ai';

// Create MCP client for your terminal server with SSE transport

// Simple function to ask AI to run terminal commands
async function askAI(question) {
    const apiKey = "mari_kita_berbuat_baik";
    const baseUrl = "http://10.8.0.86:9007/v1";
    if (!apiKey) throw new Error('Missing OpenAI API key');
    const openai = createOpenAI({
        apiKey: apiKey,
        baseURL: baseUrl
    });
    console.log("CONNECTING TO MCP")

    const mcpClient = await createMCPClient({
        name: 'terminal-server',
        version: '1.0.0',
        transport: {
            type: 'sse',
            url: 'http://localhost:8080/mcp/sse',
            // messageUrl: 'http://localhost:8080/mcp/message',
        },
    });

    const tools = await mcpClient.tools();
    console.log('🔧 Available tools:', Object.keys(tools).length > 0 ? Object.keys(tools).join(', ') : 'None found');
    
    if (Object.keys(tools).length === 0) {
      console.log('❌ No tools available! Check server connection and terminal sessions.');
      return;
    }

    const result = await generateText({
        model: openai('aliframadhan/Qwen3-8B-Tool-Calling'),
        messages: [
            {
                role: 'system',
                content: 'You have access to a terminal via SSH. Execute commands as needed to answer questions.',
            },
            {
                role: 'user',
                content: question,
            },
        ],
        tools: tools,
        maxToolRoundtrips: 3,
    });

    return result.text;
}

// Example usage
async function example() {
  try {
    console.log('🤖 Testing MCP with SSE transport...\n');
    
    const response = await askAI("What system am I on and what's in the current directory?");
    
    console.log('📝 AI Response:');
    console.log(response);
    
  } catch (error) {
    console.error('Error:', error.message);
    
    if (error.message.includes('Failed to connect') || error.message.includes('fetch')) {
      console.log('\n💡 Make sure your terminal server is running with SSE support:');
      console.log('   node index.js');
      console.log('\n💡 And that you have a terminal client connected');
    }
  }
}

// Run the example
example();