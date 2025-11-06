/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("daisyui")
  ],
  daisyui: {
    themes: [
      {
        cartoonish: {
          "primary": "#FF6B9D",
          "secondary": "#C44569",
          "accent": "#FFA07A",
          "neutral": "#2C3E50",
          "base-100": "#FFF5E4",
          "info": "#74B9FF",
          "success": "#55E6C1",
          "warning": "#FFD93D",
          "error": "#FF6B9D",
        },
      },
    ],
  },
}
