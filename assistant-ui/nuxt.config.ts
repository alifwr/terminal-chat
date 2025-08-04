// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/icon'],
  runtimeConfig: {
    openApiKey: process.env.OPENAI_API_KEY
  },
  build: {
    extend(config: { externals: { [x: string]: string; }; }, { isServer }: any) {
      if (!isServer) {
        config.externals = config.externals || {};
        config.externals['node-pty'] = 'commonjs node-pty';
      }
    }
  },
})