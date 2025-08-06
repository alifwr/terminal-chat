<!-- components/RightSidebar.vue -->
<template>
    <div class="h-full flex flex-col">
        <!-- Bottom Configuration Section -->
        <div class="flex-1 flex flex-col border-t border-gray-200">
            <!-- Config Tab Headers -->
            <div class="flex bg-gray-50 border-b">
                <button v-for="tab in configTabs" :key="tab.id" @click="activeConfigTab = tab.id" :class="[
                    'flex-1 px-3 py-2 text-xs font-medium border-r border-gray-200 last:border-r-0',
                    activeConfigTab === tab.id
                        ? `bg-white text-gray-900 border-b-2 border-${tab.color}-500`
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                ]">
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