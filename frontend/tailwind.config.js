/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        luxe: {
          black: '#050505',
          wine: '#5B0A0A',
          crimson: '#8B0000',
          ember: '#C1121F',
        },
      },
      boxShadow: {
        'red-glow': '0 24px 80px rgba(193, 18, 31, 0.18)',
        'deep-luxe': '0 30px 90px rgba(0, 0, 0, 0.55)',
      },
    },
  },
  plugins: [],
};
