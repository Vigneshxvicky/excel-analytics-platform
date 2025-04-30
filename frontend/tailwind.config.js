// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        trustBlue: "#0D47A1",    // A deep, trustworthy blue
        trustAccent: "#FFC107",  // A subtle accent (golden hue)
        trustGray: "#F5F5F5",    // A light, clean background
      },
      fontFamily: {
        formal: ['"Roboto"', "sans-serif"],
      },
    },
  },
  plugins: [],
};