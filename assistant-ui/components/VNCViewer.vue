<template>
    <iframe :src="vmUrl" frameborder="0" title="Example iframe" class="h-full w-full overflow-scroll" />
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const vmUrl = config.vmUrl;
</script>