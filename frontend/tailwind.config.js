/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'forest-green': {
          50: '#f0f9f0',
          100: '#dcf2dc',
          200: '#bce5bc',
          300: '#90d290',
          400: '#5fb85f',
          500: '#228B22', // Primary forest green
          600: '#1f7d1f',
          700: '#1a651a',
          800: '#175117',
          900: '#154315',
          950: '#0a240a',
        },
      },
    },
  },
}