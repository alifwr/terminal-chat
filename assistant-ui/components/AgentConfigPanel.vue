<!-- components/AgentConfigPanel.vue -->
<template>
  <div class="space-y-4">
    <div class="bg-white rounded-lg p-4 border border-gray-200">
      <h4 class="font-semibold text-gray-800 mb-3">Agent Settings</h4>
      
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Agent Role</label>
          <select class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option>Penetration Tester</option>
            <option>Security Analyst</option>
            <option>Incident Responder</option>
            <option>Forensics Analyst</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
          <select class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
            <option>Expert</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Risk Tolerance</label>
          <select class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option>Conservative</option>
            <option>Moderate</option>
            <option>Aggressive</option>
          </select>
        </div>

        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <input type="checkbox" id="verbose" checked class="rounded">
            <label for="verbose" class="text-sm text-gray-700">Verbose Explanations</label>
          </div>
          <div class="flex items-center space-x-2">
            <input type="checkbox" id="safety" checked class="rounded">
            <label for="safety" class="text-sm text-gray-700">Safety Checks</label>
          </div>
          <div class="flex items-center space-x-2">
            <input type="checkbox" id="auto" class="rounded">
            <label for="auto" class="text-sm text-gray-700">Auto-execute Commands</label>
          </div>
        </div>

        <button class="w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700">
          Update Agent
        </button>
      </div>
    </div>
  </div>
</template>