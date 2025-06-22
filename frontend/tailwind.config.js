/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          primary: '#4CAF50',    // Primary green (sage-like)
          secondary: '#81C784',  // Secondary lighter green
          accent: '#8D6E63',     // Earthy brown
          light: '#F1F8E9',      // Light background with hint of green
          dark: '#2E2E2E',       // Dark text color
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}