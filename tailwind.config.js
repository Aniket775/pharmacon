/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#FFF8E8', // Warm creamy off-white
          light: '#FFFAF0',
          dark: '#F4ECE0',
        },
        brand: {
          pink: '#FF6F89',
          red: '#F52F4F',
          crimson: '#8F1230',
          burgundy: '#730F34',
          dark: '#351027', // Primary dark burgundy for text & borders
        },
        accent: {
          gold: '#FECB66',
          goldLight: '#FFF0C8',
          mint: '#97D8C4',
          mintLight: '#E0F5EE',
          purple: '#D8B4E2',
          purpleLight: '#F3E8FC',
          blue: '#93C5FD',
          blueLight: '#E8F1FC',
          peach: '#FFD3C4',
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'tactile-sm': '0 2px 0 0 #351027',
        'tactile': '0 4px 0 0 #351027',
        'tactile-md': '0 6px 0 0 #351027',
        'tactile-lg': '0 8px 0 0 #351027',
        'tactile-xl': '0 12px 0 0 #351027',
        'tactile-gold': '0 4px 0 0 #FECB66',
        'tactile-red': '0 4px 0 0 #F52F4F',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.75rem',
        '5xl': '3.5rem',
      },
    },
  },
  plugins: [],
};
