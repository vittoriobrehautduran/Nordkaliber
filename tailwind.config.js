/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./**/*.html",
    "./**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        'hunter-brown': '#1B4D3E',
        'mustard-gold': '#E6B17A',
        'cool-grey': '#6B7280'
      }
    },
  },
  plugins: [],
}
