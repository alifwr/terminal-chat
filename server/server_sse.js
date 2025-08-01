import http from "http";
import pty from "node-pty";
import os from "os";
import express from "express";
import { EventEmitter } from "events";
import { Server } from "socket.io";

const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

// Create Express app for MCP server
const app = express();
app.use(express.json());

// CORS middleware for AI SDK
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// MCP Protocol constants
const MCP_VERSION = "2024-11-05";

class ProperMCPServer {
  constructor() {
    this.sseClients = new Map();
    this.initialized = new Set();
  }

  addSSEClient(clientId, response) {
    this.sseClients.set(clientId, response);
    console.log(`📡 SSE client connected: ${clientId}`);
    
    // Send initialization notification
    this.sendToClient(clientId, {
      jsonrpc: "2.0",
      method: "notifications/initialized",
      params: {}
    });
  }

  removeSSEClient(clientId) {
    const client = this.sseClients.get(clientId);
    if (client) {
      try {
        client.end();
      } catch (e) {
        // Client already disconnected
      }
    }
    this.sseClients.delete(clientId);
    this.initialized.delete(clientId);
    console.log(`📡 SSE client disconnected: ${clientId}`);
  }

  sendToClient(clientId, message) {
    const client = this.sseClients.get(clientId);
    if (client) {
      try {
        const data = `data: ${JSON.stringify(message)}\n\n`;
        client.write(data);
        console.log(`📤 Sent to ${clientId}:`, message.method || `response-${message.id}`);
      } catch (error) {
        console.error(`Error sending to client ${clientId}:`, error.message);
        this.removeSSEClient(clientId);
      }
    }
  }

  async handleRPCMessage(clientId, message) {
    const { jsonrpc, id, method, params } = message;
    
    console.log(`📨 RPC from ${clientId}: ${method} (id: ${id})`);

    if (!jsonrpc || jsonrpc !== "2.0") {
      return this.createErrorResponse(id, -32600, "Invalid Request");
    }

    try {
      let result;
      
      switch (method) {
        case "initialize":
          result = await this.handleInitialize(clientId, params);
          this.initialized.add(clientId);
          break;
          
        case "tools/list":
          if (!this.initialized.has(clientId)) {
            throw new Error("Not initialized");
          }
          result = await this.handleToolsList();
          break;
          
        case "tools/call":
          if (!this.initialized.has(clientId)) {
            throw new Error("Not initialized");
          }
          result = await this.handleToolCall(params);
          break;
          
        default:
          throw new Error(`Method not found: ${method}`);
      }

      const response = {
        jsonrpc: "2.0",
        id,
        result
      };

      this.sendToClient(clientId, response);
      
    } catch (error) {
      console.error(`❌ Error handling ${method}:`, error.message);
      const errorResponse = this.createErrorResponse(
        id, 
        error.message.includes("Method not found") ? -32601 : -32603, 
        error.message
      );
      this.sendToClient(clientId, errorResponse);
    }
  }

  createErrorResponse(id, code, message) {
    return {
      jsonrpc: "2.0",
      id,
      error: { code, message }
    };
  }

  async handleInitialize(clientId, params) {
    console.log(`🚀 Initializing client ${clientId}`);
    
    return {
      protocolVersion: MCP_VERSION,
      capabilities: {
        tools: {}
      },
      serverInfo: {
        name: "terminal-mcp-server",
        version: "1.0.0"
      }
    };
  }

  async handleToolsList() {
    console.log(`📋 Providing tools list`);
    
    return {
      tools: [
        {
          name: "run_command",
          description: "Execute a shell command in the terminal session",
          inputSchema: {
            type: "object",
            properties: {
              command: {
                type: "string",
                description: "The shell command to execute"
              },
              timeout: {
                type: "number",
                description: "Timeout in milliseconds (default: 10000)",
                default: 10000
              }
            },
            required: ["command"]
          }
        }
      ]
    };
  }

  async handleToolCall(params) {
    const { name, arguments: args } = params;
    console.log(`🔧 Tool call: ${name}`, args);

    if (name !== "run_command") {
      throw new Error(`Unknown tool: ${name}`);
    }

    const { command, timeout = 10000 } = args;
    
    if (!command || typeof command !== 'string') {
      throw new Error("Invalid command parameter");
    }

    try {
      const output = await this.executeCommand(command, timeout);
      
      return {
        content: [
          {
            type: "text",
            text: output
          }
        ]
      };
      
    } catch (error) {
      throw new Error(`Command execution failed: ${error.message}`);
    }
  }

