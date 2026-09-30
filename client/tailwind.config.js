/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        brand: {
          from: '#6366f1',
          to:   '#4f46e5',
        },
      },
      boxShadow: {
        card:    '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
        soft:    '0 4px 24px -2px rgba(15,23,42,0.10)',
        glow:    '0 0 24px rgba(99,102,241,0.25)',
        'glow-emerald': '0 0 24px rgba(16,185,129,0.25)',
        'glow-red':     '0 0 24px rgba(239,68,68,0.25)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        'brand-dark':     'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)',
        'success-gradient': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'danger-gradient':  'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        'amber-gradient':   'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'purple-gradient':  'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
        'sky-gradient':     'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
        'teal-gradient':    'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
        'chart-grid':       'linear-gradient(180deg, transparent 0%, rgba(241,245,249,0.5) 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'slide-up':    'slideUp 0.4s ease both',
        'fade-in':     'fadeIn 0.3s ease both',
        'count-up':    'countUp 0.5s ease both',
        'pulse-ring':  'pulse-ring 1.5s ease-out infinite',
        'shimmer':     'shimmer 1.4s infinite',
      },
    },
  },
  plugins: [],
}
