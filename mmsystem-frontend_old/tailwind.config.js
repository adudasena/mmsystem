/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sr-verde': '#4a5d33', // O verde do protótipo
        'sr-bege': '#dcded0',  // O fundo do protótipo
      }
    },
  },
  plugins: [],
}