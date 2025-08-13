<template>
    <div class="flex h-screen w-screen bg-gray-50 dark:bg-gray-900">
        <!-- Left Sidebar -->
        <div class="flex w-1/6 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div class="flex flex-col w-full p-4">
                <!-- Sidebar Header -->
                <div class="mb-6">
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Workspace</h2>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Development Environment</p>
                </div>
                
                <!-- Navigation Items -->
                <nav class="space-y-2">
                    <div class="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Active Session</span>
                    </div>
                    <div class="flex items-center space-x-3 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                        <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <span>Files Explorer</span>
                    </div>
                    <div class="flex items-center space-x-3 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                        <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <span>Extensions</span>
                    </div>
                </nav>
            </div>
        </div>
        
        <!-- Main Content Area -->
        <div class="flex flex-col w-4/6 bg-gray-50 dark:bg-gray-900">
            <!-- Main Workspace -->
            <div class="flex-1 p-4">
                <div class="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <VNCViewer/>
                </div>
            </div>
            <!-- Terminal Section -->
            <div class="flex-1/4 p-4 pt-0">
                <XTerminal v-model:terminal-session-id="terminalSessionId" :terminal-url="terminalUrl" />
            </div>
        </div>
        
        <!-- Right Sidebar - Chat & Configuration -->
        <div class="flex flex-col w-1/4 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
            <!-- Chat Interface takes up the main space -->
            <div class="flex-1 min-h-0">
                <ChatInterface :terminal-session-id="terminalSessionId" :model-config="modelConfig" />
            </div>
            
            <!-- Configuration Panel at the bottom -->
            <div class="flex-shrink-0">
                <ConfigurationPanel v-model:model-config="modelConfig" />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
const config = useRuntimeConfig();
const terminalUrl = config.public.terminalUrl || 'http://localhost:3000/terminal';
const terminalSessionId = ref(0);

const modelConfig = ref({
    modelName: 'aliframadhan/Qwen3-8b-Tool-Calling',
    baseUrl: 'http://10.8.0.86:9007/v1',
    apiKey: 'mari-kita-berbuat-baik'
})

watch(() => modelConfig.value, (newSessionId) => {
    // Handle session ID updates if needed
    console.log('Terminal session ID updated:', newSessionId);
}); 
</script>