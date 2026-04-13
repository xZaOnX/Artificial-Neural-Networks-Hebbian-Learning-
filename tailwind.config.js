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
        sans: ['"Nunito Sans"', '"Avenir Next"', '"Segoe UI"', "sans-serif"],
        display: ['"Varela Round"', '"Nunito Sans"', '"Avenir Next"', '"Segoe UI"', "sans-serif"],
      },
      boxShadow: {
        panel: "0 20px 60px rgba(15, 23, 42, 0.08), 0 6px 18px rgba(148, 163, 184, 0.12)",
      },
    },
  },
  plugins: [],
};
