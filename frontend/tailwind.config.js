/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // South Indian Food Inspired Color Palette
        // Primary: Banana Leaf Green - represents fresh, organic food
        primary: {
          50: '#f1f7f0',
          100: '#e8f4e6',
          200: '#c8e6c4',
          300: '#a8d8a0',
          400: '#66bb6a',
          500: '#2e7d32', // Banana Leaf Green (main)
          600: '#2e7d32',
          700: '#246e28',
          800: '#1b511e',
          900: '#0d2818',
        },
        // Secondary: Turmeric Yellow - represents warmth and tradition
        secondary: {
          50: '#fffbf0',
          100: '#fff8e7',
          200: '#ffe082',
          300: '#ffd54f',
          400: '#ffca28',
          500: '#ffc107', // Turmeric Yellow (main)
          600: '#ffb300',
          700: '#ffa000',
          800: '#ff8f00',
          900: '#ff6f00',
        },
        // Accent: Spice Orange - represents richness and flavor
        accent: {
          50: '#fff3e0',
          100: '#ffe0b2',
          200: '#ffcc80',
          300: '#ffb74d',
          400: '#ffa726',
          500: '#ff6b35', // Spice Orange (main)
          600: '#ff5722',
          700: '#ff4500',
          800: '#e64a19',
          900: '#bf360c',
        },
      },
      backgroundColor: {
        // Cream background for the page
        'cream': '#fff8e7',
      },
    },
  },
  plugins: [],
}