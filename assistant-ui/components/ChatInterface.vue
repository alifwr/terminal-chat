<!-- components/ChatInterface.vue -->
<template>
    <div class="h-full flex flex-col">
        <!-- Messages Area -->
        <div ref="messagesContainer" class="flex-1 overflow-auto space-y-3 mb-4" @scroll="handleScroll">
            <!-- Connection Status -->
            <div v-if="!isOnline" class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded mb-3">
                <div class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm">No internet connection. Messages will be sent when connection is restored.</span>
                </div>
            </div>

            <!-- Enhanced Error Display -->
            <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="flex items-center">
                            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                            <span class="text-sm font-medium">Error</span>
                        </div>
                        <p class="text-sm mt-1">{{ error.message || 'An error occurred' }}</p>
                        <div class="mt-2">
                            <button @click="retryLastMessage" 
                                class="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 mr-2">
                                Retry
                            </button>
                            <button @click="clearError" 
                                class="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700">
                                Dismiss
                            </button>
                        </div>
                    </div>
                    <button @click="clearError" class="text-red-500 hover:text-red-700 ml-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                        </svg>
                    </button>
                </div>
            </div>
            
            <!-- Virtual scrolling optimization for many messages -->
            <div v-for="m in visibleMessages" :key="m.id" :class="getMessageContainerClasses(m.role)">
                <div :class="getMessageClasses(m.role, m.isError)">

                    <div v-for="(part, partIndex) in m.parts" :key="partIndex">
                        <div v-if="part.type === 'text'" class="mb-2 last:mb-0" 
                             :class="{ 'text-red-700': m.isError }">{{ part.text }}</div>
                        <div v-if="part.type === 'tool-invocation'"
                            class="bg-gray-100 border border-gray-200 rounded p-3 my-2">
                            <div class="flex justify-between items-center cursor-pointer select-none"
                                @click="toggleToolInvocation(m.id, partIndex)">
                                <div class="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Process
                                </div>
                                <div class="text-xs text-gray-500 transition-colors hover:text-gray-200">
                                    {{ expandedToolInvocations[`${m.id}-${partIndex}`] ? '▼' : '▶' }}
                                </div>
                            </div>
                            <pre v-if="expandedToolInvocations[`${m.id}-${partIndex}`]"
                                class="text-xs whitespace-pre-wrap break-words font-mono">{{ JSON.stringify(part.toolInvocation, null, 2) }}</pre>
                        </div>
                    </div>

                    <div :class="getTimestampClasses(m.role)">
                        {{ m.createdAt ? formatTime(m.createdAt) : getTimeStamp() }}
                        <!-- {{ formatTime(m.timestamp) }} -->
                    </div>

                </div>
            </div>
            
            <!-- Enhanced Loading indicator for non-streaming -->
            <div v-if="status === 'loading'" class="flex justify-start">
                <div class="max-w-xs p-3 rounded-lg text-sm bg-gray-200 text-gray-800 rounded-bl-none">
                    <div class="flex items-center space-x-2">
                        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        <span class="text-xs text-gray-500">Processing request...</span>
                    </div>
                    <div class="mt-2 text-xs text-gray-400">
                        This may take a few moments for complex requests
                    </div>
                    <div class="mt-1 bg-gray-300 rounded-full h-1">
                        <div class="bg-blue-600 h-1 rounded-full animate-pulse" style="width: 60%"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Input Area -->
        <div class="border-t border-gray-200 pt-3">
            <form @submit.prevent="handleFormSubmit" class="flex space-x-2">
                <input v-model="input" type="text" placeholder="Type your message..."
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    :class="{ 'bg-gradient-loading bg-size-200 animate-pulse-bg': status === 'loading' }"
                    autocomplete="off" :disabled="status === 'loading'" />
                <button v-if="status === 'loading'" type="button" @click="stop()"
                    class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6,6H18V18H6V6Z" />
                    </svg>
                </button>
                <button v-else type="submit" :disabled="!input.trim()"
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
import { ref, nextTick, onMounted, onUnmounted, computed, watch } from 'vue';

const {
    modelName,
    baseUrl,
    apiKey,
    temperature,
    maxTokens,
} = useModelConfig();
const { sessionId } = useTerminalSession();

// Use manual state management instead of useChat for non-streaming
const messages = ref<any[]>([]);
const input = ref('');
const status = ref<'ready' | 'loading' | 'error'>('ready');
const error = ref<Error | null>(null);

const stop = () => {
    // For non-streaming, we can't really stop mid-request
    console.log('Stop called (not applicable for non-streaming)');
};

