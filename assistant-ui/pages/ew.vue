<script setup lang="ts">
import { useChat } from '@ai-sdk/vue';
import { ref, nextTick, onMounted } from 'vue';

const { messages, input, handleSubmit } = useChat({maxSteps: 5});
const messagesContainer = ref<HTMLElement>();

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

onMounted(scrollToBottom);

const handleFormSubmit = (e: Event) => {
  handleSubmit(e);
  scrollToBottom();
};

const getTimeStamp = () => {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>

<template>
  <div class="chat-container">
    <header class="chat-header">
      <div class="header-content">
        <div class="avatar-group">
          <div class="avatar ai-avatar">AI</div>
          <!-- <div class="avatar user-avatar">USR</div> -->
        </div>
        <h1 class="chat-title">TERMINAL</h1>
        <div class="status-indicator">
          <div class="status-dot"></div>
          <span>ONLINE</span>
        </div>
      </div>
    </header>

    <div ref="messagesContainer" class="messages">
      <div v-if="messages.length === 0" class="welcome-message">
        <h2>AI ASSISTANT</h2>
        <p>>>> READY FOR INPUT</p>
        <div class="terminal-cursor">_</div>
      </div>
      
      <div
        v-for="m in messages"
        :key="m.id"
        :class="['message-wrapper', m.role]"
      >
        <div class="message-bubble">
          <div class="message-avatar">
            {{ m.role === 'user' ? 'USR' : 'SYS' }}
          </div>
          <div class="message-content">
            <div class="message-header">
              <span class="sender-name">{{ m.role === 'user' ? 'USER' : 'SYSTEM' }}</span>
              <span class="timestamp">{{ getTimeStamp() }}</span>
            </div>
            <div class="message-text">
              <div v-for="(part, partIndex) in m.parts" :key="partIndex">
                <div v-if="part.type === 'text'" class="text-part">{{ part.text }}</div>
                <div v-if="part.type === 'tool-invocation'" class="tool-part">
                  <div class="tool-badge">PROCESS</div>
                  <pre>{{ part.toolInvocation }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <form @submit.prevent="handleFormSubmit" class="input-form">
      <div class="input-container">
        <input
          v-model="input"
          placeholder="> _"
          class="input-field"
          autocomplete="off"
        />
        <button type="submit" class="send-button" :disabled="!input.trim()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
          </svg>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
    font-family: 'Courier New', 'Monaco', 'Consolas', monospace;
    position: relative;
  }

  .chat-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 50%, rgba(100, 100, 100, 0.02) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(120, 120, 120, 0.02) 0%, transparent 50%),
      linear-gradient(0deg, rgba(80, 80, 80, 0.03) 0px, transparent 1px),
      linear-gradient(90deg, rgba(80, 80, 80, 0.03) 0px, transparent 1px);
    background-size: 100% 100%, 100% 100%, 50px 50px, 50px 50px;
    pointer-events: none;
  }

  .chat-header {
    background: linear-gradient(135deg, #1a1a1a 0%, #0e0e0e 100%);
    border-bottom: 3px solid #666;
    border-top: 1px solid #333;
    padding: 1rem 1.5rem;
    box-shadow: 
      inset 0 1px 0 rgba(120, 120, 120, 0.1),
      0 4px 20px rgba(0, 0, 0, 0.5);
    position: relative;
    z-index: 1;
  }

  .chat-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      #666 25%, 
      #888 50%, 
      #666 75%, 
      transparent 100%);
    animation: scanline 3s linear infinite;
  }

  @keyframes scanline {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
  }

  .avatar-group {
    display: flex;
    gap: -8px;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    border: 2px solid #555;
    box-shadow: 
      inset 0 0 10px rgba(100, 100, 100, 0.1),
      0 0 10px rgba(100, 100, 100, 0.1);
    background: #111;
    clip-path: polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%);
  }

  .ai-avatar {
    background: linear-gradient(135deg, #1a1a1a, #111);
    color: #aaa;
    border-color: #555;
  }

  .user-avatar {
    background: linear-gradient(135deg, #1a1a1a, #111);
    color: #ccc;
    border-color: #666;
    margin-left: -8px;
  }

  .chat-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: #aaa;
    margin: 0;
    letter-spacing: 2px;
    text-shadow: 0 0 5px rgba(170, 170, 170, 0.3);
    font-family: 'Courier New', monospace;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #888;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    background: #888;
    border-radius: 0;
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    animation: pulse 2s infinite;
    box-shadow: 0 0 5px #888;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.2); }
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 2rem 1.5rem 1rem;
    background: linear-gradient(180deg, rgba(26, 26, 26, 0.9) 0%, rgba(45, 45, 45, 0.9) 100%);
    backdrop-filter: blur(5px);
    position: relative;
    z-index: 1;
  }

  .messages::-webkit-scrollbar {
    width: 8px;
  }

  .messages::-webkit-scrollbar-track {
    background: #1a1a1a;
    border: 1px solid #333;
  }

  .messages::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #666, #888);
    border: 1px solid #666;
    box-shadow: inset 0 0 5px rgba(100, 100, 100, 0.3);
  }

  .messages::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #888, #666);
  }

  .welcome-message {
    text-align: center;
    color: #aaa;
    margin-top: 4rem;
    padding: 2rem;
    border: 2px solid #555;
    background: linear-gradient(135deg, rgba(16, 16, 16, 0.8), rgba(26, 26, 26, 0.8));
    clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px));
    box-shadow: inset 0 0 20px rgba(100, 100, 100, 0.05);
  }


  .welcome-message h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    font-weight: 700;
    letter-spacing: 3px;
    text-shadow: 0 0 5px rgba(170, 170, 170, 0.3);
  }

  .welcome-message p {
    font-size: 1rem;
    opacity: 0.9;
    font-family: 'Courier New', monospace;
    letter-spacing: 1px;
  }

  .terminal-cursor {
    display: inline-block;
    animation: blink 1s infinite;
    color: #888;
    font-weight: bold;
    margin-left: 5px;
  }

  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }

  .message-wrapper {
    margin-bottom: 1.5rem;
    display: flex;
    animation: slideIn 0.5s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px) rotateY(-5deg);
    }
    to {
      opacity: 1;
      transform: translateX(0) rotateY(0deg);
    }
  }

  .message-wrapper.user {
    justify-content: flex-end;
    animation: slideInRight 0.5s ease-out;
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px) rotateY(5deg);
    }
    to {
      opacity: 1;
      transform: translateX(0) rotateY(0deg);
    }
  }

  .message-bubble {
    display: flex;
    gap: 12px;
    max-width: 70%;
    align-items: flex-start;
  }

  .user .message-bubble {
    flex-direction: row-reverse;
  }

  .message-avatar {
    width: 40px;
    height: 40px;
    border-radius: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;
    background: #111;
    border: 2px solid #555;
    box-shadow: 
      inset 0 0 10px rgba(100, 100, 100, 0.1),
      0 0 5px rgba(100, 100, 100, 0.1);
    flex-shrink: 0;
    clip-path: polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%);
    color: #aaa;
    letter-spacing: 1px;
  }

  .message-content {
    background: linear-gradient(135deg, #1a1a1a, #111);
    border: 1px solid #333;
    border-radius: 0;
    padding: 16px 20px;
    box-shadow: 
      inset 0 1px 0 rgba(120, 120, 120, 0.1),
      0 4px 15px rgba(0, 0, 0, 0.5);
    position: relative;
    color: #ccc;
    clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
  }

  .user .message-content {
    background: linear-gradient(135deg, #222, #1a1a1a);
    border-color: #666;
    color: #eee;
    box-shadow: 
      inset 0 1px 0 rgba(150, 150, 150, 0.1),
      0 4px 15px rgba(0, 0, 0, 0.5);
  }

  .user .message-content::before {
    content: '';
    position: absolute;
    top: 15px;
    right: -6px;
    width: 0;
    height: 0;
    border: 6px solid transparent;
    border-left-color: #222;
  }

  .ai .message-content::before {
    content: '';
    position: absolute;
    top: 15px;
    left: -6px;
    width: 0;
    height: 0;
    border: 6px solid transparent;
    border-right-color: #1a1a1a;
  }

  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    border-bottom: 1px solid rgba(120, 120, 120, 0.2);
    padding-bottom: 4px;
  }

  .sender-name {
    font-weight: 700;
    font-size: 0.8rem;
    color: #aaa;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .user .sender-name {
    color: #ccc;
  }

  .timestamp {
    font-size: 0.7rem;
    opacity: 0.6;
    color: #888;
    font-family: 'Courier New', monospace;
  }

  .message-text {
    line-height: 1.6;
    font-size: 1rem;
  }

  .text-part {
    margin-bottom: 8px;
  }

  .text-part:last-child {
    margin-bottom: 0;
  }

  .tool-part {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 0;
    padding: 12px;
    margin: 8px 0;
    border-left: 3px solid #666;
    border-top: 1px solid #333;
    border-bottom: 1px solid #333;
    box-shadow: inset 0 0 10px rgba(100, 100, 100, 0.05);
  }

  .user .tool-part {
    background: rgba(0, 0, 0, 0.2);
    border-left-color: #777;
  }

  .tool-badge {
    font-size: 0.8rem;
    font-weight: 700;
    margin-bottom: 8px;
    color: #aaa;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .user .tool-badge {
    color: #ccc;
  }

  .tool-part pre {
    font-size: 0.85rem;
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .input-form {
    padding: 1.5rem;
    background: linear-gradient(135deg, #1a1a1a, #111);
    backdrop-filter: blur(5px);
    border-top: 3px solid #666;
    box-shadow: 
      inset 0 1px 0 rgba(120, 120, 120, 0.1),
      0 -4px 20px rgba(0, 0, 0, 0.5);
    position: relative;
    z-index: 1;
  }

  .input-container {
    display: flex;
    gap: 12px;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
  }

  .input-field {
    flex: 1;
    padding: 16px 20px;
    font-size: 1rem;
    border: 2px solid #333;
    border-radius: 0;
    background: #111;
    color: #ccc;
    box-shadow: 
      inset 0 2px 5px rgba(0, 0, 0, 0.5),
      0 0 5px rgba(100, 100, 100, 0.05);
    transition: all 0.3s ease;
    outline: none;
    font-family: 'Courier New', monospace;
    clip-path: polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px));
  }

  .input-field:focus {
    border-color: #666;
    box-shadow: 
      inset 0 2px 5px rgba(0, 0, 0, 0.5),
      0 0 10px rgba(120, 120, 120, 0.3);
    color: #eee;
  }

  .input-field::placeholder {
    color: #555;
    font-family: 'Courier New', monospace;
  }

  .send-button {
    width: 50px;
    height: 50px;
    border-radius: 0;
    border: 2px solid #555;
    background: linear-gradient(135deg, #1a1a1a, #111);
    color: #aaa;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow: 
      inset 0 0 10px rgba(100, 100, 100, 0.1),
      0 0 5px rgba(100, 100, 100, 0.1);
    clip-path: polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%);
  }

  .send-button:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 
      inset 0 0 15px rgba(120, 120, 120, 0.2),
      0 0 10px rgba(120, 120, 120, 0.3);
    color: #ccc;
    border-color: #777;
  }

  .send-button:disabled {
    background: linear-gradient(135deg, #111, #0a0a0a);
    border-color: #222;
    color: #333;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }

  @media (max-width: 768px) {
    .chat-header {
      padding: 1rem;
    }

    .header-content {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }

    .messages {
      padding: 1rem;
    }

    .message-bubble {
      max-width: 85%;
    }

    .input-form {
      padding: 1rem;
    }

    .chat-title {
      font-size: 1rem;
      letter-spacing: 1px;
    }
  }
</style>