<!-- components/RightSidebar.vue -->
<template>
    <div class="h-full flex flex-col">
        <!-- Chat Message Interface -->
        <div class="flex-1 flex flex-col h-full">
            <div class="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <h3 class="text-sm font-medium text-gray-700">Chat Message Interface</h3>
            </div>

            <div class="flex-1 overflow-auto p-4">
                <ChatInterface />
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