/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#F2F4F9',
          100: '#DDE5F5',
          200: '#BCC9EB',
          300: '#8CA4DB',
          400: '#5678C8',
          500: '#2F52A5',
          600: '#264186',
          700: '#1E3368',
          800: '#1B2A4A',
          900: '#161F3A',
          950: '#0F1322',
        },
        teal: {
          50: '#ECFFFD',
          100: '#CFFFEE',
          200: '#9FFFE4',
          300: '#5AFBD0',
          400: '#26E3BA',
          500: '#0B9387',
          600: '#0A7A6F',
          700: '#0E5F56',
          800: '#114F47',
          900: '#114038',
          950: '#042722',
        },
        amber: {
          50: '#FFFBEA',
          100: '#FFF3C4',
          200: '#FFE589',
          300: '#FFD24D',
          400: '#FFBC20',
          500: '#E79F1F',
          600: '#CB7A11',
          700: '#A1570F',
          800: '#844411',
          900: '#6C3611',
          950: '#3E1C05',
        },
        beige: {
          DEFAULT: '#F8F7F4',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          2: '#F1F0EC',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        soft: '0 2px 12px rgba(0,0,0,0.06)',
        subtle: '0 2px 8px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}
