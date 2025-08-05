<!-- components/RightSidebar.vue -->
<template>
  <div class="h-full flex flex-col">
    <!-- Top Section with Tabs -->
    <!-- <div class="h-2/3 flex flex-col border-b border-gray-200"> -->
      <!-- Tab Headers -->
      <!-- <div class="flex bg-gray-50 border-b">
        <button
          v-for="tab in topTabs"
          :key="tab.id"
          @click="activeTopTab = tab.id"
          :class="[
            'flex-1 px-3 py-2 text-xs font-medium border-r border-gray-200 last:border-r-0',
            activeTopTab === tab.id
              ? `bg-white text-gray-900 border-b-2 border-${tab.color}-500`
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          ]"
        >
          {{ tab.name }}
        </button>
      </div> -->

      <!-- Tab Content -->
      <!-- <div class="flex-1 overflow-hidden"> -->
        <!-- Pentest Tab -->
        <!-- <div v-if="activeTopTab === 'pentest'" class="h-full p-4">
          <PentestPanel />
        </div> -->

        <!-- Teacher Tab -->
        <!-- <div v-else-if="activeTopTab === 'teacher'" class="h-full p-4">
          <TeacherPanel />
        </div> -->

        <!-- Basic Tab -->
        <!-- <div v-else-if="activeTopTab === 'basic'" class="h-full p-4">
          <BasicPanel />
        </div> -->

        <!-- Agent Tab -->
        <!-- <div v-else-if="activeTopTab === 'agent'" class="h-full p-4">
          <AgentPanel />
        </div> -->
      <!-- </div> -->
    <!-- </div> -->

    <!-- Chat Message Interface -->
    <div class="flex-1 flex flex-col">
      <div class="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <h3 class="text-sm font-medium text-gray-700">Chat Message Interface</h3>
      </div>
      
      <div class="flex-1 overflow-auto p-4">
        <ChatInterface />
      </div>
    </div>

    <!-- Bottom Configuration Section -->
    <div class="flex-1 flex flex-col border-t border-gray-200">
      <!-- Config Tab Headers -->
      <div class="flex bg-gray-50 border-b">
        <button
          v-for="tab in configTabs"
          :key="tab.id"
          @click="activeConfigTab = tab.id"
          :class="[
            'flex-1 px-3 py-2 text-xs font-medium border-r border-gray-200 last:border-r-0',
            activeConfigTab === tab.id
              ? `bg-white text-gray-900 border-b-2 border-${tab.color}-500`
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          ]"
        >
          {{ tab.name }}
        </button>
      </div>

      <!-- Config Content -->
      <div class="flex-1 overflow-auto">
        <div v-if="activeConfigTab === 'model'" class="p-4">
          <ModelConfigPanel />
        </div>
        <div v-else-if="activeConfigTab === 'agent'" class="p-4">
          <AgentConfigPanel />
        </div>
        <div v-else-if="activeConfigTab === 'target'" class="p-4">
          <TargetConfigPanel />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTopTab = ref('pentest')
const activeConfigTab = ref('model')

const topTabs = [
  { id: 'pentest', name: 'Pentest', color: 'blue' },
  { id: 'teacher', name: 'Teacher', color: 'green' },
  { id: 'basic', name: 'Basic', color: 'purple' },
  { id: 'agent', name: 'Agent', color: 'orange' }
]

const configTabs = [
  { id: 'model', name: 'Model Config', color: 'blue' },
  { id: 'agent', name: 'Agent Config', color: 'green' },
  { id: 'target', name: 'Target VM Config', color: 'orange' }
]
</script>