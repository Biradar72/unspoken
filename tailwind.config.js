/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#172033',
          50: '#e8ecf4',
          100: '#c5cee3',
          200: '#9aabd0',
          300: '#6e87bc',
          400: '#4a69ad',
          500: '#2a4d9f',
          600: '#1e3d8c',
          700: '#172033',
          800: '#0e1a2c',
          900: '#080f1a',
        },
        ivory: {
          DEFAULT: '#F7F2E9',
          50: '#ffffff',
          100: '#fdfaf5',
          200: '#F7F2E9',
          300: '#ede4d3',
          400: '#e0d3be',
          500: '#d0bfa6',
        },
        sage: {
          DEFAULT: '#A8B5A0',
          light: '#c8d4c2',
          dark: '#7a917a',
        },
        rose: {
          DEFAULT: '#C58F98',
          light: '#dbb4bc',
          dark: '#a06874',
        },
        gold: {
          DEFAULT: '#D8B779',
          light: '#e8d0a0',
          dark: '#b8955a',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-up': 'fadeUp 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
      },
      boxShadow: {
        'poem': '0 4px 24px rgba(23, 32, 51, 0.08)',
        'poem-hover': '0 8px 40px rgba(23, 32, 51, 0.16)',
        'card': '0 2px 12px rgba(23, 32, 51, 0.06)',
        'glow-rose': '0 0 24px rgba(197, 143, 152, 0.3)',
        'glow-gold': '0 0 24px rgba(216, 183, 121, 0.3)',
      },
      typography: {
        poem: {
          css: {
            whiteSpace: 'pre-line',
            lineHeight: '1.9',
            letterSpacing: '0.01em',
          },
        },
      },
    },
  },
  plugins: [],
}
