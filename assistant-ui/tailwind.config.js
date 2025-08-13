/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
    "./composables/**/*.{js,ts}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Theme colors for safelist
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        }
      }
    },
  },
  safelist: [
    // Blue theme
    'bg-blue-50', 'bg-blue-100', 'bg-blue-500', 'bg-blue-600', 'bg-blue-700', 'bg-blue-800',
    'text-blue-600', 'text-blue-700', 'border-blue-600',
    'hover:bg-blue-700', 'focus:ring-blue-500',
    
    // Green/Emerald theme
    'bg-emerald-50', 'bg-emerald-100', 'bg-emerald-500', 'bg-emerald-600', 'bg-emerald-700', 'bg-emerald-800',
    'text-emerald-600', 'text-emerald-700', 'border-emerald-600',
    'hover:bg-emerald-700', 'focus:ring-emerald-500',
    'bg-slate-50', 'bg-slate-800', 'bg-slate-900', 'border-slate-200', 'border-slate-700',
    'text-slate-900', 'text-slate-500', 'text-slate-400',
    
    // Purple theme
    'bg-purple-50', 'bg-purple-100', 'bg-purple-500', 'bg-purple-600', 'bg-purple-700', 'bg-purple-800',
    'text-purple-600', 'text-purple-700', 'border-purple-600',
    'hover:bg-purple-700', 'focus:ring-purple-500',
    
    // Orange theme
    'bg-orange-50', 'bg-orange-100', 'bg-orange-500', 'bg-orange-600', 'bg-orange-700', 'bg-orange-800',
    'text-orange-600', 'text-orange-700', 'border-orange-600',
    'hover:bg-orange-700', 'focus:ring-orange-500',
    
    // Base colors
    'bg-white', 'bg-gray-50', 'bg-gray-100', 'bg-gray-200', 'bg-gray-300', 'bg-gray-400', 'bg-gray-500',
    'bg-gray-600', 'bg-gray-700', 'bg-gray-800', 'bg-gray-900', 'bg-black',
    'text-white', 'text-gray-900', 'text-gray-500', 'text-gray-400', 'text-gray-300',
    'border-gray-200', 'border-gray-300', 'border-gray-700', 'border-gray-600',
    'hover:bg-gray-50', 'hover:bg-gray-100', 'hover:bg-gray-200', 'hover:bg-gray-600', 'hover:bg-gray-700',
    'hover:text-gray-700', 'hover:text-gray-200', 'hover:border-gray-400', 'hover:border-gray-500',
    
    // Placeholder colors
    'placeholder-gray-500', 'placeholder-gray-400',
    'placeholder-slate-500', 'placeholder-slate-400',
    
    // Text colors
    'text-slate-900', 'text-slate-500', 'text-slate-400',
  ],
  plugins: [],
}
