<script setup lang="ts">
import { useChat } from '@ai-sdk/vue';
import { ref, nextTick, onMounted } from 'vue';

const config = useRuntimeConfig();
const terminalUrl = config.websocketUrl;
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
  <div class="flex flex-col h-screen bg-gray-900 text-gray-200 font-sans">
    <!-- Header -->
    <header class="bg-gray-800 border-b border-gray-700 py-4 px-6 flex-shrink-0 max-md:py-3 max-md:px-4">
      <div class="flex items-center justify-between max-w-6xl mx-auto max-md:flex-col max-md:gap-2 max-md:text-center">
        <h1 class="text-xl font-semibold text-gray-100">AI Terminal</h1>
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Online</span>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="grid grid-cols-2 gap-px bg-gray-700 flex-1 overflow-hidden max-md:grid-cols-1 max-md:grid-rows-2">
      <!-- Chat Section -->
      <div class="flex flex-col bg-gray-900 overflow-hidden">
        <div class="bg-gray-800 px-4 py-3 border-b border-gray-700 flex-shrink-0">
          <h2 class="text-xs font-semibold uppercase tracking-wide text-gray-500">AI Assistant</h2>
        </div>

        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 flex flex-col gap-4 max-md:p-3">
          <div v-if="messages.length === 0" class="text-center py-8 text-gray-500">
            <h3 class="text-lg font-semibold text-gray-200 mb-2">Ready for input</h3>
            <p class="text-sm">Start a conversation with the AI assistant</p>
          </div>

          <div v-for="m in messages" :key="m.id"
            :class="['flex gap-3 max-w-[85%] max-md:max-w-[95%]', m.role === 'user' ? 'self-end flex-row-reverse' : '']">
            <div :class="[
              'w-8 h-8 rounded flex-shrink-0 flex items-center justify-center text-xs font-semibold',
              m.role === 'user'
                ? 'bg-gray-700 text-gray-400 border border-gray-600'
                : 'bg-gray-800 text-gray-500 border border-gray-700'
            ]">
              {{ m.role === 'user' ? 'U' : 'AI' }}
            </div>
            <div :class="[
              'flex-1 border rounded-lg p-3',
              m.role === 'user'
                ? 'bg-gray-700 border-gray-600'
                : 'bg-gray-800 border-gray-700'
            ]">
              <div class="flex justify-between items-center mb-2 text-xs">
                <span class="font-semibold text-gray-200">{{ m.role === 'user' ? 'You' : 'Assistant' }}</span>
                <span class="text-gray-500">{{ getTimeStamp() }}</span>
              </div>
              <div class="text-sm leading-relaxed">
                <div v-for="(part, partIndex) in m.parts" :key="partIndex">
                  <div v-if="part.type === 'text'" class="mb-2 last:mb-0">{{ part.text }}</div>
                  <div v-if="part.type === 'tool-invocation'"
                    class="bg-gray-900 border border-gray-800 rounded p-3 my-2">
                    <div class="flex justify-between items-center cursor-pointer select-none"
                      @click="toggleToolInvocation(partIndex)">
                      <div class="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Process</div>
                      <div class="text-xs text-gray-500 transition-colors hover:text-gray-200">
                        {{ expandedToolInvocations[`${messages.length}-${partIndex}`] ? '▼' : '▶' }}
                      </div>
                    </div>
                    <pre v-if="expandedToolInvocations[`${messages.length}-${partIndex}`]"
                      class="text-xs whitespace-pre-wrap break-words font-mono">{{ part.toolInvocation }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleFormSubmit"
          class="p-4 border-t border-gray-700 bg-gray-800 flex-shrink-0 max-md:p-3">
          <div class="flex gap-2">
            <input v-model="input" placeholder="Type your message..." :class="[
              'flex-1 px-3 py-2 text-sm border border-gray-700 rounded bg-gray-900 text-gray-200 outline-none transition-colors',
              status === 'streaming' ? 'bg-gradient-loading bg-size-200 animate-pulse-bg' : '',
              'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            ]" autocomplete="off" :disabled="status === 'streaming'" />

            <button type="submit" :disabled="!input.trim()" :class="[
              'w-9 h-9 rounded flex items-center justify-center transition-colors',
              input.trim()
                ? 'bg-gray-700 border border-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-200'
                : 'bg-gray-800 border border-gray-700 text-gray-600 cursor-not-allowed'
            ]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      <!-- Terminal Section -->
      <div class="flex flex-col bg-gray-900 overflow-hidden max-md:order-first">
        <div class="bg-gray-800 px-4 py-3 border-b border-gray-700 flex-shrink-0">
          <h2 class="text-xs font-semibold uppercase tracking-wide text-gray-500">Terminal</h2>
        </div>

        <div class="flex-1 flex flex-col overflow-hidden m-4 border border-gray-700 rounded bg-gray-900 max-md:m-3">
          <ClientOnly>
            <XTerminal :server-url="terminalUrl" @session-id-received="sessionId = $event" />
            <template #fallback>
              <div class="flex-1 flex items-center justify-center text-gray-500 text-sm">
                <p>Loading terminal...</p>
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </div>
  </div>
</template>
