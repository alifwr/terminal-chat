import http from "http";
import pty from "node-pty";
import os from "os";
import express from "express";
import { Server } from "socket.io";

var shell = os.platform() === "win32" ? "powershell.exe" : "bash";

// Create Express app for MCP server
const app = express();
app.use(express.json());

// CORS middleware for AI SDK
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// MCP Protocol constants
const MCP_VERSION = "2024-11-05";

class MCPServer {
  constructor() {
    this.initialized = false;
  }

  async handleRequest(method, params, id) {
    try {
      switch (method) {
        case "initialize":
          return await this.handleInitialize(params, id);
        case "tools/list":
          return await this.handleToolsList(id);
        case "tools/call":
          return await this.handleToolCall(params, id);
        default:
          throw new Error(`Unknown method: ${method}`);
      }
    } catch (error) {
      return {
        jsonrpc: "2.0",
        id,
        error: {
          code: -1,
          message: error.message
        }
      };
    }
  }

  async handleInitialize(params, id) {
    this.initialized = true;
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: MCP_VERSION,
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: "terminal-server",
          version: "1.0.0"
        }
      }
    };
  }

  async handleToolsList(id) {
    if (!this.initialized) {
      throw new Error("Server not initialized");
    }

    return {
      jsonrpc: "2.0",
      id,
      result: {
        tools: [
          {
            name: "run_command",
            description: "Execute a command in the active terminal session",
            inputSchema: {
              type: "object",
              properties: {
                command: {
                  type: "string",
                  description: "The command to execute"
                },
                timeout: {
                  type: "number",
                  description: "Timeout in milliseconds (default: 5000)",
                  default: 5000
                }
              },
              required: ["command"]
            }
          }
        ]
      }
    };
  }

  async handleToolCall(params, id) {
    if (!this.initialized) {
      throw new Error("Server not initialized");
    }

    const { name, arguments: args } = params;

    if (name === "run_command") {
      try {
        const result = await this.executeCommand(args.command, args.timeout || 5000);
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: result
              }
            ]
          }
        };
      } catch (error) {
        return {
          jsonrpc: "2.0",
          id,
          error: {
            code: -1,
            message: `Command execution failed: ${error.message}`
          }
        };
      }
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }
  }

  async executeCommand(command, timeout) {
    return new Promise((resolve, reject) => {
      if (activePtyProcesses.size === 0) {
        resolve("No active terminal sessions available. Please connect a terminal client first.");
        return;
      }

      // Get the first active terminal session
      const ptyProcess = Array.from(activePtyProcesses)[0];
      let output = "";
      let timeoutId;
      let resolved = false;

      const dataHandler = (data) => {
        output += data.toString();
      };

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        ptyProcess.removeListener("data", dataHandler);
      };

      // Set up timeout
      timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve(output || "Command timed out with no output");
        }
      }, timeout);

      // Listen for output
      ptyProcess.on("data", dataHandler);

      // Send the command
      ptyProcess.write(command + "\r");

      // For most commands, we'll get immediate output
      // Wait a bit then resolve with whatever we got
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve(output || "Command executed (no output captured)");
        }
      }, Math.min(timeout, 2000));
    });
  }
}

const mcpServer = new MCPServer();

// MCP HTTP endpoint - single endpoint for all MCP communication
app.post("/mcp", async (req, res) => {
  try {
    const { method, params, id } = req.body;
    
    if (!method) {
      return res.status(400).json({
        jsonrpc: "2.0",
        id: id || null,
        error: {
          code: -32600,
          message: "Invalid Request"
        }
      });
    }

    const result = await mcpServer.handleRequest(method, params, id);
    res.json(result);
  } catch (error) {
    console.error("MCP request error:", error);
    res.status(500).json({
      jsonrpc: "2.0",
      id: req.body.id || null,
      error: {
        code: -32603,
        message: "Internal error"
      }
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    activeTerminals: activePtyProcesses.size,
    mcpInitialized: mcpServer.initialized
  });
});

// Create HTTP server that handles both Socket.IO and Express
const server = http.createServer(app);

// Socket.IO setup for terminal functionality
const io = new Server(server, {
  cors: { origin: "*" },
  path: "/socket.io/"
});

const createTerminalInstance = () => {
  var ptyProcess = pty.spawn('ssh', ["kaliuser@172.18.0.2"], {
    name: "xterm-color",
    cols: 80,
    rows: 50,
    cwd: process.env.HOME,
    env: process.env,
  });

  return ptyProcess;
}

// Track active pty processes for cleanup
const activePtyProcesses = new Set();

io.on("connection", (socket) => {
  console.log(`Terminal client connected: ${socket.id}`);
  
  const ptyProcess = createTerminalInstance();

  // Track this process
  activePtyProcesses.add(ptyProcess);

  ptyProcess.on("data", function (data) {
    io.emit("terminal.incomingData", data);
  });

  ptyProcess.on("exit", () => {
    console.log("PTY process exited");
    activePtyProcesses.delete(ptyProcess);
  });

  socket.on("terminal.keystroke", (data) => {
    ptyProcess.write(data);
  });

  socket.on("disconnect", () => {
    console.log(`Terminal client disconnected: ${socket.id}`);
    // Clean up the pty process when client disconnects
    if (ptyProcess && !ptyProcess.killed) {
      ptyProcess.kill();
      activePtyProcesses.delete(ptyProcess);
    }
  });
});

// Graceful shutdown function
async function gracefulShutdown(signal) {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
  
  try {
    // Close the HTTP server
    if (server) {
      console.log("Closing HTTP server...");
      server.close();
    }

    // Close all socket connections
    console.log("Closing Socket.IO connections...");
    io.close();

    // Kill all active pty processes
    console.log(`Killing ${activePtyProcesses.size} active PTY processes...`);
    for (const ptyProcess of activePtyProcesses) {
      if (!ptyProcess.killed) {
        ptyProcess.kill('SIGTERM');
      }
    }
    activePtyProcesses.clear();

    console.log("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
}

// Handle termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Terminal server listening on http://localhost:${PORT}`);
  console.log(`MCP endpoint available at http://localhost:${PORT}/mcp`);
  console.log(`Health check at http://localhost:${PORT}/health`);
  console.log("Connect a terminal client first, then use MCP tools");
  console.log("Press Ctrl+C to stop the server");
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  gracefulShutdown('serverError');
});