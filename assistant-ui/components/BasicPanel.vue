<!-- components/BasicPanel.vue -->
<template>
  <div class="space-y-4">
    <div class="bg-purple-50 border border-purple-200 rounded-lg p-3">
      <h4 class="font-semibold text-purple-800 mb-2">Basic Tools</h4>
      <div class="grid grid-cols-2 gap-2 text-sm">
        <button class="bg-white border border-purple-200 px-2 py-1 rounded hover:bg-purple-50">
          Nmap
        </button>
        <button class="bg-white border border-purple-200 px-2 py-1 rounded hover:bg-purple-50">
          Hydra
        </button>
        <button class="bg-white border border-purple-200 px-2 py-1 rounded hover:bg-purple-50">
          Metasploit
        </button>
        <button class="bg-white border border-purple-200 px-2 py-1 rounded hover:bg-purple-50">
          Burp Suite
        </button>
      </div>
    </div>

    <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <h4 class="font-semibold text-gray-800 mb-2">Quick Commands</h4>
      <div class="space-y-2 text-xs font-mono">
        <div class="bg-gray-800 text-green-400 p-2 rounded">
          nmap -sV 10.10.11.12
        </div>
        <div class="bg-gray-800 text-green-400 p-2 rounded">
          hydra -L users.txt -P pass.txt telnet://10.10.11.12
        </div>
        <div class="bg-gray-800 text-green-400 p-2 rounded">
          curl -I http://10.10.11.12
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <button class="w-full bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700">
        Run Command
      </button>
      <button class="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700">
        Clear Terminal
      </button>
    </div>
  </div>
</template>