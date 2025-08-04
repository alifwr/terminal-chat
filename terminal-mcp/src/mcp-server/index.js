// src/mcp-server/index.js
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { execa } from 'execa';
import commandExists from 'command-exists';

// Dangerous commands that should never be allowed
const BLACKLISTED_COMMANDS = new Set([
    // File System Destruction Commands
    'rm', 'rmdir', 'del',
    // Disk/Filesystem Commands
    'format', 'mkfs', 'dd',
    // Permission/Ownership Commands
    'chmod', 'chown',
    // Privilege Escalation Commands
    'sudo', 'su',
    // Code Execution Commands
    'exec', 'eval',
    // System Communication Commands
    'write', 'wall',
    // System Control Commands
    'shutdown', 'reboot', 'init',
]);

function validateCommand(baseCommand) {
    return !BLACKLISTED_COMMANDS.has(baseCommand);
}

export class MCPServer {
    constructor(terminal = null) {
        this.server = new Server({
            name: 'unified-shell-server',
            version: '1.0.0',
        }, { capabilities: { resources: {}, tools: {} } });

        this.transport = null;
        this.terminal = terminal
        this.setupErrorHandling();
        this.setupHandlers();
    }

    setupErrorHandling() {
        this.server.onerror = (error) => {
            console.error('[MCP Error]', error);
        };
    }

    setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'run_command',
                    description: 'Run a shell command securely',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            command: {
                                type: 'string',
                                description: 'The shell command to execute'
                            },
                            sessionId: {
                                type: 'string',
                                description: 'The user session id to the current terminal'
                            }
                        },
                        required: ['command', 'sessionId']
                    },
                },
            ],
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            if (request.params.name !== 'run_command') {
                throw new Error(`Unknown tool: ${request.params.name}`);
            }

            const command = request.params.arguments?.command;
            const sessionId = request.params.arguments?.sessionId;

            if (!command) {
                throw new Error('Command is required');
            }

            if ((this.terminal != null) && !sessionId) {
                throw new Error('Command is required');
            }


            try {
                const baseCommand = command.trim().split(/\s+/)[0];

                // if (!(await commandExists(baseCommand))) {
                //     throw new Error(`Command not found: ${baseCommand}`);
                // }

                if (!validateCommand(baseCommand)) {
                    throw new Error(`Command not allowed for security reasons: ${baseCommand}`);
                }

                let stdout, stderr;

                if (this.terminal != null) {
                    const result = await this.terminal(`${command}\n`, sessionId);
                    stdout = result.stdout
                    stderr = result.stderr;
                } else {
                    const result = await execa(command, [], {
                        shell: true,
                        env: process.env,
                        timeout: 30000, // 30 second timeout
                    });
                    stdout = result.stdout;
                    stderr = result.stderr;
                }

                return {
                    content: [{
                        type: 'text',
                        text: stdout || stderr || 'Command executed successfully (no output)',
                        mimeType: 'text/plain'
                    }],
                };
            } catch (error) {
                return {
                    content: [{
                        type: 'text',
                        text: `Error executing command: ${error}`,
                        mimeType: 'text/plain',
                    }],
                };
            }
        });
    }

    async start() {
        try {
            this.transport = new StdioServerTransport();
            await this.server.connect(this.transport);
            console.error('✅ MCP Server running on stdio');
        } catch (error) {
            console.error('❌ Failed to start MCP Server:', error);
            throw error;
        }
    }

    async stop() {
        try {
            if (this.server) {
                await this.server.close();
                console.error('🔧 MCP Server stopped');
            }
        } catch (error) {
            console.error('❌ Error stopping MCP Server:', error);
        }
    }
}