<!-- components/AgentPanel.vue -->
<template>
  <div class="space-y-4">
    <div class="bg-orange-50 border border-orange-200 rounded-lg p-3">
      <h4 class="font-semibold text-orange-800 mb-2">AI Agent Status</h4>
      <div class="space-y-1 text-sm">
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Agent Online</span>
        </div>
        <div class="text-orange-700">
          Current Task: Analyzing scan results
        </div>
        <div class="text-orange-700">
          Confidence: 87%
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <button class="w-full bg-orange-600 text-white px-3 py-2 rounded text-sm hover:bg-orange-700">
        Request Analysis
      </button>
      <button class="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
        Generate Report
      </button>
      <button class="w-full bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700">
        Stop Agent
      </button>
    </div>

    <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <h4 class="font-semibold text-gray-800 mb-2">Agent Insights</h4>
      <ul class="text-sm text-gray-600 space-y-1">
        <li>• Telnet service appears vulnerable</li>
        <li>• HTTP server may have directory traversal</li>
        <li>• SSH version is up to date</li>
        <li>• Consider brute force attack on port 23</li>
      </ul>
    </div>
  </div>
</template>