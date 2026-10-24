/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: {
          900: '#0a1d15',
          800: '#0F291E',
          700: '#153a2b',
          600: '#1c4d39',
        },
        navy: {
          900: '#0f172a',
          800: '#1e3a8a',
          700: '#1d4ed8',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        surface: {
          light: '#F8FAFC',
          dark: '#0F172A',
          card: '#FFFFFF',
          cardDark: '#1E293B',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(15, 41, 30, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-gold': '0 0 15px -3px rgba(217, 119, 6, 0.3)',
      }
    },
  },
  plugins: [],
}
