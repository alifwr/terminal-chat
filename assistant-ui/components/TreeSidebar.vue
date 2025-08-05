<!-- components/TreeSidebar.vue -->
<template>
  <div class="h-full flex flex-col">
    <!-- Header Tabs -->
    <div class="flex bg-gray-50 border-b">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'px-4 py-2 text-sm font-medium border-r border-gray-200 last:border-r-0',
          activeTab === tab.id
            ? 'bg-white text-gray-900 border-b-2 border-blue-500'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        ]"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-auto p-4">
      <div v-if="activeTab === 'tree'" class="space-y-2">
        <!-- Network Scan Results -->
        <div class="font-mono text-sm">
          <div class="text-blue-600 font-semibold mb-2">10.10.11.12</div>
          
          <!-- Ports Section -->
          <div class="ml-2 space-y-1">
            <div class="text-gray-700">├─ ports</div>
            
            <!-- Port 22 -->
            <div class="ml-4 space-y-1">
              <div class="text-gray-600">├── index: 0</div>
              <div class="text-gray-600">├── number: 22</div>
              <div class="text-gray-600">├── service: ssh</div>
              <div class="text-gray-600">└── details: 8.5p1</div>
            </div>
            
            <!-- Port 23 -->
            <div class="ml-4 space-y-1 mt-2">
              <div class="text-gray-600">├── index: 1</div>
              <div class="text-gray-600">├── number: 23</div>
              <div class="text-gray-600">├── service: telnetd</div>
              <div class="text-gray-600">└── details: "tcp, Linux telnetd"</div>
            </div>
            
            <!-- Port 80 -->
            <div class="ml-4 space-y-1 mt-2">
              <div class="text-gray-600">├── index: 2</div>
              <div class="text-gray-600">├── number: 80</div>
              <div class="text-gray-600">├── service: apache http</div>
              <div class="text-gray-600">└── details: 2.4.59</div>
            </div>
          </div>

          <!-- Additional Sections -->
          <div class="ml-2 mt-3 space-y-1">
            <div class="text-gray-700">├─ flags: []</div>
            <div class="text-gray-700">├─ vulnerabilities: []</div>
            <div class="text-gray-700">└─ credentials:</div>
            
            <div class="ml-4 space-y-1">
              <div class="text-gray-600">├── index: 0</div>
              <div class="text-gray-600">├── user: admin</div>
              <div class="text-gray-600">├── pass: null</div>
              <div class="text-gray-600">└── requirepass: false</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes tab content -->
      <div v-else-if="activeTab === 'notes1'" class="space-y-4">
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <h4 class="font-semibold text-yellow-800 mb-2">Reconnaissance Notes</h4>
          <p class="text-sm text-yellow-700">Initial scan reveals SSH, Telnet, and HTTP services running.</p>
        </div>
        
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 class="font-semibold text-blue-800 mb-2">Exploitation Notes</h4>
          <p class="text-sm text-blue-700">Telnet service may be vulnerable to brute force attacks.</p>
        </div>
      </div>

      <!-- Notes tab 2 content -->
      <div v-else-if="activeTab === 'notes2'" class="space-y-4">
        <div class="bg-green-50 border border-green-200 rounded-lg p-3">
          <h4 class="font-semibold text-green-800 mb-2">Success Notes</h4>
          <p class="text-sm text-green-700">Successfully enumerated services and potential attack vectors.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('tree')

const tabs = [
  { id: 'tree', name: 'Tree' },
  { id: 'notes1', name: 'Notes', color: 'purple' },
  { id: 'notes2', name: 'Notes', color: 'green' }
]
</script>

<style scoped>
.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>