// Enhanced error handling
const handleError = (error: any, context: string) => {
    console.error(`Error in ${context}:`, error);
    
    let errorMessage = 'An unexpected error occurred';
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Network connection failed. Please check your internet connection.';
    } else if (error instanceof Error) {
        if (error.message.includes('HTTP error! status: 401')) {
            errorMessage = 'Authentication failed. Please check your API key.';
        } else if (error.message.includes('HTTP error! status: 403')) {
            errorMessage = 'Access forbidden. Please check your API permissions.';
        } else if (error.message.includes('HTTP error! status: 404')) {
            errorMessage = 'API endpoint not found. Please check your configuration.';
        } else if (error.message.includes('HTTP error! status: 429')) {
            errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
        } else if (error.message.includes('HTTP error! status: 500')) {
            errorMessage = 'Server error occurred. Please try again later.';
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Request timed out. The server took too long to respond.';
        } else if (error.message.includes('JSON')) {
            errorMessage = 'Invalid response format received from server.';
        } else {
            errorMessage = error.message || errorMessage;
        }
    }
    
    error.value = new Error(errorMessage);
    status.value = 'error';
    
    // Add error message to chat
    const errorMsg = {
        id: Date.now().toString(),
        role: 'system',
        content: `Error: ${errorMessage}`,
        parts: [{ type: 'text', text: `❌ Error: ${errorMessage}` }],
        createdAt: new Date(),
        isError: true
    };
    messages.value.push(errorMsg);
};

