<!-- components/MainWorkspace.vue -->
<template>
    <div class="h-full flex flex-col">
        <!-- Top Section with Tabs -->
        <div class="flex-1 flex flex-col">
            <!-- Tab Headers -->
            <div class="flex bg-gray-50 border-b">
                <button v-for="tab in mainTabs" :key="tab.id" @click="activeMainTab = tab.id" :class="[
                    'px-6 py-3 text-sm font-medium border-r border-gray-200 last:border-r-0',
                    activeMainTab === tab.id
                        ? `bg-white text-gray-900 border-b-2 border-${tab.color}-500`
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                ]">
                    {{ tab.name }}
                </button>
            </div>

            <!-- Tab Content -->
            <div class="flex-1 bg-white overflow-hidden">
                <!-- Attacker VM -->
                <div v-if="activeMainTab === 'attacker'" class="h-full p-4">
                    <!-- <VirtualMachine title="Attacker VM - Kali Linux" :windows="attackerWindows" /> -->
                     <VNCViewer />
                </div>

                <!-- Attack Graph -->
                <div v-else-if="activeMainTab === 'graph'" class="h-full p-4">
                    <AttackGraph />
                </div>

                <!-- Attack Plan -->
                <div v-else-if="activeMainTab === 'plan'" class="h-full p-4">
                    <AttackPlan />
                </div>

                <!-- Vulnerable VM -->
                <div v-else-if="activeMainTab === 'vulnerable'" class="h-full p-4">
                    <VirtualMachine title="Target VM - Ubuntu Server" :windows="targetWindows" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const activeMainTab = ref('attacker')

const mainTabs = [
    { id: 'attacker', name: 'Attacker VM', color: 'blue' },
    { id: 'graph', name: 'Attack Graph', color: 'purple' },
    { id: 'plan', name: 'Attack Plan', color: 'orange' },
    { id: 'vulnerable', name: 'Vulnerable VM', color: 'green' }
]

const attackerWindows = [
    { id: 1, title: 'File Manager', type: 'filemanager', position: { x: 50, y: 50 } },
    { id: 2, title: 'Terminal', type: 'terminal', position: { x: 200, y: 100 } },
    { id: 3, title: 'Network Monitor', type: 'monitor', position: { x: 400, y: 80 } }
]

const targetWindows = [
    { id: 1, title: 'System Info', type: 'system', position: { x: 100, y: 60 } },
    { id: 2, title: 'Logs', type: 'logs', position: { x: 300, y: 120 } }
]
</script>

<style scoped>
.font-mono {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>