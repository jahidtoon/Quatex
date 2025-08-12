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
        main: '#8f96a3',
        secondary: '#1e222d',
        tertiary: '#2a2e39',
        custom: '#3a3f4b',
      },
    },
  },
  plugins: [],
};
