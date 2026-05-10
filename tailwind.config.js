/** Tailwind config for Portfolio 2.0 */
module.exports = {
  content: ["./app/**/*.{js,ts,tsx}", "./pages/**/*.{js,ts,tsx}", "./data/**/*.{json}"] ,
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        // keep high-contrast, minimalist palette
        'bg': '#000',
        'fg': '#fff',
      },
    },
  },
  plugins: [],
}
