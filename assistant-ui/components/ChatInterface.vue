<!-- components/ChatInterface.vue -->
<template>
    <div class="h-full flex flex-col">
        <!-- Messages Area -->
        <div ref="messagesContainer" class="flex-1 overflow-auto space-y-3 mb-4">
            <div v-for="m in messages" :key="m.id" :class="[
                'flex',
                m.role === 'user' ? 'justify-end' : 'justify-start'
            ]">
                <div :class="[
                    'max-w-xs p-3 rounded-lg text-sm',
                    m.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                ]">

                    <div v-for="(part, partIndex) in m.parts" :key="partIndex">
                        <div v-if="part.type === 'text'" class="mb-2 last:mb-0">{{ part.text }}</div>
                        <div v-if="part.type === 'tool-invocation'"
                            class="bg-gray-100 border border-gray-200 rounded p-3 my-2">
                            <div class="flex justify-between items-center cursor-pointer select-none"
                                @click="toggleToolInvocation(partIndex)">
                                <div class="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Process
                                </div>
                                <div class="text-xs text-gray-500 transition-colors hover:text-gray-200">
                                    {{ expandedToolInvocations[`${messages.length}-${partIndex}`] ? '▼' : '▶' }}
                                </div>
                            </div>
                            <pre v-if="expandedToolInvocations[`${messages.length}-${partIndex}`]"
                                class="text-xs whitespace-pre-wrap break-words font-mono">{{ part.toolInvocation }}</pre>
                        </div>
                    </div>

                    <div :class="[
                        'text-xs',
                        m.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                    ]">
                        {{ getTimeStamp() }}
                        <!-- {{ formatTime(m.timestamp) }} -->
                    </div>

                </div>
            </div>
        </div>

        <!-- Input Area -->
        <div class="border-t border-gray-200 pt-3">
            <form @submit.prevent="handleFormSubmit" class="flex space-x-2">
                <input v-model="input" type="text" placeholder="Type your message..."
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    :class="{ 'bg-gradient-loading bg-size-200 animate-pulse-bg': status === 'streaming' }"
                    autocomplete="off" :disabled="status === 'streaming'" />
                <button type="submit" :disabled="!input.trim()"
                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
                    </svg>
                </button>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useChat } from '@ai-sdk/vue';
import { ref, nextTick, onMounted } from 'vue';

const {
    modelName,
    baseUrl,
    apiKey,
    temperature,
    maxTokens,
} = useModelConfig();
const { sessionId } = useTerminalSession();

const { messages, input, status, handleSubmit } = useChat({ maxSteps: 5 });
const messagesContainer = ref<HTMLElement>();
const expandedToolInvocations = ref<Record<string, boolean>>({});

const scrollToBottom = () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
    });
};

watch(status, () => {
    console.log("STATUS: ", status.value)
})

onMounted(() => {
    scrollToBottom();
});

const handleFormSubmit = (e: Event) => {
    handleSubmit(e, {
        data: {
            sessionId: sessionId.value,
            apiKey: apiKey.value,
            baseUrl: baseUrl.value,
            model: modelName.value,
            temperature: temperature.value,
            maxTokens: maxTokens.value
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