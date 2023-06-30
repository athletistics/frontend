/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
      "./index.html",
      "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
        colors: {
            'primary': '#059669',
            'primary-variant': {
                100: '#ecfdf5',
                200: '#d1fae5',
                300: '#a7f3d0',
                400: '#6ee7b7',
                500: '#34d399',
                600: '#10b981',
                700: '#059669', // primary
                800: '#047857',
                900: '#065f46'
            }
        }
    },
  },
  plugins: [],
}
