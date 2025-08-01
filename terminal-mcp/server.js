#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const pty = require('node-pty');
const os = require('os');

class TerminalMCPServer {
  constructor() {
    this.server = new Server({
      name: 'terminal-server',
      version: '1.0.0',
    }, {
      capabilities: {
        tools: {},
      },
    });

    this.terminal = null;
    this.outputBuffer = '';
    this.setupTerminal();
    this.setupHandlers();
  }

  setupTerminal() {
    // Create a new terminal instance
    this.terminal = pty.spawn(process.platform === 'win32' ? 'powershell.exe' : 'bash', [], {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd: process.cwd(),
      env: process.env
    });

    // Handle terminal output
    this.terminal.onData((data) => {
      this.outputBuffer += data;
    });

    // Handle terminal exit
    this.terminal.onExit((exitCode, signal) => {
      console.error(`Terminal exited with code ${exitCode}, signal ${signal}`);
      this.setupTerminal(); // Restart terminal
    });
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'execute_command',
            description: 'Execute a command in the terminal and return the output',
            inputSchema: {
              type: 'object',
              properties: {
                command: {
                  type: 'string',
                  description: 'The command to execute in the terminal'
                },
                timeout: {
                  type: 'number',
                  description: 'Timeout in milliseconds (default: 10000)',
                  default: 10000
                }
              },
              required: ['command']
            }
          }
        ]
      };
    });

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === 'execute_command') {
        return await this.executeCommand(args.command, args.timeout || 10000);
      } else {
        throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async executeCommand(command, timeout = 10000) {
    try {
      // Clear the output buffer
      this.outputBuffer = '';

      // Send command to terminal
      this.terminal.write(command + '\r');

      // Wait for output with timeout
      const output = await this.waitForOutput(timeout);

      return {
        content: [
          {
            type: 'text',
            text: `Command: ${command}\n\nOutput:\n${output}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error executing command "${command}": ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  waitForOutput(timeout) {
    return new Promise((resolve, reject) => {
      let timeoutId;
      let lastOutputLength = 0;
      let stableCount = 0;

      const checkOutput = () => {
        if (this.outputBuffer.length > lastOutputLength) {
          lastOutputLength = this.outputBuffer.length;
          stableCount = 0;
        } else {
          stableCount++;
          
          // If output has been stable for a few checks, consider it complete
          if (stableCount >= 5) {
            clearTimeout(timeoutId);
            clearInterval(intervalId);
            
            // Clean up the output (remove command echo and prompt)
            let cleanOutput = this.outputBuffer;
            
            // Remove common prompt patterns and command echo
            cleanOutput = cleanOutput
              .split('\n')
              .filter(line => !line.match(/^[\w@\-\.~]*[$#>]\s*/)) // Remove prompt lines
              .join('\n')
              .trim();

            resolve(cleanOutput || 'Command executed successfully (no output)');
          }
        }
      };

      // Check output stability every 200ms
      const intervalId = setInterval(checkOutput, 200);

      // Set overall timeout
      timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        
        if (this.outputBuffer.trim()) {
          resolve(this.outputBuffer.trim());
        } else {
          reject(new Error(`Command timed out after ${timeout}ms`));
        }
      }, timeout);
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Terminal MCP Server started');
  }

  cleanup() {
    if (this.terminal) {
      this.terminal.kill();
    }
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.error('Received SIGINT, shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('Received SIGTERM, shutting down...');
  process.exit(0);
});

// Start the server
const server = new TerminalMCPServer();
server.start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Cleanup on exit
process.on('exit', () => {
  server.cleanup();
});