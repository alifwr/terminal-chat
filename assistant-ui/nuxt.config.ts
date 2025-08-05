// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/icon', '@nuxtjs/tailwindcss'],
  runtimeConfig: {
    openApiKey: process.env.OPENAI_API_KEY,
    mcpUrl: process.env.MCP_URL,
    vllmUrl: process.env.VLLM_URL,
    websocketUrl: process.env.WEBSOCKET_URL,

    public: {
    }
  },
  build: {
    extend(config: { externals: { [x: string]: string; }; }, { isServer }: any) {
      if (!isServer) {
        config.externals = config.externals || {};
        config.externals['node-pty'] = 'commonjs node-pty';
      }
    },
    transpile: ['@novnc/novnc']
  },
})