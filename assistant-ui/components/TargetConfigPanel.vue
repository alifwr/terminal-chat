<!-- components/TargetConfigPanel.vue -->
<template>
  <div class="space-y-4">
    <div class="bg-white rounded-lg p-4 border border-gray-200">
      <h4 class="font-semibold text-gray-800 mb-3">Target VM Configuration</h4>
      
      <div class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Target IP</label>
          <input type="text" value="10.10.11.12" class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">OS Type</label>
          <select class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option>Linux (Ubuntu)</option>
            <option>Windows Server</option>
            <option>CentOS</option>
            <option>Debian</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
          <select class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
            <option>Expert</option>
          </select>
        </div>

        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <input type="checkbox" id="vuln-web" checked class="rounded">
            <label for="vuln-web" class="text-sm text-gray-700">Web Vulnerabilities</label>
          </div>
          <div class="flex items-center space-x-2">
            <input type="checkbox" id="vuln-ssh" class="rounded">
            <label for="vuln-ssh" class="text-sm text-gray-700">SSH Vulnerabilities</label>
          </div>
          <div class="flex items-center space-x-2">
            <input type="checkbox" id="vuln-telnet" checked class="rounded">
            <label for="vuln-telnet" class="text-sm text-gray-700">Telnet Vulnerabilities</label>
          </div>
        </div>

        <button class="w-full bg-orange-600 text-white px-3 py-2 rounded text-sm hover:bg-orange-700">
          Apply Target Config
        </button>
      </div>
    </div>
  </div>
</template>