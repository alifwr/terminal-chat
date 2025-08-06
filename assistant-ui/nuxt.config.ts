// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/icon', '@nuxtjs/tailwindcss'],
  runtimeConfig: {
    apiKey: process.env.LLM_API_KEY,
    mcpUrl: process.env.MCP_URL,
    baseUrl: process.env.BASE_URL,
    websocketUrl: process.env.WEBSOCKET_URL,
    vmUrl: process.env.VM_URL,
    modelName: process.env.MODEL_NAME,

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