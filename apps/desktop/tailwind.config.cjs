/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        side: 'var(--side)',
        ink: 'var(--ink)',
        ink2: 'var(--ink2)',
        line: 'var(--line)',
        brand: { DEFAULT: 'var(--brand)', green: '#57C98A', teal: '#29A99B', blue: '#2C6E9C' },
        pill: 'var(--pill)',
        pillt: 'var(--pillt)',
      },
      fontFamily: {
        display: ['Poppins', 'Segoe UI', 'system-ui', 'sans-serif'],
        sans: ['Segoe UI Variable', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      borderRadius: { xl2: '14px' },
    },
  },
  plugins: [],
}
