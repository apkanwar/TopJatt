/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bg-dashYellow',
    'bg-dashWhite',
    'bg-dashPurple',
    'bg-dashGreen',
    'text-dashYellow',
    'text-dashWhite',
    'text-dashPurple',
    'text-dashGreen',
  ],
  theme: {
    extend: {
      colors: {
        topOrange: '#FF9966',
        customBlack: '#252525',
        midnight: '#1B1C1E',
        navyBlue: '#28334A',
        dashYellow: '#F9DDAF',
        dashWhite: '#EEEDEA',
        dashPurple: '#EEE3FF',
        dashGreen: '#B5D4CC',
      },
      fontFamily: {
        'headings': ['Rubik', 'sans-serif'],
        'main': ['Montserrat', 'sans-serif'],
        'numbers': ['Onest', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-45': 'linear-gradient(45deg, var(--tw-gradient-stops))',
        'top-orange': 'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)',
      }
    }
  },
  plugins: [],
});
