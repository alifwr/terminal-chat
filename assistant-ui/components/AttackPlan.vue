<!-- components/AttackPlan.vue -->
<template>
  <div class="h-full bg-white rounded-lg p-4">
    <h3 class="text-lg font-semibold mb-4">Attack Plan</h3>
    
    <div class="space-y-4">
      <div class="border border-gray-200 rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <h4 class="font-medium">Phase 1: Reconnaissance</h4>
          <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Complete</span>
        </div>
        <ul class="text-sm text-gray-600 space-y-1">
          <li>✓ Network discovery and port scanning</li>
          <li>✓ Service enumeration and banner grabbing</li>
          <li>✓ Operating system fingerprinting</li>
        </ul>
      </div>

      <div class="border border-gray-200 rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <h4 class="font-medium">Phase 2: Vulnerability Assessment</h4>
          <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">In Progress</span>
        </div>
        <ul class="text-sm text-gray-600 space-y-1">
          <li>⚡ Telnet brute force attack</li>
          <li>⏳ Web application vulnerability scan</li>
          <li>⏳ SSH key enumeration</li>
        </ul>
      </div>

      <div class="border border-gray-200 rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <h4 class="font-medium">Phase 3: Exploitation</h4>
          <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">Pending</span>
        </div>
        <ul class="text-sm text-gray-600 space-y-1">
          <li>○ Execute remote code exploitation</li>
          <li>○ Establish persistent access</li>
          <li>○ Privilege escalation</li>
        </ul>
      </div>

      <div class="border border-gray-200 rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <h4 class="font-medium">Phase 4: Post-Exploitation</h4>
          <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">Pending</span>
        </div>
        <ul class="text-sm text-gray-600 space-y-1">
          <li>○ Data exfiltration</li>
          <li>○ Lateral movement</li>
          <li>○ Evidence cleanup</li>
        </ul>
      </div>
    </div>
  </div>
</template>