// Manual handleSubmit for non-streaming
const handleSubmit = async (userMessage: string) => {
    if (!userMessage.trim()) return;
    
    // Add user message
    const userMsg = {
        id: Date.now().toString(),
        role: 'user',
        content: userMessage,
        parts: [{ type: 'text', text: userMessage }],
        createdAt: new Date()
    };
    messages.value.push(userMsg);
    
    status.value = 'loading';
    error.value = null;
    
    // Validate required configuration
    if (!apiKey.value && !sessionId.value) {
        handleError(new Error('API key or session ID is required'), 'configuration validation');
        return;
    }
    
    if (!modelName.value) {
        handleError(new Error('Model name is required'), 'configuration validation');
        return;
    }
    
    let timeoutId: NodeJS.Timeout | null = null;
    const controller = new AbortController();
    
    try {
        // Set up request timeout
        timeoutId = setTimeout(() => {
            controller.abort();
        }, 600000); // 5 minutes
        
        const requestBody = {
            messages: messages.value
                .filter(m => m.role !== 'system' || !m.isError) // Exclude error messages
                .map(m => ({ role: m.role, content: m.content })),
            data: {
                sessionId: sessionId.value,
                apiKey: apiKey.value,
                baseUrl: baseUrl.value,
                model: modelName.value,
                temperature: temperature.value,
                maxTokens: maxTokens.value
            }
        };
        
        console.log('Sending request:', { 
            messageCount: requestBody.messages.length,
            model: requestBody.data.model 
        });
        
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });
        
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { message: errorText };
            }
            
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || errorText}`);
        }
        
        const result = await response.json();
        
        // Validate response format
        if (!result.message) {
            throw new Error('Invalid response: missing message field');
        }
        
        // Add assistant response
        const assistantMsg = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: result.message,
            parts: [{ type: 'text', text: result.message }],
            createdAt: new Date()
        };
        messages.value.push(assistantMsg);
        
        console.log('Response received:', {
            finishReason: result.finishReason,
            steps: result.steps,
            usage: result.usage,
            messageLength: result.message.length
        });
        
    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            handleError(new Error('Request was cancelled or timed out'), 'request timeout');
        } else {
            handleError(err, 'API request');
        }
        return;
    } finally {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    }
    
    status.value = 'ready';
};
const messagesContainer = ref<HTMLElement>();
const expandedToolInvocations = ref<Record<string, boolean>>({});
let streamingTimeout: NodeJS.Timeout | null = null;

// Virtual scrolling for performance with many messages
const maxVisibleMessages = ref(50);
const visibleMessages = computed(() => {
    if (messages.value.length <= maxVisibleMessages.value) {
        return messages.value;
    }
    // Show the last N messages for better performance
    return messages.value.slice(-maxVisibleMessages.value);
});

// Auto-scroll detection to prevent unnecessary scrolling
const isUserScrolledUp = ref(false);

const handleScroll = () => {
    if (messagesContainer.value) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
        isUserScrolledUp.value = !isAtBottom;
    }
};

const clearStreamingTimeout = () => {
    if (streamingTimeout) {
        clearTimeout(streamingTimeout);
        streamingTimeout = null;
    }
};

const scrollToBottom = () => {
    // Only auto-scroll if user hasn't scrolled up manually
    if (!isUserScrolledUp.value) {
        nextTick(() => {
            if (messagesContainer.value) {
                messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
            }
        });
    }
};

// Simple debounce function for better performance
const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
};

// Debounced scroll function for better performance
const debouncedScrollToBottom = debounce(scrollToBottom, 100);

watch(status, (newStatus, oldStatus) => {
    console.log("STATUS: ", newStatus);
    if (newStatus === 'loading') {
        debouncedScrollToBottom();
        // Set a timeout to prevent hanging requests
        clearStreamingTimeout();
        streamingTimeout = setTimeout(() => {
            console.warn('Request timeout reached');
            status.value = 'error';
            error.value = new Error('Request timeout');
        }, 300000); // 5 minutes
    } else if (oldStatus === 'loading') {
        clearStreamingTimeout();
        // Force scroll to bottom when request completes
        isUserScrolledUp.value = false;
        scrollToBottom();
    }
});

// Optimized message watching with debounce
watch(messages, (newMessages) => {
    console.log('Messages updated:', newMessages.length);
    if (newMessages.length > 0) {
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage) {
            console.log('Last message:', { 
                role: lastMessage.role, 
                partsCount: lastMessage.parts?.length,
                status: status.value
            });
        }
    }
    debouncedScrollToBottom();
}, { deep: true, flush: 'post' });

watch(error, () => {
    if (error.value) {
        console.error("Chat error:", error.value);
    }
});

const clearError = () => {
    error.value = null;
    status.value = 'ready';
    
    // Remove error messages from chat
    messages.value = messages.value.filter(m => !m.isError);
};

const retryLastMessage = () => {
    // Find the last user message and retry it
    const userMessages = messages.value.filter(m => m.role === 'user');
    if (userMessages.length > 0) {
        const lastUserMessage = userMessages[userMessages.length - 1];
        
        // Remove error messages and any assistant responses after the last user message
        const lastUserIndex = messages.value.findIndex(m => m.id === lastUserMessage.id);
        messages.value = messages.value.slice(0, lastUserIndex + 1);
        
        // Clear error and retry
        error.value = null;
        status.value = 'ready';
        
        // Retry the last message
        handleSubmit(lastUserMessage.content);
    }
};

// Connection status monitoring (browser only)
const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true);
const connectionError = ref(false);

// Monitor connection status
const updateOnlineStatus = () => {
    if (typeof navigator === 'undefined') return; // Server-side check
    
    const wasOnline = isOnline.value;
    isOnline.value = navigator.onLine;
    
    if (!wasOnline && isOnline.value) {
        console.log('Connection restored');
        connectionError.value = false;
    } else if (wasOnline && !isOnline.value) {
        console.log('Connection lost');
        connectionError.value = true;
        handleError(new Error('Internet connection lost. Please check your network.'), 'connection');
    }
};

// Global error boundary (browser only)
if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        handleError(event.error, 'global error');
    });

    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        handleError(event.reason, 'unhandled promise');
    });
}

onMounted(() => {
    scrollToBottom();
    
    // Add connection event listeners (browser only)
    if (typeof window !== 'undefined') {
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
    }
});

onUnmounted(() => {
    clearStreamingTimeout();
    
    // Remove connection event listeners (browser only)
    if (typeof window !== 'undefined') {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
    }
});

const handleFormSubmit = async (e: Event) => {
    e.preventDefault();
    if (!input.value.trim()) return;
    
    // Prevent double submission
    if (status.value === 'loading') {
        console.warn('Request already in progress');
        return;
    }
    
    try {
        const userMessage = input.value.trim();
        input.value = ''; // Clear input immediately
        
        // Basic validation
        if (userMessage.length > 10000) {
            handleError(new Error('Message too long. Please limit to 10,000 characters.'), 'message validation');
            return;
        }
        
        await handleSubmit(userMessage);
        scrollToBottom();
    } catch (error) {
        console.error('Form submit error:', error);
        handleError(error, 'form submission');
        
        // Restore input if there was an error
        if (!input.value) {
            // We can't restore the exact input since it was cleared, but we can show an error
            handleError(new Error('Failed to send message. Please try again.'), 'form submission');
        }
    }
};

const getTimeStamp = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Memoize message style classes for better performance
const getMessageClasses = (role: string, isError = false) => {
    const baseClasses = ['max-w-xs p-3 rounded-lg text-sm'];
    
    if (isError) {
        baseClasses.push('bg-red-100 text-red-800 border border-red-200');
    } else if (role === 'user') {
        baseClasses.push('bg-blue-600 text-white rounded-br-none');
    } else {
        baseClasses.push('bg-gray-200 text-gray-800 rounded-bl-none');
    }
    
    return baseClasses;
};

const getMessageContainerClasses = (role: string) => {
    return [
        'flex',
        role === 'user' ? 'justify-end' : 'justify-start'
    ];
};

const getTimestampClasses = (role: string) => {
    return [
        'text-xs',
        role === 'user' ? 'text-blue-200' : 'text-gray-500'
    ];
};

// Optimized toggle function with better performance
const toggleToolInvocation = (messageId: string, partIndex: number) => {
    const key = `${messageId}-${partIndex}`;
    expandedToolInvocations.value = {
        ...expandedToolInvocations.value,
        [key]: !expandedToolInvocations.value[key]
    };
};
</script>