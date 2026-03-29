/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Sora', 'sans-serif'],
        display: ['Clash Display', 'Sora', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        surface: {
          DEFAULT: '#0d0f12',
          1: '#141719',
          2: '#1c1f23',
          3: '#23272c',
          border: '#2a2f36',
        },
        accent: {
          DEFAULT: '#3b82f6',   // blue-500
          dim:    '#1d4ed8',    // blue-700
          glow:   '#60a5fa',    // blue-400
        },
        danger: {
          DEFAULT: '#ef4444',
          glow:   '#f87171',
        },
        safe: {
          DEFAULT: '#22c55e',
          glow:   '#4ade80',
        },
        muted: '#6b7280',
        subtle: '#374151',
      },
      boxShadow: {
        'glow-blue':   '0 0 24px -4px rgba(59,130,246,0.35)',
        'glow-green':  '0 0 24px -4px rgba(34,197,94,0.35)',
        'glow-red':    '0 0 24px -4px rgba(239,68,68,0.35)',
        'card':        '0 1px 3px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.3)',
        'card-hover':  '0 1px 3px rgba(0,0,0,0.6), 0 16px 48px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'grid-subtle': `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 2s linear infinite',
      },
    },
  },
  plugins: [],
}
