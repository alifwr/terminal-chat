// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/icon', '@nuxtjs/tailwindcss'],
  runtimeConfig: {
    mcpUrl: process.env.MCP_URL,
    baseUrl: process.env.BASE_URL,
    apiKey: process.env.LLM_API_KEY,
    modelName: process.env.MODEL_NAME,
    
    public: {
      terminalUrl: process.env.TERMINAL_URL,
      vmUrl: process.env.VM_URL,
      apiKey: process.env.LLM_API_KEY,
      baseUrl: process.env.BASE_URL,
      modelName: process.env.MODEL_NAME,
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