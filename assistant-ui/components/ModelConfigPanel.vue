<!-- components/ModelConfigPanel.vue -->
<template>
  <div class="space-y-4">
    <div class="bg-white rounded-lg p-4 border border-gray-200">
      <h4 class="font-semibold text-gray-800 mb-3">Model Configurations</h4>
      
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Model Type</label>
          <select class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option>GPT-4 Turbo</option>
            <option>Claude 3.5 Sonnet</option>
            <option>Gemini Pro</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
          <input type="range" min="0" max="1" step="0.1" value="0.7" class="w-full">
          <div class="text-xs text-gray-500 mt-1">Current: 0.7</div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
          <input type="number" value="2048" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
        </div>

        <div class="flex items-center space-x-2">
          <input type="checkbox" id="streaming" checked class="rounded">
          <label for="streaming" class="text-sm text-gray-700">Enable Streaming</label>
        </div>

        <button class="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
          Apply Configuration
        </button>
      </div>
    </div>
  </div>
</template>