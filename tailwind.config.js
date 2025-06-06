/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./js/**/*.js",
    "./css/**/*.css"
  ],
  safelist: [
    'w-6', 'h-6', 'w-7', 'h-7'
  ],
  theme: {
    extend: {
      padding: {
        'safe-area-inset-bottom': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
} 