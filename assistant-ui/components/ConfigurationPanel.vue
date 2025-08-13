<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps({
    modelConfig: {
        type: Object,
        default: {},
        required: true
    }
})

// Configuration tabs
const configTabs = [
    { id: 'model', name: 'Model', color: 'orange' },
    { id: 'agent', name: 'Agent', color: 'orange' },
    { id: 'target', name: 'Target', color: 'orange' }
]

const emitModelConfig = defineEmits(['update:modelConfig']);

// Accordion state
const isExpanded = ref(true)

// Tab state
const activeConfigTab = ref('model')

// Model Configuration State
const baseUrl = ref(props.modelConfig.baseUrl);
const modelName = ref(props.modelConfig.modelName);
const apiKey = ref(props.modelConfig.apiKey);
const showApiKey = ref(false);

// Target Configuration State
const availableTargets = ref<any[]>([]);
const runningTargets = ref<any[]>([]);
const selectedTarget = ref('');
const isLoading = ref(false);

onMounted(async () => {
    const storedConfig = localStorage.getItem('model-config');
    const modelConfig = storedConfig ? JSON.parse(storedConfig) : {};
    emitModelConfig("update:modelConfig", modelConfig);
    baseUrl.value = modelConfig.baseUrl;
    modelName.value = modelConfig.modelName;
    apiKey.value = modelConfig.apiKey;

    await getContainers();
    await getBenchmarks();
})

const saveModelConfig = async () => {
    localStorage.setItem('model-config', JSON.stringify({
        modelName: modelName.value,
        baseUrl: baseUrl.value,
        apiKey: apiKey.value
    }));
    emitModelConfig("update:modelConfig", {
        modelName: modelName.value,
        baseUrl: baseUrl.value,
        apiKey: apiKey.value
    });
}

const getBenchmarks = async () => {
    const response = await $fetch('/api/target/benchmarks');
    if (response && 'success' in response && response.success && Array.isArray(response.data)) {
        availableTargets.value = response.data;
    } else {
        availableTargets.value = [];
        console.error('Failed to fetch containers:', 'message' in response ? response.message : response);
    }
    console.log(response);
}

const getContainers = async () => {
    const response = await $fetch('/api/target/containers');
    if (response && 'success' in response && response.success && Array.isArray(response.data)) {
        runningTargets.value = response.data;
    } else {
        runningTargets.value = [];
        console.error('Failed to fetch containers:', 'message' in response ? response.message : response);
    }
    console.log(response);
}

const turnOnTarget = async () => {
    isLoading.value = true;
    const response = await $fetch(`/api/target/${selectedTarget.value}/turn-on`);
    console.log(response);
    await getContainers();
    await getBenchmarks();
    isLoading.value = false;
}

const turnOffTarget = async () => {
    isLoading.value = true;
    const targetName = runningTargets.value[0].name.slice(0, 11).toUpperCase();
    const response = await $fetch(`/api/target/${targetName}/turn-off`);
    console.log(response);
    await getContainers();
    await getBenchmarks();
    isLoading.value = false;
}
</script>

