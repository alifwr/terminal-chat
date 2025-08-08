<template>
  <div class="h-full w-full">
    <iframe 
      v-if="shouldRenderIframe"
      :src="vmUrl" 
      frameborder="0" 
      title="Example iframe" 
      class="h-full w-full overflow-scroll" 
    />
    <div 
      v-else 
      class="h-full w-full flex items-center justify-center"
    >
      Loading...
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const vmUrl = config.public?.vmUrl || ''; // Make sure this is in public config
const shouldRenderIframe = computed(() => !!vmUrl);
</script>