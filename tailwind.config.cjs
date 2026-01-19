/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  corePlugins: {
    preflight: false,
  },
  important: "#datafront",
  plugins: [require("@tailwindcss/forms")],
  theme: {
    extend: {},
  },
};
