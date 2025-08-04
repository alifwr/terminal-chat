<!-- pages/terminal.vue -->
<template>
  <div class="terminal-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <Icon name="terminal" class="title-icon" />
            Web Terminal
          </h1>
          <p class="page-subtitle">Interactive command line interface</p>
        </div>
        
        <div class="status-section">
          <div class="connection-status" :class="{ 
            connected: isConnected, 
            connecting: isLoading, 
            disconnected: !isConnected && !isLoading 
          }">
            <div class="status-indicator"></div>
            <span class="status-text">
              {{ isLoading ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected' }}
            </span>
          </div>
          
          <div class="server-info">
            <span class="server-url">localhost:8080</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Terminal Controls -->
    <div class="terminal-controls">
      <div class="control-group">
        <button 
          @click="connect" 
          :disabled="isConnected || isLoading"
          class="control-btn primary"
          :class="{ loading: isLoading }"
        >
          <Icon name="power" class="btn-icon" />
          {{ isLoading ? 'Connecting...' : 'Connect' }}
        </button>
        
        <button 
          @click="disconnect" 
          :disabled="!isConnected"
          class="control-btn danger"
        >
          <Icon name="power-off" class="btn-icon" />
          Disconnect
        </button>
        
        <button 
          @click="clear" 
          :disabled="!isConnected"
          class="control-btn secondary"
        >
          <Icon name="trash-2" class="btn-icon" />
          Clear
        </button>
      </div>
      
      <div class="control-group">
        <div class="size-controls">
          <label>Size:</label>
          <select v-model="selectedSize" @change="handleResize" :disabled="!isConnected">
            <option value="80x24">80x24 (Standard)</option>
            <option value="100x30">100x30 (Medium)</option>
            <option value="120x40">120x40 (Large)</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        
        <div class="theme-controls">
          <label>Theme:</label>
          <select v-model="selectedTheme" @change="handleThemeChange">
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="matrix">Matrix</option>
            <option value="retro">Retro</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error-banner">
      <Icon name="alert-circle" class="error-icon" />
      <span>{{ error }}</span>
      <button @click="clearError" class="error-close">
        <Icon name="x" />
      </button>
    </div>

    <!-- Terminal Container -->
    <div class="terminal-container" :class="`theme-${selectedTheme}`">
      <div class="terminal-header">
        <div class="terminal-tabs">
          <div class="tab active">
            <Icon name="terminal" class="tab-icon" />
            <span>Terminal 1</span>
          </div>
        </div>
        
        <div class="terminal-actions">
          <button 
            @click="toggleFullscreen" 
            class="terminal-action"
            title="Toggle Fullscreen"
          >
            <Icon :name="isFullscreen ? 'minimize-2' : 'maximize-2'" />
          </button>
        </div>
      </div>
      
      <div 
        ref="terminalElement"
        class="terminal"
        :class="{ fullscreen: isFullscreen }"
        @keydown="handleKeydown"
        @click="focusTerminal"
        tabindex="0"
      >
        <div class="terminal-output" v-html="formatTerminalOutput(terminalData)"></div>
        <span v-if="isConnected" class="cursor">█</span>
        
        <!-- Welcome message when not connected -->
        <div v-if="!isConnected && !terminalData" class="welcome-message">
          <div class="welcome-content">
            <Icon name="terminal" class="welcome-icon" />
            <h3>Welcome to Web Terminal</h3>
            <p>Click "Connect" to start a new terminal session</p>
            <div class="welcome-features">
              <div class="feature">
                <Icon name="keyboard" />
                <span>Full keyboard support</span>
              </div>
              <div class="feature">
                <Icon name="monitor" />
                <span>Resizable interface</span>
              </div>
              <div class="feature">
                <Icon name="zap" />
                <span>Real-time execution</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Info -->
    <div class="terminal-footer">
      <div class="footer-info">
        <div class="info-item">
          <strong>Shortcuts:</strong>
          <span>Ctrl+C (Interrupt), Ctrl+L (Clear), Ctrl+D (Exit)</span>
        </div>
        <div class="info-item">
          <strong>Current Directory:</strong>
          <span>{{ currentDirectory }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Page meta
definePageMeta({
  title: 'Terminal',
  description: 'Interactive web terminal interface'
})

// Use the terminal composable
const { 
  isConnected, 
  isLoading, 
  terminalData, 
  error,
  connect, 
  sendKeystroke, 
  resize, 
  clear, 
  disconnect 
} = useTerminal()

// Component state
const terminalElement = ref()
const selectedSize = ref('80x24')
const selectedTheme = ref('dark')
const isFullscreen = ref(false)
const currentDirectory = ref('~')

// Terminal size options
const sizeOptions = {
  '80x24': { cols: 80, rows: 24 },
  '100x30': { cols: 100, rows: 30 },
  '120x40': { cols: 120, rows: 40 }
}

// Icon component (simple implementation)
const Icon = defineComponent({
  props: {
    name: String
  },
  setup(props) {
    const icons = {
      'terminal': '⚡',
      'power': '⚡',
      'power-off': '⏻',
      'trash-2': '🗑️',
      'alert-circle': '⚠️',
      'x': '✕',
      'maximize-2': '⛶',
      'minimize-2': '⊟',
      'keyboard': '⌨️',
      'monitor': '🖥️',
      'zap': '⚡'
    }
    
    return () => h('span', { class: 'icon' }, icons[props.name] || props.name)
  }
})

// Methods
const handleKeydown = (event) => {
  if (!isConnected.value) return
  
  event.preventDefault()
  
  let data = ''
  
  // Handle special keys
  const keyMap = {
    'Enter': '\r',
    'Backspace': '\x7f',
    'Delete': '\x1b[3~',
    'Tab': '\t',
    'ArrowUp': '\x1b[A',
    'ArrowDown': '\x1b[B',
    'ArrowLeft': '\x1b[D',
    'ArrowRight': '\x1b[C',
    'Home': '\x1b[H',
    'End': '\x1b[F',
    'PageUp': '\x1b[5~',
    'PageDown': '\x1b[6~',
    'Escape': '\x1b'
  }
  
  // Handle Ctrl combinations
  if (event.ctrlKey) {
    const ctrlMap = {
      'c': '\x03', // Ctrl+C
      'd': '\x04', // Ctrl+D
      'z': '\x1a', // Ctrl+Z
      'l': '\x0c'  // Ctrl+L
    }
    data = ctrlMap[event.key.toLowerCase()]
  } else if (keyMap[event.key]) {
    data = keyMap[event.key]
  } else if (event.key.length === 1) {
    data = event.key
  }
  
  if (data) {
    sendKeystroke(data)
  }
}

const formatTerminalOutput = (output) => {
  // Enhanced ANSI escape sequence handling
  return output
    // .replace(/\x1b\[[0-9;]*m/g, '') // Remove color codes for basic version
    // .replace(/\r\n/g, '\n')
    // .replace(/\r/g, '\n')
    // .replace(/\n/g, '<br>')
    // .replace(/ /g, '&nbsp;')
    .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
}

const focusTerminal = () => {
  if (terminalElement.value) {
    terminalElement.value.focus()
  }
}

const handleResize = () => {
  if (selectedSize.value !== 'custom' && sizeOptions[selectedSize.value]) {
    const { cols, rows } = sizeOptions[selectedSize.value]
    resize(cols, rows)
  }
}

const handleThemeChange = () => {
  // Theme change is handled via CSS classes
  focusTerminal()
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  
  if (isFullscreen.value) {
    document.documentElement.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}

const clearError = () => {
  // This would need to be implemented in the composable
  console.log('Clear error')
}

// Watch for terminal data changes to extract current directory
watch(terminalData, (newData) => {
  // Simple regex to extract current directory from terminal output
  const lines = newData.split('\n')
  const lastLine = lines[lines.length - 1] || lines[lines.length - 2]
  
  // Look for common prompt patterns
  const promptMatch = lastLine?.match(/.*?([~/][^\s]*)\s*[\$#>]\s*$/)
  if (promptMatch) {
    currentDirectory.value = promptMatch[1]
  }
})

// Auto-focus terminal when connected
watch(isConnected, (connected) => {
  if (connected) {
    nextTick(() => focusTerminal())
  }
})

// Auto-connect on mount
onMounted(() => {
  focusTerminal()
  // Auto-connect after a short delay
  setTimeout(() => {
    if (!isConnected.value) {
      connect()
    }
  }, 500)
})

// Handle fullscreen changes
onMounted(() => {
  const handleFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement
  }
  
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  
  onUnmounted(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
  })
})
</script>

<style scoped>
.terminal-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
  color: #ffffff;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  display: flex;
  flex-direction: column;
}

/* Header Styles */
.page-header {
  background: rgba(0, 0, 0, 0.5);
  border-bottom: 1px solid #333;
  padding: 1.5rem 2rem;
  backdrop-filter: blur(10px);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.title-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(45deg, #00ff88, #00ccff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-icon {
  font-size: 1.8rem;
}

.page-subtitle {
  color: #888;
  margin: 0;
  font-size: 1rem;
}

.status-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.connection-status.connected {
  background: rgba(76, 222, 128, 0.2);
  border: 1px solid #4ade80;
  color: #4ade80;
}

.connection-status.connecting {
  background: rgba(251, 191, 36, 0.2);
  border: 1px solid #fbbf24;
  color: #fbbf24;
}

.connection-status.disconnected {
  background: rgba(248, 113, 113, 0.2);
  border: 1px solid #f87171;
  color: #f87171;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

.server-info {
  color: #666;
  font-size: 0.8rem;
  font-family: monospace;
}

/* Controls Styles */
.terminal-controls {
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem 2rem;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 0.5rem;
  font-family: inherit;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn.primary {
  background: linear-gradient(45deg, #00ff88, #00ccff);
  color: #000;
}

.control-btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
}

.control-btn.danger {
  background: linear-gradient(45deg, #ff4757, #ff6b7a);
  color: white;
}

.control-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.size-controls, .theme-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.size-controls label, .theme-controls label {
  font-size: 0.9rem;
  color: #ccc;
}

.size-controls select, .theme-controls select {
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: 1px solid #444;
  border-radius: 0.25rem;
  padding: 0.4rem 0.8rem;
  font-family: inherit;
}

/* Error Banner */
.error-banner {
  background: rgba(248, 113, 113, 0.2);
  border: 1px solid #f87171;
  color: #f87171;
  padding: 1rem;
  margin: 0 2rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
}

.error-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  margin-left: auto;
  font-size: 1.2rem;
}

/* Terminal Container */
.terminal-container {
  flex: 1;
  margin: 2rem;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border: 1px solid #333;
  transition: all 0.3s ease;
}

.terminal-header {
  background: #2d2d2d;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #444;
}

.terminal-tabs {
  display: flex;
  gap: 0.5rem;
}

.tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  font-size: 0.85rem;
}

.tab.active {
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
}

.terminal-actions {
  display: flex;
  gap: 0.5rem;
}

.terminal-action {
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: color 0.2s;
}

.terminal-action:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.terminal {
  height: 500px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.4;
  outline: none;
  position: relative;
  padding: 1rem;
  transition: all 0.3s ease;
}

.terminal.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  height: 100vh;
  border-radius: 0;
}

.terminal-output {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  min-height: calc(100% - 2rem);
}

.cursor {
  animation: blink 1s infinite;
  background: currentColor;
  color: transparent;
}

/* Welcome Message */
.welcome-message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
}

.welcome-content {
  text-align: center;
  max-width: 400px;
}

.welcome-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #00ff88;
}

.welcome-content h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #fff;
}

.welcome-content p {
  color: #888;
  margin-bottom: 2rem;
}

.welcome-features {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feature {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #ccc;
  font-size: 0.9rem;
}

/* Theme Variations */
.theme-dark {
  background: #000;
  color: #00ff00;
}

.theme-light {
  background: #f5f5f5;
  color: #333;
}

.theme-matrix {
  background: #000;
  color: #00ff41;
  font-family: 'Courier New', monospace;
}

.theme-retro {
  background: #001100;
  color: #00aa00;
  font-family: 'Monaco', monospace;
}

/* Footer */
.terminal-footer {
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid #333;
  padding: 1rem 2rem;
}

.footer-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  font-size: 0.85rem;
  color: #888;
}

.info-item strong {
  color: #ccc;
  margin-right: 0.5rem;
}

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .terminal-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .control-group {
    justify-content: center;
  }

  .terminal-container {
    margin: 1rem;
  }

  .terminal {
    height: 400px;
  }

  .footer-info {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}

/* Scrollbar Styling */
.terminal::-webkit-scrollbar {
  width: 8px;
}

.terminal::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

.terminal::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.terminal::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>