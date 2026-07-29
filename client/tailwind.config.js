/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Strong pink brand palette used across the full site
        pink: {
          light: '#E56A9A',
          soft: '#D94380',
          DEFAULT: '#C82867',
          accent: '#B81C5C',
          deep: '#9B124A',
        },
        ink: '#1A1A1A',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 6px 24px -8px rgba(155, 18, 74, 0.34)',
      },
    },
  },
  plugins: [],
};
