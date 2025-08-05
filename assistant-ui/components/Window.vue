<!-- components/Window.vue -->
<template>
  <div
    class="absolute bg-white rounded-lg shadow-2xl border border-gray-300 min-w-64 min-h-48"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
    @mousedown="startDrag"
  >
    <!-- Window Header -->
    <div class="bg-gray-100 px-4 py-2 rounded-t-lg border-b border-gray-200 flex items-center justify-between cursor-move">
      <div class="flex items-center space-x-2">
        <div class="flex space-x-1">
          <div class="w-3 h-3 bg-red-500 rounded-full"></div>
          <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div class="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <span class="text-sm font-medium text-gray-700">{{ title }}</span>
      </div>
      <button
        @click="$emit('close')"
        class="text-gray-500 hover:text-gray-700"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
        </svg>
      </button>
    </div>

    <!-- Window Content -->
    <div class="p-4">
      <!-- File Manager -->
      <div v-if="type === 'filemanager'" class="space-y-2">
        <div class="flex items-center space-x-2 text-sm">
          <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
          </svg>
          <span>Documents</span>
        </div>
        <div class="flex items-center space-x-2 text-sm">
          <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
          </svg>
          <span>Downloads</span>
        </div>
        <div class="flex items-center space-x-2 text-sm">
          <svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4z"/>
          </svg>
          <span>exploit.py</span>
        </div>
      </div>

      <!-- Terminal -->
      <div v-else-if="type === 'terminal'" class="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs">
        <div>root@kali:~# ls -la</div>
        <div>total 24</div>
        <div>drwxr-xr-x 2 root root 4096 Jan 15 14:20 .</div>
        <div>drwxr-xr-x 3 root root 4096 Jan 15 14:19 ..</div>
        <div>-rw-r--r-- 1 root root 1337 Jan 15 14:20 exploit.py</div>
        <div class="mt-2">root@kali:~# <span class="animate-pulse">█</span></div>
      </div>

      <!-- Network Monitor -->
      <div v-else-if="type === 'monitor'" class="space-y-2">
        <div class="text-sm font-semibold">Network Traffic</div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="bg-blue-100 p-2 rounded">
            <div class="font-semibold text-blue-800">HTTP</div>
            <div class="text-blue-600">15 packets</div>
          </div>
          <div class="bg-green-100 p-2 rounded">
            <div class="font-semibold text-green-800">SSH</div>
            <div class="text-green-600">8 packets</div>
          </div>
          <div class="bg-red-100 p-2 rounded">
            <div class="font-semibold text-red-800">Telnet</div>
            <div class="text-red-600">3 packets</div>
          </div>
          <div class="bg-purple-100 p-2 rounded">
            <div class="font-semibold text-purple-800">Other</div>
            <div class="text-purple-600">12 packets</div>
          </div>
        </div>
      </div>

      <!-- System Info -->
      <div v-else-if="type === 'system'" class="space-y-2 text-sm">
        <div><strong>OS:</strong> Ubuntu 20.04 LTS</div>
        <div><strong>Kernel:</strong> 5.4.0-74-generic</div>
        <div><strong>CPU:</strong> Intel Core i5-9400</div>
        <div><strong>Memory:</strong> 4GB RAM</div>
        <div><strong>Uptime:</strong> 2 days, 14:22</div>
      </div>

      <!-- Logs -->
      <div v-else-if="type === 'logs'" class="bg-gray-100 p-3 rounded font-mono text-xs">
        <div>[2024-01-15 14:20:15] SSH connection from 10.10.11.100</div>
        <div>[2024-01-15 14:20:22] Failed login attempt for user 'admin'</div>
        <div>[2024-01-15 14:20:28] HTTP GET /admin from 10.10.11.100</div>
        <div>[2024-01-15 14:20:35] Telnet connection attempt</div>
      </div>

      <!-- Default Content -->
      <div v-else class="text-gray-500 text-center py-8">
        <div class="text-4xl mb-2">📄</div>
        <div>{{ title }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'default'
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  }
})

const emit = defineEmits(['close'])

const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

const startDrag = (e) => {
  // Simple drag functionality could be implemented here
  // For this demo, we'll keep windows in their fixed positions
}
</script>

<style scoped>
.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>