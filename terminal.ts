// server/terminal-server.js
import { createServer } from 'http'
import { DefaultEventsMap, Server, Socket } from 'socket.io'
import pty, { IPty } from 'node-pty'
import os from 'os'

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

const shell = os.platform() === "win32" ? "powershell.exe" : "bash"
const terminals = new Map()

class TerminalSession {
  socket: any
  pty: null
  isAlive: boolean
  isDestroyed: boolean
  dataBuffer: never[]
  constructor(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
    this.socket = socket
    this.pty = null as IPty | null
    this.isAlive = true
    this.isDestroyed = false
    this.dataBuffer = []
    this.setupPty()
    this.setupEventHandlers()
  }

  setupPty() {
    try {
      this.pty = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 50,
        cwd: process.env.HOME || process.cwd(),
        env: process.env,
      })

      // Execute initial command with a slight delay
      setTimeout(() => {
        if (this.pty && this.isAlive) {
          this.safeWrite('cd kali-mcp\n')
        }
      }, 100)

      // Handle PTY data with safety checks
      this.pty.onData((data: string) => {
        if (this.isAlive && !this.isDestroyed && this.socket.connected) {
          try {
            this.socket.emit('terminal.incomingData', data)
          } catch (error) {
            console.error('Error emitting data:', error)
          }
        }
      })

      // Handle PTY exit with proper cleanup
      this.pty.onExit(({ exitCode, signal }: { exitCode: number | null, signal: number | null }) => {
        console.log(`PTY exited with code ${exitCode}, signal ${signal}`)
        this.safeCleanup()
        
        // Emit exit event if socket is still connected
        if (this.socket.connected) {
          try {
            this.socket.emit('terminal.exit', { exitCode, signal })
          } catch (error) {
            console.error('Error emitting exit:', error)
          }
        }
      })

    } catch (error) {
      console.error('Failed to create PTY:', error)
      if (this.socket.connected) {
        this.socket.emit('terminal.error', { message: 'Failed to create terminal session' })
      }
    }
  }

  setupEventHandlers() {
    this.socket.on('terminal.keystroke', (data: string) => {
      this.safeWrite(data)
    })

    this.socket.on('terminal.resize', ({ cols, rows }: { cols: number, rows: number }) => {
      this.safeResize(cols || 80, rows || 24)
    })

    this.socket.on('terminal.clear', () => {
      this.safeWrite('\x1b[2J\x1b[H')
    })

    this.socket.on('disconnect', () => {
      console.log('Client disconnected:', this.socket.id)
      this.safeCleanup()
    })

    this.socket.on('error', (error: Error) => {
      console.error('Socket error:', error)
      this.safeCleanup()
    })
  }

  safeWrite(data: string) {
    if (this.pty && this.isAlive && !this.isDestroyed) {
      try {
        this.pty.write(data)
      } catch (error) {
        console.error('Failed to write to PTY:', error)
        this.safeCleanup()
      }
    }
  }

  safeResize(cols: number, rows: number) {
    if (this.pty && this.isAlive && !this.isDestroyed) {
      try {
        this.pty.resize(cols, rows)
      } catch (error) {
        console.error('Failed to resize PTY:', error)
      }
    }
  }

  safeCleanup() {
    if (this.isDestroyed) {
      return // Already cleaned up
    }

    this.isDestroyed = true
    this.isAlive = false

    // Remove from terminals map immediately
    terminals.delete(this.socket.id)

    // Clean up PTY with proper error handling
    if (this.pty) {
      try {
        // Remove all listeners first
        (this.pty as IPty).removeAllListeners()
        
        // Kill the process gracefully
        process.nextTick(() => {
          try {
            if (this.pty && !(this.pty as IPty).kill) {
              (this.pty as IPty).kill('SIGTERM')
              
              // Force kill after timeout
              setTimeout(() => {
                try {
                  if (this.pty && !(this.pty as IPty).kill) {
                    (this.pty as IPty).kill('SIGKILL')
                  }
                } catch (error) {
                  // Ignore errors during force kill
                }
              }, 1000)
            }
          } catch (error) {
            console.error('Error during PTY cleanup:', error)
          }
          
          this.pty = null
        })
        
      } catch (error) {
        console.error('Error cleaning up PTY:', error)
      }
    }
  }
}

io.on('connection', (socket) => {
  console.log('Terminal client connected:', socket.id)
  
  try {
    const session = new TerminalSession(socket)
    terminals.set(socket.id, session)
  } catch (error) {
    console.error('Failed to create terminal session:', error)
    socket.emit('terminal.error', { message: 'Failed to initialize terminal' })
  }
})

const PORT = process.env.TERMINAL_PORT || 8080

httpServer.listen(PORT, (error: Error | null) => {
  if (error) {
    console.error('Failed to start terminal server:', error)
    process.exit(1)
  }
  console.log(`Terminal server listening on http://localhost:${PORT}`)
})

// Enhanced graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`Received ${signal}, shutting down terminal server...`)
  
  const sessions = Array.from(terminals.values())
  console.log(`Cleaning up ${sessions.length} terminal sessions...`)
  
  // Close all sessions with proper cleanup
  const cleanupPromises = sessions.map(session => {
    return new Promise((resolve) => {
      session.safeCleanup()
      setTimeout(resolve, 100) // Give time for cleanup
    })
  })
  
  Promise.all(cleanupPromises).then(() => {
    httpServer.close((error) => {
      if (error) {
        console.error('Error during server shutdown:', error)
        process.exit(1)
      }
      console.log('Terminal server shut down successfully')
      process.exit(0)
    })
  })
  
  // Force exit after timeout
  setTimeout(() => {
    console.error('Forced shutdown after timeout')
    process.exit(1)
  }, 5000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  gracefulShutdown('uncaughtException')
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})