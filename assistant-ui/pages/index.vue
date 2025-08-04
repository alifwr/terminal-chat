<script setup lang="ts">
import { useChat } from '@ai-sdk/vue';
import { ref, nextTick, onMounted } from 'vue';

const { messages, input, status, handleSubmit } = useChat({ maxSteps: 5 });
const messagesContainer = ref<HTMLElement>();
const sessionId = ref(null);
const expandedToolInvocations = ref<Record<string, boolean>>({});

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

onMounted(scrollToBottom);

const handleFormSubmit = (e: Event) => {
  handleSubmit(e, {
    data: {
      sessionId: sessionId.value
    }
  });
  scrollToBottom();
};

const getTimeStamp = () => {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const toggleToolInvocation = (index: number) => {
  const key = `${messages.value.length}-${index}`;
  expandedToolInvocations.value[key] = !expandedToolInvocations.value[key];
};
</script>

<template>
  <div class="main-container">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <h1 class="title">AI Terminal</h1>
        <div class="status">
          <div class="status-dot"></div>
          <span>Online</span>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="content-grid">
      <!-- Chat Section -->
      <div class="chat-section">
        <div class="section-header">
          <h2>AI Assistant</h2>
        </div>

        <div ref="messagesContainer" class="messages">
          <div v-if="messages.length === 0" class="welcome-message">
            <h3>Ready for input</h3>
            <p>Start a conversation with the AI assistant</p>
          </div>

          <div v-for="m in messages" :key="m.id" :class="['message', m.role]">
            <div class="message-avatar">
              {{ m.role === 'user' ? 'U' : 'AI' }}
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="sender">{{ m.role === 'user' ? 'You' : 'Assistant' }}</span>
                <span class="timestamp">{{ getTimeStamp() }}</span>
              </div>
              <div class="message-text">
                <div v-for="(part, partIndex) in m.parts" :key="partIndex">
                  <div v-if="part.type === 'text'" class="text-part">{{ part.text }}</div>
                  <div v-if="part.type === 'tool-invocation'" class="tool-part">
                    <div class="tool-header" @click="toggleToolInvocation(partIndex)">
                      <div class="tool-label">Process</div>
                      <div class="tool-toggle">
                        {{ expandedToolInvocations[`${messages.length}-${partIndex}`] ? '▼' : '▶' }}
                      </div>
                    </div>
                    <pre v-if="expandedToolInvocations[`${messages.length}-${partIndex}`]">{{ part.toolInvocation }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleFormSubmit" class="input-form">
          <div class="input-container">
            <input v-model="input" placeholder="Type your message..." class="input-field" :class="{ 'loading': status === 'streaming' }" autocomplete="off" :disabled="status==='streaming'" />

            <button type="submit" class="send-button" :disabled="!input.trim()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      <!-- Terminal Section -->
      <div class="terminal-section">
        <div class="section-header">
          <h2>Terminal</h2>
        </div>

        <div class="terminal-wrapper">
          <ClientOnly>
            <XTerminal server-url="http://mcp-terminal:8080" @session-id-received="sessionId = $event" />
            <template #fallback>
              <div class="terminal-loading">
                <p>Loading terminal...</p>
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
body {
  margin: 0px;
}

.main-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #0d1117;
  color: #e6edf3;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
}

.header {
  background: #161b22;
  border-bottom: 1px solid #30363d;
  padding: 1rem 1.5rem;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #f0f6fc;
}

.status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #7d8590;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #3fb950;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  flex: 1;
  background: #30363d;
  overflow: hidden;
}

.chat-section,
.terminal-section {
  background: #0d1117;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-header {
  background: #161b22;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #30363d;
  flex-shrink: 0;
}

.section-header h2 {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
  color: #7d8590;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.messages::-webkit-scrollbar {
  width: 8px;
}

.messages::-webkit-scrollbar-track {
  background: #161b22;
}

.messages::-webkit-scrollbar-thumb {
  background: #30363d;
  border-radius: 4px;
}

.messages::-webkit-scrollbar-thumb:hover {
  background: #484f58;
}

.welcome-message {
  text-align: center;
  padding: 2rem;
  color: #7d8590;
}

.welcome-message h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #e6edf3;
}

.welcome-message p {
  margin: 0;
  font-size: 0.875rem;
}

.message {
  display: flex;
  gap: 0.75rem;
  max-width: 85%;
  animation: slideIn 0.3s ease-out;
}

.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #21262d;
  border: 1px solid #30363d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #7d8590;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: #1f2937;
  color: #9ca3af;
}

.message-content {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 0.75rem;
  flex: 1;
}

.message.user .message-content {
  background: #1f2937;
  border-color: #374151;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
}

.sender {
  font-weight: 600;
  color: #e6edf3;
}

.timestamp {
  color: #7d8590;
}

.message-text {
  line-height: 1.5;
  font-size: 0.875rem;
}

.text-part {
  margin-bottom: 0.5rem;
}

.text-part:last-child {
  margin-bottom: 0;
}

.tool-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.tool-toggle {
  font-size: 0.75rem;
  color: #7d8590;
  transition: color 0.2s ease;
}

.tool-header:hover .tool-toggle {
  color: #e6edf3;
}

.tool-part {
  background: #0d1117;
  border: 1px solid #21262d;
  border-radius: 6px;
  padding: 0.75rem;
  margin: 0.5rem 0;
}

.tool-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #7d8590;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.tool-part pre {
  font-size: 0.8125rem;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  word-wrap: break-word;
  overflow-wrap: break-word;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}

.input-form {
  padding: 1rem;
  border-top: 1px solid #30363d;
  background: #161b22;
  flex-shrink: 0;
}

.input-container {
  display: flex;
  gap: 0.5rem;
}

.input-field {
  flex: 1;
  padding: 0.75rem;
  font-size: 0.875rem;
  border: 1px solid #30363d;
  border-radius: 6px;
  background: #0d1117;
  color: #e6edf3;
  outline: none;
  transition: border-color 0.2s ease;
}

.input-field:focus {
  border-color: #1f6feb;
  box-shadow: 0 0 0 3px rgba(31, 111, 235, 0.1);
}

.input-field::placeholder {
  color: #7d8590;
}

.input-field.loading {
  background-image: linear-gradient(90deg, transparent 0%, #30363d 50%, transparent 100%);
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
  pointer-events: none;
}

@keyframes loading {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

.send-button {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid #30363d;
  background: #21262d;
  color: #7d8590;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.send-button:hover:not(:disabled) {
  background: #30363d;
  color: #e6edf3;
}

.send-button:disabled {
  background: #161b22;
  color: #484f58;
  cursor: not-allowed;
}

.terminal-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: 1rem;
  border: 1px solid #30363d;
  border-radius: 8px;
  background: #0d1117;
}

.terminal-loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7d8590;
  font-size: 0.875rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }

  .terminal-section {
    order: -1;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 0.75rem 1rem;
  }

  .header-content {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .messages {
    padding: 0.75rem;
  }

  .message {
    max-width: 95%;
  }

  .input-form {
    padding: 0.75rem;
  }

  .terminal-wrapper {
    margin: 0.75rem;
  }
}

/* Dark scrollbar for webkit browsers */
* {
  scrollbar-width: thin;
  scrollbar-color: #30363d #161b22;
}
</style>