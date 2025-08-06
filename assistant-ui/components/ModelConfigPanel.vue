<!-- components/ModelConfigPanel.vue -->
<template>
  <div class="space-y-4">
    <div class="bg-white rounded-lg p-4 border border-gray-200">
      <h4 class="font-semibold text-gray-800 mb-3">Model Configurations</h4>

      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
          <input v-if="!isLoading" v-model="baseUrl" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
          <input v-else value="" disabled type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"></input>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">API Key</label>
          <input v-if="!isLoading" v-model="apiKey" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
          <input v-else value="" disabled type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"></input>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
          <select v-if="!isLoading" v-model="modelName" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option value="aliframadhan/Qwen3-8B-Tool-Calling">aliframadhan/Qwen3-8B-Tool-Calling</option>
          </select>
          <select v-else disabled class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
          <input v-if="!isLoading" v-model="temperature" type="range" min="0" max="1" step="0.1" class="w-full">
          <input v-else value="0" type="range" min="0" max="1" step="0.1" class="w-full">
          <div v-if="!isLoading" class="text-xs text-gray-500 mt-1">Current: {{ temperature }}</div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
          <input v-if="!isLoading" v-model="maxTokens" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
          <input v-else value="" disabled type="number" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"></input>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const {
  isLoading,
  modelName,
  baseUrl,
  apiKey,
  temperature,
  maxTokens,
  initializeConfig
} = useModelConfig();

onMounted(() => {
  initializeConfig();
});
</script>