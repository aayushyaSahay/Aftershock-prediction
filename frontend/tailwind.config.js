/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette
        'bg-dark': '#0a0e27',
        'bg-card': '#1a1f3a',
        'text-primary': '#e8eaed',
        'text-secondary': '#9aa0a6',
        'map-bg': '#0f1419',
        // Risk levels
        'risk-critical': '#dc2626',
        'risk-high': '#f59e0b',
        'risk-elevated': '#fbbf24',
        'risk-moderate': '#10b981',
        // Model quality
        'quality-high': '#10b981',
        'quality-medium': '#f59e0b',
        'quality-low': '#dc2626',
        'no-model': '#4b5563',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
}