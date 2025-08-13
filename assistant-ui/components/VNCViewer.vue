<template>
  <div class="h-full w-full flex flex-col">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Virtual Machine</h3>
        <span class="text-sm text-gray-500 dark:text-gray-400">Remote Desktop</span>
      </div>
      <div class="flex items-center space-x-2">
        <span class="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
          Connected
        </span>
      </div>
    </div>
    
    <!-- Content Area -->
    <div class="flex-1 bg-gray-50 dark:bg-gray-900 p-1">
      <div class="h-full w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <iframe 
          v-if="shouldRenderIframe"
          :src="vmUrl" 
          frameborder="0" 
          title="Virtual Machine Display" 
          class="h-full w-full" 
        />
        <div 
          v-else 
          class="h-full w-full flex flex-col items-center justify-center text-center p-8"
        >
          <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No VM Connection
          </h4>
          <p class="text-gray-500 dark:text-gray-400 max-w-sm">
            Virtual machine URL not configured. Please check your runtime configuration.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const vmUrl = config.public?.vmUrl || ''; // Make sure this is in public config
const shouldRenderIframe = computed(() => !!vmUrl);
</script>