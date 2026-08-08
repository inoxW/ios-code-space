/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0F19",
        mist: "#E6ECF5",
        accent: "#35C38F",
        ember: "#FF7A59",
      },
      boxShadow: {
        panel: "0 20px 50px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};
