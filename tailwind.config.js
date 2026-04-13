/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Avenir Next"', '"Segoe UI"', "sans-serif"],
        display: ['"Avenir Next"', '"Segoe UI"', "sans-serif"],
      },
      boxShadow: {
        panel: "0 24px 60px rgba(4, 11, 20, 0.42)",
      },
    },
  },
  plugins: [],
};
