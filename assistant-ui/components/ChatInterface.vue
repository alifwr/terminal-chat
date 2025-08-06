<!-- components/ChatInterface.vue -->
<template>
    <div class="h-full flex flex-col">
        <!-- Messages Area -->
        <div class="flex-1 overflow-auto space-y-3 mb-4">
            <div v-for="m in messages" :key="m.id" :class="[
                'flex',
                m.role === 'user' ? 'justify-end' : 'justify-start'
            ]">
                <!-- <div :class="[
                    'w-8 h-8 rounded flex-shrink-0 flex items-center justify-center text-xs font-semibold',
                    m.role === 'user'
                        ? 'bg-gray-700 text-gray-400 border border-gray-600'
                        : 'bg-gray-800 text-gray-500 border border-gray-700'
                ]">
                    {{ m.role === 'user' ? 'U' : 'AI' }}
                </div> -->

                <div :class="[
                    'max-w-xs p-3 rounded-lg text-sm',
                    m.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                ]">

                    <div v-for="(part, partIndex) in m.parts" :key="partIndex">
                        <div v-if="part.type === 'text'" class="mb-2 last:mb-0">{{ part.text }}</div>
                        <div v-if="part.type === 'tool-invocation'"
                            class="bg-gray-900 border border-gray-800 rounded p-3 my-2">
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

                    <!-- <div class="mb-1">{{ m.content }}</div> -->

                    <div :class="[
                        'text-xs',
                        m.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                    ]">
                        {{ getTimeStamp() }}
                        <!-- {{ formatTime(m.timestamp) }} -->
                    </div>

                </div>
            </div>

            <!-- Typing Indicator -->
            <div v-if="isTyping" class="flex justify-start">
                <div class="bg-gray-200 text-gray-800 p-3 rounded-lg rounded-bl-none">
                    <div class="flex space-x-1">
                        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s">
                        </div>
                        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Input Area -->
        <div class="border-t border-gray-200 pt-3">
            <form @submit.prevent="handleFormSubmit" class="flex space-x-2">
                <input v-model="input" type="text" placeholder="Type your message..."
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    :class="{ 'loading': status === 'streaming' }" autocomplete="off"
                    :disabled="status === 'streaming'" />
                <button type="submit" :disabled="!input.trim()"
                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm">
                    Send
                </button>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useChat } from '@ai-sdk/vue';
import { ref, nextTick, onMounted } from 'vue';

const modelConfig = useModelConfig();
const { sessionId } = useTerminalSession();

const { messages, input, status, handleSubmit } = useChat({ maxSteps: 5 });
const messagesContainer = ref<HTMLElement>();
const expandedToolInvocations = ref<Record<string, boolean>>({});

const isTyping = ref(false);

const scrollToBottom = () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
    });
};

onMounted(() => {
    scrollToBottom();
})

const handleFormSubmit = (e: Event) => {
    handleSubmit(e, {
        data: {
            sessionId: sessionId.value,
            apiKey: modelConfig.apiKey.value,
            baseUrl: modelConfig.baseUrl.value,
            model: modelConfig.modelName.value
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

<style>
.loading {
    background-image: linear-gradient(90deg, transparent 0%, #30363d 50%, transparent 100%);
    background-size: 200% 100%;
    animation: loading 1.5s ease-in-out infinite;
    pointer-events: none;
}
</style>