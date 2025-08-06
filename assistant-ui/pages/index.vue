<!-- pages/index.vue -->
<template>
    <div class="h-screen bg-gray-100 flex">
        <!-- Left Sidebar -->
        <div class="w-80 bg-white border-r border-gray-200 shadow-sm">
            <TreeSidebar />
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 flex flex-col bg-white">
            <MainWorkspace class="flex h-full bg-grey-200" />
            <XTerminal :server-url="terminalUrl" class="flex flex-1 mx-4 mb-2" />
        </div>

        <!-- Right Sidebar -->
        <div class="w-80 bg-white border-l border-gray-200 shadow-sm">
            <div class="h-full flex flex-col">
                <RightSidebar />
                <ConfigPanel />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const terminalUrl = config.websocketUrl;
</script>