<template>
    <div class="flex flex-col bg-white dark:bg-gray-800">
        <!-- Header with Toggle -->
        <div class="border-t border-gray-200 dark:border-gray-700">
            <button @click="isExpanded = !isExpanded"
                class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700">
                <div class="flex items-center space-x-3">
                    <div class="w-3 h-3 bg-orange-400 rounded-full"></div>
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                        Configuration
                    </h2>
                </div>
                <svg class="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200"
                    :class="{ 'rotate-180': isExpanded }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
        </div>

        <!-- Collapsible Content -->
        <div v-show="isExpanded" class="border-t border-gray-200 dark:border-gray-700 transition-all duration-200">
            <!-- Config Tab Headers -->
            <div class="flex bg-gray-50 dark:bg-gray-700">
                <button v-for="tab in configTabs" :key="tab.id" @click="activeConfigTab = tab.id" :class="[
                    'flex-1 px-3 py-2 text-xs font-medium border-r border-gray-200 dark:border-gray-600 last:border-r-0 transition-colors',
                    activeConfigTab === tab.id
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-b-2 border-orange-500'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
                ]">
                    {{ tab.name }}
                </button>
            </div>

            <!-- Config Content -->
            <div class="overflow-auto h-80">
                <!-- Model Configuration -->
                <div v-if="activeConfigTab === 'model'" class="p-4 space-y-4">
                    <div class="space-y-3">
                        <h3 class="text-sm font-medium text-gray-900 dark:text-white">AI Model Configuration</h3>

                        <div class="space-y-2">
                            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Provider Base
                                URL</label>
                            <input v-model="baseUrl" type="url" placeholder="https://api.openai.com/v1"
                                class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                            <p class="text-xs text-gray-500 dark:text-gray-400">API endpoint URL for your model provider
                            </p>
                        </div>

                        <div class="space-y-2">
                            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Model Name</label>
                            <input v-model="modelName" type="text" placeholder="gpt-4o-mini"
                                class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                            <p class="text-xs text-gray-500 dark:text-gray-400">Specific model identifier (e.g.,
                                gpt-4o-mini, claude-3-haiku-20240307)</p>
                        </div>

                        <div class="space-y-2">
                            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">API Key</label>
                            <div class="relative">
                                <input v-model="apiKey" :type="showApiKey ? 'text' : 'password'" placeholder="sk-..."
                                    class="w-full px-3 py-2 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                                <button @click="showApiKey = !showApiKey" type="button"
                                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    <svg v-if="!showApiKey" class="w-4 h-4" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z">
                                        </path>
                                    </svg>
                                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21">
                                        </path>
                                    </svg>
                                </button>
                            </div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Your provider's API authentication key
                            </p>
                        </div>

                        <div class="pt-2 border-t border-gray-200 dark:border-gray-600">
                            <button @click="saveModelConfig"
                                class="w-full px-3 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
                                Save Configuration
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Agent Configuration -->
                <div v-else-if="activeConfigTab === 'agent'" class="p-4 space-y-4">
                    <div class="space-y-3">
                        <h3 class="text-sm font-medium text-gray-900 dark:text-white">Agent Behavior</h3>

                        <div class="space-y-2">
                            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Agent Type</label>
                            <select
                                class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                                <option>Penetration Tester</option>
                                <option>Security Analyst</option>
                                <option>General Assistant</option>
                                <option>Code Reviewer</option>
                            </select>
                        </div>

                        <div class="space-y-2">
                            <label class="flex items-center space-x-2">
                                <input type="checkbox" checked
                                    class="rounded border-gray-300 dark:border-gray-600 text-orange-600 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50">
                                <span class="text-xs text-gray-700 dark:text-gray-300">Enable tool usage</span>
                            </label>
                        </div>

                        <div class="space-y-2">
                            <label class="flex items-center space-x-2">
                                <input type="checkbox"
                                    class="rounded border-gray-300 dark:border-gray-600 text-orange-600 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50">
                                <span class="text-xs text-gray-700 dark:text-gray-300">Verbose mode</span>
                            </label>
                        </div>

                        <div class="space-y-2">
                            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">System
                                Prompt</label>
                            <textarea rows="3" placeholder="Custom instructions for the agent..."
                                class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"></textarea>
                        </div>
                    </div>
                </div>

                <!-- Target VM Configuration -->
                <div v-else-if="activeConfigTab === 'target'" class="p-4 space-y-4">
                    <div class="space-y-3">
                        <h3 class="text-sm font-medium text-gray-900 dark:text-white">Target Environment</h3>

                        <div v-if="runningTargets.length > 0" class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead class="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col"
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th scope="col"
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Ports
                                        </th>
                                        <th scope="col"
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    <tr v-for="target in runningTargets" :key="target.id">
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {{ target.name }}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            <ul>
                                                <li v-for="(dockerPort, hostPort) in target.ports" :key="hostPort">
                                                    {{ hostPort }} → {{ dockerPort }}
                                                </li>
                                            </ul>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {{ target.status }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div v-else class="space-y-2">
                            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Available Target
                                Machine</label>
                            <select v-model="selectedTarget"
                                class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                                <option v-for="(target, index) in availableTargets" :key="index">{{ target.name }}
                                </option>
                            </select>
                        </div>

                        <div class="pt-2">
                            <button v-if="selectedTarget && runningTargets.length == 0" @click="turnOnTarget"
                                class="w-full px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                                :disabled="isLoading">
                                <span v-if="isLoading"
                                    class="loader inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                <span v-else>Turn On</span>
                            </button>

                            <button v-if="runningTargets.length > 0" @click="turnOffTarget"
                                class="w-full px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                                :disabled="isLoading">
                                <span v-if="isLoading"
                                    class="loader inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                <span v-else>Turn Off</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.loader {
    display: inline-block;
    border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: white;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
