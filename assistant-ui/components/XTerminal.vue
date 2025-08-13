<!-- components/XTerminal.vue -->
<template>
  <div class="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center space-x-3">
        <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Terminal</h3>
        <span class="text-sm text-gray-500 dark:text-gray-400">Kali Linux</span>
      </div>
      <div class="flex items-center space-x-3">
        <div :class="[
          'flex items-center space-x-2 text-xs font-medium px-2 py-1 rounded-full',
          connectionStatus === 'connected' ? 'text-green-700 bg-green-100 dark:text-green-200 dark:bg-green-900' :
            connectionStatus === 'connecting' ? 'text-yellow-700 bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-900' : 
            'text-red-700 bg-red-100 dark:text-red-200 dark:bg-red-900'
        ]">
          <div :class="[
            'w-1.5 h-1.5 rounded-full',
            connectionStatus === 'connected' ? 'bg-green-500' :
              connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
          ]"></div>
          <span>{{ getStatusText() }}</span>
        </div>
        <button 
          @click="reconnect" 
          :disabled="connectionStatus === 'connecting'"
          class="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Terminal Container -->
    <div class="flex-1 bg-gray-900 dark:bg-black">
      <div ref="terminalContainer" class="h-full w-full p-2"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  terminalUrl: {
    type: String,
    default: 'http://localhost:3000/terminal',
    required: true
  },
  terminalSessionId: {
    type: Number,
    default: 0,
    required: true
  },
});

const emit = defineEmits(['update:terminalSessionId']);

const terminalContainer = ref(null);
const connectionStatus = ref('disconnected');

let terminal = null
let fitAddon = null
let socket = null
let cleanupResize = null

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

    socket = io(props.terminalUrl, {
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
      emit('update:terminalSessionId', data);
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
    // fitAddon = new FitAddon()
    // terminal.loadAddon(fitAddon)

    // Open terminal in container
    terminal.open(terminalContainer.value)

    // Fit terminal to container
    // fitAddon.fit()

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
    // const handleResize = () => {
    //   if (fitAddon) {
    //     fitAddon.fit()
    //   }
    // }

    // window.addEventListener('resize', handleResize)

    // Setup resize observer for container changes
    // const resizeObserver = new ResizeObserver(() => {
    //   if (fitAddon) {
    //     setTimeout(() => fitAddon.fit(), 100)
    //   }
    // })

    // if (terminalContainer.value) {
    //   resizeObserver.observe(terminalContainer.value)
    // }

    // Return cleanup functions
    // return () => {
    //   window.removeEventListener('resize', handleResize)
    //   resizeObserver.disconnect()
    // }
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
</script>
