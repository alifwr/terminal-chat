<script setup lang="ts">
import { useChat } from '@ai-sdk/vue';
import { ref, nextTick, computed, watch } from 'vue';

const props = defineProps({
  terminalSessionId: {
    type: Number,
    required: true
  },
  modelConfig: {
    type: Object,
    required: true
  }
});

const { messages, input, handleSubmit, isLoading } = useChat();
const messagesContainer = ref<HTMLElement>();
const inputRef = ref<HTMLInputElement>();

// Auto-scroll to bottom when new messages arrive
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

// Watch for new messages and scroll
watch(messages, scrollToBottom, { deep: true });

// Enhanced submit handler
const onSubmit = (e: Event) => {
  e.preventDefault();
  if (input.value.trim()) {
    handleSubmit(e, {
      data: {
        terminalSessionId: props.terminalSessionId,
        modelName: props.modelConfig.modelName,
        baseUrl: props.modelConfig.baseUrl,
        apiKey: props.modelConfig.apiKey
      },
    });
    scrollToBottom();
  }
};

// Format tool invocation display
const formatToolCall = (toolInvocation: any) => {
  if (typeof toolInvocation === 'object') {
    return {
      name: toolInvocation.toolName || 'Unknown Tool',
      args: toolInvocation.args || {},
      state: toolInvocation.state || 'pending'
    };
  }
  return { name: 'Tool Call', args: {}, state: 'pending' };
};

// Format timestamp
const formatTime = (timestamp?: Date | string) => {
  if (!timestamp) return '';
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div class="flex items-center space-x-3">
        <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          AI Assistant
        </h1>
        <span class="text-sm text-gray-500 dark:text-gray-400">
          with Tool Calling
        </span>
      </div>
    </div>

    <!-- Messages Container -->
    <div 
      ref="messagesContainer"
      class="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gray-50 dark:bg-gray-900"
    >
      <!-- Welcome Message -->
      <div v-if="messages.length === 0" class="text-center py-12">
        <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Start a conversation
        </h3>
        <p class="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          Ask me anything! I can help with various tasks and use tools when needed.
        </p>
      </div>

      <!-- Messages -->
      <div
        v-for="(message, index) in messages"
        :key="message.id || index"
        class="flex w-full"
        :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div 
          class="max-w-3xl flex"
          :class="message.role === 'user' ? 'flex-row-reverse' : 'flex-row'"
        >
          <!-- Avatar -->
          <div class="flex-shrink-0" :class="message.role === 'user' ? 'ml-3' : 'mr-3'">
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
              :class="message.role === 'user' 
                ? 'bg-blue-600 dark:bg-blue-500' 
                : 'bg-purple-600 dark:bg-purple-500'"
            >
              {{ message.role === 'user' ? 'U' : 'AI' }}
            </div>
          </div>

          <!-- Message Content -->
          <div class="flex-1 min-w-0">
            <div 
              class="rounded-2xl px-4 py-3 shadow-sm"
              :class="message.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'"
            >
              <!-- Message Parts -->
              <div v-for="(part, partIndex) in message.parts" :key="partIndex" class="space-y-2">
                <!-- Text Content -->
                <div v-if="part.type === 'text'" class="whitespace-pre-wrap">
                  {{ part.text }}
                </div>

                <!-- Tool Invocation -->
                <div v-if="part.type === 'tool-invocation'" class="mt-2">
                  <div 
                    class="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 border-l-4 border-yellow-400"
                  >
                    <div class="flex items-center space-x-2 mb-2">
                      <svg class="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <span class="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Tool: {{ formatToolCall(part.toolInvocation).name }}
                      </span>
                      <span class="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        calling
                      </span>
                    </div>
                    <div class="text-xs text-gray-600 dark:text-gray-300 font-mono bg-gray-50 dark:bg-gray-800 rounded p-2">
                      {{ JSON.stringify(formatToolCall(part.toolInvocation).args, null, 2) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Timestamp -->
              <div 
                class="text-xs mt-2 opacity-70"
                :class="message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'"
              >
                {{ formatTime(message.createdAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Indicator -->
      <div v-if="isLoading" class="flex justify-start">
        <div class="flex mr-3">
          <div class="w-8 h-8 rounded-full bg-purple-600 dark:bg-purple-500 flex items-center justify-center text-white text-sm font-medium">
            AI
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700">
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4">
      <form @submit="onSubmit" class="flex space-x-3">
        <div class="flex-1 relative">
          <input
            ref="inputRef"
            v-model="input"
            type="text"
            placeholder="Type your message..."
            :disabled="isLoading"
            class="w-full px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <button
          type="submit"
          :disabled="isLoading || !input.trim()"
          class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg v-if="!isLoading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
          <svg v-else class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </button>
      </form>
      
      <!-- Quick Actions -->
      <div class="flex flex-wrap gap-2 mt-3">
        <button
          @click="input = 'What can you help me with?'"
          class="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Help
        </button>
        <button
          @click="input = 'Show me what tools you have available'"
          class="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Available Tools
        </button>
        <button
          @click="input = 'Clear this conversation'"
          class="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Clear Chat
        </button>
      </div>
    </div>
  </div>
</template>