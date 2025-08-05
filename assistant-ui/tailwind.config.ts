module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue"
  ],
  theme: {
    extend: {
      fontFamily: {
        'mono': ['Monaco', 'Menlo', 'Ubuntu Mono', 'monospace']
      },
      animation: {
        'pulse-bg': 'pulse-bg 1.5s ease-in-out infinite',
      },
      keyframes: {
        'pulse-bg': {
          '0%': { backgroundPosition: '100% 0' },
          '100%': { backgroundPosition: '-100% 0' },
        }
      },
      backgroundSize: {
        '200': '200% 100%',
      },
      backgroundImage: {
        'gradient-loading': 'linear-gradient(90deg, transparent 0%, #374151 50%, transparent 100%)',
      }
    },
  },
  plugins: [],
}