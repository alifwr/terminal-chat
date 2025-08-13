// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    mcpUrl: process.env.MCP_URL,
    modelName: process.env.MODEL_NAME,
    targetManagerUrl: process.env.TARGET_MANAGER_URL,
    
    public: {
      terminalUrl: process.env.TERMINAL_URL,
      vmUrl: process.env.VM_URL,
      modelName: process.env.MODEL_NAME,
    }
  },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/color-mode']
})