  async executeCommand(command, timeout) {
    console.log(`💻 Executing: "${command}" (timeout: ${timeout}ms)`);
    
    return new Promise((resolve, reject) => {
      if (activePtyProcesses.size === 0) {
        const msg = "No active terminal sessions. Please connect a terminal client first.";
        console.log(`⚠️  ${msg}`);
        resolve(msg);
        return;
      }

      const ptyProcess = Array.from(activePtyProcesses)[0];
      let output = "";
      let timeoutHandle;
      let resolved = false;

      const cleanup = () => {
        if (timeoutHandle) clearTimeout(timeoutHandle);
        ptyProcess.removeListener("data", onData);
      };

      const onData = (data) => {
        output += data.toString();
      };

      const finish = (result) => {
        if (!resolved) {
          resolved = true;
          cleanup();
          console.log(`✅ Command result: "${result.substring(0, 100)}${result.length > 100 ? '...' : ''}"`);
          resolve(result);
        }
      };

      // Set up timeout
      timeoutHandle = setTimeout(() => {
        finish(output || "Command timed out");
      }, timeout);

      // Listen for output
      ptyProcess.on("data", onData);

      // Send command
      ptyProcess.write(command + "\r");

      // Most commands complete quickly, so resolve after a short delay
      setTimeout(() => {
        finish(output || "Command executed (no output)");
      }, Math.min(timeout, 2000));
    });
  }
}

const mcpServer = new ProperMCPServer();

// Test endpoint to verify Express is working
app.get("/test", (req, res) => {
  res.json({ message: "Express server is working!", timestamp: new Date().toISOString() });
});

// SSE endpoint following MCP specification
app.get("/sse", (req, res) => {
  const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`🔌 SSE connection from: ${req.ip} -> ${clientId}`);
  
  // Set proper SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  });

  // Add client to MCP server
  mcpServer.addSSEClient(clientId, res);

  // Handle disconnect
  req.on("close", () => {
    mcpServer.removeSSEClient(clientId);
  });

  req.on("error", (error) => {
    console.error("SSE error:", error);
    mcpServer.removeSSEClient(clientId);
  });

  // Send periodic keep-alive
  const keepAlive = setInterval(() => {
    try {
      res.write(`: keep-alive ${Date.now()}\n\n`);
    } catch (error) {
      clearInterval(keepAlive);
      mcpServer.removeSSEClient(clientId);
    }
  }, 30000);

  req.on("close", () => {
    clearInterval(keepAlive);
  });
});

// Message endpoint for MCP RPC calls
app.post("/message", (req, res) => {
  try {
    const clientId = req.headers['x-client-id'];
    
    if (!clientId) {
      console.log('❌ Missing X-Client-Id header');
      return res.status(400).json({ error: "Missing X-Client-Id header" });
    }

    const message = req.body;
    console.log(`📬 Message from ${clientId}:`, JSON.stringify(message, null, 2));
    
    // Handle the RPC message
    mcpServer.handleRPCMessage(clientId, message);
    
    res.json({ status: "received" });
    
  } catch (error) {
    console.error("Error handling message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    activeTerminals: activePtyProcesses.size,
    sseClients: mcpServer.sseClients.size,
    initializedClients: mcpServer.initialized.size,
    endpoints: {
      sse: "/sse",
      message: "/message"
    }
  });
});

// Create HTTP server with Express app
const server = http.createServer(app);

// Socket.IO setup for terminal functionality - attach to the same server
const io = new Server(server, {
  cors: { origin: "*" },
  path: "/socket.io/"
});

const createTerminalInstance = () => {
  const ptyProcess = pty.spawn('ssh', ["kaliuser@172.18.0.2"], {
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
  console.log(`🖥️  Terminal client connected: ${socket.id}`);
  
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
    console.log(`🖥️  Terminal client disconnected: ${socket.id}`);
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
    // Close MCP connections
    console.log(`Closing ${mcpServer.sseClients.size} MCP SSE connections...`);
    for (const [clientId] of mcpServer.sseClients) {
      mcpServer.removeSSEClient(clientId);
    }

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
  console.log(`🚀 Terminal MCP Server started on http://localhost:${PORT}`);
  console.log(`📡 Socket.IO terminal: http://localhost:${PORT}`);
  console.log(`🔌 MCP SSE endpoint: http://localhost:${PORT}/sse`);
  console.log(`📤 MCP message endpoint: http://localhost:${PORT}/message`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
  console.log("");
  console.log("📋 Instructions:");
  console.log("1. Connect a terminal client first (Socket.IO)");
  console.log("2. Then use MCP tools via AI SDK");
  console.log("3. Press Ctrl+C to stop the server");
  console.log("");
  console.log("🔗 MCP Client Configuration:");
  console.log(`   url: 'http://localhost:${PORT}/sse'`);
  console.log(`   messageUrl: 'http://localhost:${PORT}/message'`);
  console.log("");
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  gracefulShutdown('serverError');
});