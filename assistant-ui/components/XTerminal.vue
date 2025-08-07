<!-- components/XTerminal.vue -->
<template>
  <div class="flex flex-col min-h-[300px] bg-gray-900 rounded-lg overflow-hidden">
    <div class="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700 min-h-10">
      <div class="flex gap-2">
        <h3 class="text-white font-medium">Kali Terminal MCP</h3>
      </div>
      <div class="flex items-center gap-2">
        <div :class="[
          'flex items-center gap-1.5 text-xs font-medium',
          connectionStatus === 'connected' ? 'text-green-500' :
            connectionStatus === 'connecting' ? 'text-yellow-500' : 'text-red-500'
        ]">
          <div :class="[
            'w-1.5 h-1.5 rounded-full',
            connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
              connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
          ]"></div>
          <span>{{ getStatusText() }}</span>
        </div>
        <button @click="reconnect" :disabled="connectionStatus === 'connecting'"
          class="border border-gray-700 text-gray-500 px-2 py-1 rounded text-sm transition-all hover:bg-gray-700 hover:text-gray-200 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
          ↻
        </button>
      </div>
    </div>
    <div ref="terminalContainer" class="p-1 flex-1 overflow-hidden bg-gray-900"></div>
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

const { sessionId } = useTerminalSession();
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

    socket.on('terminal.pid', (data) => {
      sessionId.value = data;
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
    return () => { }
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
