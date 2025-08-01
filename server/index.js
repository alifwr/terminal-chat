import { createServer } from "http";
import pty from "node-pty";
import { Server } from "socket.io";

const http = createServer();

const io = new Server(http, {
  cors: { origin: "*" },
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
let server;

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
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
    console.log(`Client disconnected: ${socket.id}`);
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
server = http.listen(8080, () => {
  console.log("Terminal server listening on http://localhost:8080");
  console.log("Press Ctrl+C to stop the server");
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  gracefulShutdown('serverError');
});