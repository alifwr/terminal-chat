<template>
  <div class="space-y-4">
    <div class="bg-green-50 border border-green-200 rounded-lg p-3">
      <h4 class="font-semibold text-green-800 mb-2">Student Progress</h4>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span>Reconnaissance</span>
          <span class="text-green-600">85%</span>
        </div>
        <div class="flex justify-between">
          <span>Vulnerability Assessment</span>
          <span class="text-yellow-600">60%</span>
        </div>
        <div class="flex justify-between">
          <span>Exploitation</span>
          <span class="text-red-600">25%</span>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <button class="w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700">
        Provide Hint
      </button>
      <button class="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
        Show Solution
      </button>
      <button class="w-full bg-orange-600 text-white px-3 py-2 rounded text-sm hover:bg-orange-700">
        Grade Assignment
      </button>
    </div>

    <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <h4 class="font-semibold text-gray-800 mb-2">Learning Objectives</h4>
      <ul class="text-sm text-gray-600 space-y-1">
        <li>✓ Understand port scanning techniques</li>
        <li>✓ Identify vulnerable services</li>
        <li>⏳ Execute exploitation attacks</li>
        <li>○ Implement post-exploitation techniques</li>
      </ul>
    </div>
  </div>
</template>