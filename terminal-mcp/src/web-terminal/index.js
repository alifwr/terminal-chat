// src/web-terminal/index.js
import { createServer } from "http";
import pty from "node-pty";
import { Server } from "socket.io";

export class WebTerminalServer {
    constructor(port = 8080, sshConfig = { host: '172.18.0.2', user: 'kaliuser' }) {
        this.port = port;
        this.sshConfig = sshConfig;
        this.httpServer = createServer();
        this.io = new Server(this.httpServer, {
            cors: { origin: "*" },
        });
        this.activePtyProcesses = new Map();
        this.setupSocketHandlers();
    }

    invokeTerminal(command, sessionId) {
        // Clear the stored output for each PTY process before sending a new command
        for (const ptyProcess of this.activePtyProcesses.keys()) {
            const instance = this.activePtyProcesses.get(ptyProcess);
            if (instance.pid == sessionId) {
                this.activePtyProcesses.set(ptyProcess, { ...instance, output: '' });
                ptyProcess.write(command);
            }
        }

        // Return the stored outputs after a delay to allow command execution
        return new Promise((resolve) => {
            setTimeout(() => {
                const outputs = [];
                for (const [ptyProcess, instance] of this.activePtyProcesses) {
                    if (instance.pid == sessionId) {
                        outputs.push(instance.output);
                    }
                }
                resolve({
                    stdout: outputs.join('\n'),
                    stderr: ''
                });
            }, 1000); // Wait 1 second for command execution
        });
    }

    createTerminalInstance() {
        const ptyProcess = pty.spawn('ssh', [`${this.sshConfig.user}@${this.sshConfig.host}`], {
            name: "xterm-color",
            cols: 80,
            rows: 50,
            cwd: process.env.HOME,
            env: process.env,
        });
        console.log(process.env)

        return ptyProcess;
    }

    setupSocketHandlers() {
        this.io.on("connection", (socket) => {
            console.log(`🔌 Client connected: ${socket.id}`);

            const ptyProcess = this.createTerminalInstance();
            const pid = ptyProcess.pid;

            this.activePtyProcesses.set(ptyProcess, {
                pid: pid,
                output: ''
            });

            socket.emit("terminal.pid", pid);

            // Handle terminal data from PTY
            ptyProcess.on("data", (data) => {
                // Update the stored output for this PTY process
                const currentinstance = this.activePtyProcesses.get(ptyProcess);
                this.activePtyProcesses.set(ptyProcess, {...currentinstance, output: currentinstance.output + data});
                socket.emit("terminal.incomingData", data);
            });

            // Handle PTY process exit
            ptyProcess.on("exit", (code, signal) => {
                console.log(`💀 PTY process exited (code: ${code}, signal: ${signal})`);
                this.activePtyProcesses.delete(ptyProcess);
                socket.emit("terminal.exit", { code, signal });
            });

            // Handle keystrokes from client
            socket.on("terminal.keystroke", (data) => {
                if (!ptyProcess.killed) {
                    ptyProcess.write(data);
                }
            });

            // Handle terminal resize
            socket.on("terminal.resize", (data) => {
                if (!ptyProcess.killed && data.cols && data.rows) {
                    ptyProcess.resize(data.cols, data.rows);
                }
            });

            // Handle client disconnect
            socket.on("disconnect", () => {
                console.log(`🔌 Client disconnected: ${socket.id}`);
                this.cleanupPtyProcess(ptyProcess);
            });

            // Handle errors
            socket.on("error", (error) => {
                console.error(`🚨 Socket error for ${socket.id}:`, error);
                this.cleanupPtyProcess(ptyProcess);
            });
        });
    }

    cleanupPtyProcess(ptyProcess) {
        if (ptyProcess && !ptyProcess.killed) {
            try {
                ptyProcess.kill('SIGTERM');
                this.activePtyProcesses.delete(ptyProcess);
            } catch (error) {
                console.error('Error killing PTY process:', error);
            }
        }
    }

    async start() {
        return new Promise((resolve, reject) => {
            this.httpServer.listen(this.port, (error) => {
                if (error) {
                    console.error(`❌ Failed to start Web Terminal Server:`, error);
                    reject(error);
                    return;
                }

                console.log(`✅ Web Terminal Server listening on http://localhost:${this.port}`);
                console.log(`🔗 SSH Target: ${this.sshConfig.user}@${this.sshConfig.host}`);
                resolve();
            });

            this.httpServer.on('error', (error) => {
                console.error('🚨 HTTP Server error:', error);
                reject(error);
            });
        });
    }

    async stop() {
        return new Promise((resolve) => {
            console.log('🛑 Shutting down Web Terminal Server...');

            // Close all socket connections
            this.io.close();

            // Kill all active PTY processes
            console.log(`💀 Killing ${this.activePtyProcesses.size} active PTY processes...`);
            for (const ptyProcess of this.activePtyProcesses.keys()) {
                this.cleanupPtyProcess(ptyProcess);
            }
            this.activePtyProcesses.clear();

            // Close HTTP server
            this.httpServer.close(() => {
                console.log('✅ Web Terminal Server stopped');
                resolve();
            });
        });
    }

    // Method to get server status
    getStatus() {
        return {
            port: this.port,
            sshTarget: `${this.sshConfig.user}@${this.sshConfig.host}`,
            activeSessions: this.activePtyProcesses.size,
            connectedClients: this.io.engine.clientsCount
        };
    }

    // Method to update SSH configuration
    updateSshConfig(newConfig) {
        this.sshConfig = { ...this.sshConfig, ...newConfig };
        console.log(`🔧 SSH config updated: ${this.sshConfig.user}@${this.sshConfig.host}`);
    }
}