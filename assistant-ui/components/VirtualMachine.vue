<!-- components/VirtualMachine.vue -->
<template>
  <div class="h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg overflow-hidden relative">
    <!-- VM Desktop Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600">
      <!-- Taskbar -->
      <div class="absolute bottom-0 left-0 right-0 h-12 bg-gray-800 bg-opacity-90 backdrop-blur">
        <div class="flex items-center justify-between h-full px-4">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
            </div>
            <span class="text-white text-sm">{{ title }}</span>
          </div>
          <div class="text-white text-sm">
            {{ currentTime }}
          </div>
        </div>
      </div>

      <!-- Desktop Icons -->
      <div class="absolute top-4 left-4 space-y-4">
        <div class="flex flex-col items-center space-y-1 w-16 cursor-pointer hover:bg-white hover:bg-opacity-20 rounded p-2">
          <div class="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
            </svg>
          </div>
          <span class="text-white text-xs text-center">Files</span>
        </div>
        
        <div class="flex flex-col items-center space-y-1 w-16 cursor-pointer hover:bg-white hover:bg-opacity-20 rounded p-2">
          <div class="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
          </div>
          <span class="text-white text-xs text-center">Terminal</span>
        </div>
      </div>

      <!-- Floating Windows -->
      <div class="absolute inset-4">
        <Window
          v-for="window in windows"
          :key="window.id"
          :title="window.title"
          :type="window.type"
          :position="window.position"
          @close="closeWindow(window.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Virtual Machine'
  },
  windows: {
    type: Array,
    default: () => []
  }
})

const currentTime = ref('')
let timeInterval = null

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const closeWindow = (windowId) => {
  // Emit event to parent to handle window closing
  emit('close-window', windowId)
}

const emit = defineEmits(['close-window'])

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>