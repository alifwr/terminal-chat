<!-- pages/index.vue -->
<template>
        <ChatInterface />
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const terminalUrl = config.websocketUrl;
</script>