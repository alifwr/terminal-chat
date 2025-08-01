<!-- components/XTerminal.vue -->
<template>
  <div class="terminal-container">
    <div class="terminal-header">
      <div class="terminal-controls">
        <div class="control-dot red"></div>
        <div class="control-dot yellow"></div>
        <div class="control-dot green"></div>
      </div>
      <div class="terminal-status">
        <div :class="['status-indicator', connectionStatus]">
          <div class="status-dot"></div>
          <span>{{ getStatusText() }}</span>
        </div>
        <button 
          @click="reconnect" 
          :disabled="connectionStatus === 'connecting'"
          class="reconnect-btn"
        >
          ↻
        </button>
      </div>
    </div>
    <div ref="terminalContainer" class="terminal-content"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  serverUrl: {
    type: String,
    default: 'http://localhost:8080'
  }
})

const terminalContainer = ref(null)
const connectionStatus = ref('disconnected')

let terminal = null
let fitAddon = null
let socket = null
let cleanupResize = null

const getStatusText = () => {
  switch (connectionStatus.value) {
    case 'connected': return 'Connected'
    case 'connecting': return 'Connecting...'
    default: return 'Disconnected'
  }
}

const connectSocket = async () => {
  if (socket) {
    socket.disconnect()
  }

  connectionStatus.value = 'connecting'
  
  try {
    // Dynamic import for client-side only
    const { io } = await import('socket.io-client')
    
    socket = io(props.serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 5000
    })

    socket.on('connect', () => {
      console.log('Connected to terminal server')
      connectionStatus.value = 'connected'
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from terminal server')
      connectionStatus.value = 'disconnected'
    })

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      connectionStatus.value = 'disconnected'
    })

    // Listen for terminal data from server
    socket.on('terminal.incomingData', (data) => {
      if (terminal) {
        terminal.write(data)
      }
    })

    return socket
  } catch (error) {
    console.error('Failed to connect to terminal server:', error)
    connectionStatus.value = 'disconnected'
  }
}

const setupTerminal = async () => {
  try {
    // Dynamic imports for client-side only
    const { Terminal } = await import('xterm')
    const { FitAddon } = await import('@xterm/addon-fit')
    
    // Import CSS
    await import('xterm/css/xterm.css')
    
    // Create terminal instance
    terminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
      theme: {
        background: '#0d1117',
        foreground: '#e6edf3',
        cursor: '#e6edf3',
        selection: 'rgba(31, 111, 235, 0.3)',
        black: '#484f58',
        red: '#ff7b72',
        green: '#3fb950',
        yellow: '#d29922',
        blue: '#58a6ff',
        magenta: '#bc8cff',
        cyan: '#39c5cf',
        white: '#b1bac4',
        brightBlack: '#6e7681',
        brightRed: '#ffa198',
        brightGreen: '#56d364',
        brightYellow: '#e3b341',
        brightBlue: '#79c0ff',
        brightMagenta: '#d2a8ff',
        brightCyan: '#56d4dd',
        brightWhite: '#f0f6fc'
      },
      allowTransparency: false
    })
    
    // Create and load fit addon
    fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)
    
    // Open terminal in container
    terminal.open(terminalContainer.value)
    
    // Fit terminal to container
    fitAddon.fit()
    
    // Handle user input - send keystrokes to server
    terminal.onData(data => {
      if (socket && socket.connected) {
        socket.emit('terminal.keystroke', data)
      }
    })
    
    // Handle terminal resize
    terminal.onResize(({ cols, rows }) => {
      if (socket && socket.connected) {
        socket.emit('terminal.resize', { cols, rows })
      }
    })
    
    // Handle window resize
    const handleResize = () => {
      if (fitAddon) {
        fitAddon.fit()
      }
    }
    
    window.addEventListener('resize', handleResize)
    
    // Setup resize observer for container changes
    const resizeObserver = new ResizeObserver(() => {
      if (fitAddon) {
        setTimeout(() => fitAddon.fit(), 100)
      }
    })
    
    if (terminalContainer.value) {
      resizeObserver.observe(terminalContainer.value)
    }
    
    // Return cleanup functions
    return () => {
      window.removeEventListener('resize', handleResize)
      resizeObserver.disconnect()
    }
  } catch (error) {
    console.error('Failed to setup terminal:', error)
    return () => {}
  }
}

const reconnect = () => {
  if (connectionStatus.value !== 'connecting') {
    connectSocket()
  }
}

onMounted(async () => {
  cleanupResize = await setupTerminal()
  await connectSocket()
})

onUnmounted(() => {
  if (cleanupResize) {
    cleanupResize()
  }
  if (socket) {
    socket.disconnect()
  }
  if (terminal) {
    terminal.dispose()
  }
})
</script>

<style scoped>
.terminal-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0d1117;
  border-radius: 8px;
  overflow: hidden;
}

.terminal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background: #161b22;
  border-bottom: 1px solid #30363d;
  min-height: 40px;
}

.terminal-controls {
  display: flex;
  gap: 0.5rem;
}

.control-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.control-dot.red {
  background: #ff5f56;
}

.control-dot.yellow {
  background: #ffbd2e;
}

.control-dot.green {
  background: #27ca3f;
}

.terminal-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #e6edf3;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.terminal-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-indicator.connected {
  color: #3fb950;
}

.status-indicator.connecting {
  color: #d29922;
}

.status-indicator.disconnected {
  color: #f85149;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status-indicator.connected .status-dot {
  animation: pulse 2s infinite;
}

.status-indicator.connecting .status-dot {
  animation: blink 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.reconnect-btn {
  background: transparent;
  border: 1px solid #30363d;
  color: #7d8590;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.reconnect-btn:hover:not(:disabled) {
  background: #21262d;
  color: #e6edf3;
  border-color: #484f58;
}

.reconnect-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.terminal-content {
  padding: 0.4rem;
  flex: 1;
  overflow: hidden;
  background: #0d1117;
}

/* Override xterm.js styles to match our theme */
:deep(.xterm) {
  height: 100% !important;
  width: 100% !important;
}

:deep(.xterm .xterm-viewport) {
  background: #0d1117 !important;
}

:deep(.xterm .xterm-screen) {
  background: #0d1117 !important;
}

:deep(.xterm-cursor-layer .xterm-cursor) {
  background: #e6edf3 !important;
  color: #0d1117 !important;
}

:deep(.xterm .xterm-selection div) {
  background: rgba(31, 111, 235, 0.3) !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .terminal-header {
    padding: 0.375rem 0.5rem;
    min-height: 36px;
  }
  
  .terminal-title {
    display: none;
  }
  
  .control-dot {
    width: 10px;
    height: 10px;
  }
  
  .status-indicator {
    font-size: 0.6875rem;
  }
  
  .reconnect-btn {
    padding: 0.1875rem 0.375rem;
    font-size: 0.75rem;
  }
}
</style>