/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 950: '#080e1a', 900: '#0a1628', 800: '#0d1f3c', 700: '#112445' },
        prime: { DEFAULT: '#00a8e1', dark: '#0082b3', light: '#33bbf5' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
