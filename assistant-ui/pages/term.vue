<!-- pages/terminal.vue -->
<template>
  <div class="terminal-page">
    <h1>Remote Terminal</h1>
    <ClientOnly>
      <XTerminal :server-url="serverUrl" />
      <template #fallback>
        <div class="loading">
          <p>Loading terminal...</p>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup>
// You can make this configurable
const serverUrl = process.client ? 
  (process.dev ? 'http://localhost:8080' : 'https://your-production-server.com') : 
  'http://localhost:8080'
</script>

<style scoped>
.terminal-page {
  padding: 20px;
  height: 100vh;
  background: #1e1e1e;
  color: white;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 500px;
  background: #1a1a1a;
  border-radius: 4px;
}
</style>