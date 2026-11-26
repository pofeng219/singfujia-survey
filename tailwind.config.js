/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './constants.ts',
    './types.ts',
    './components/**/*.{ts,tsx}',
    './utils/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  safelist: [
    '[&>span:first-child]:text-[14px]',
    '[&>span:first-child]:text-[18px]',
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#020617',
        },
      },
    },
  },
  plugins: [],
};
