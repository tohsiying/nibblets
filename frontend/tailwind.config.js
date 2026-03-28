/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './hooks/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#FFF5F5',    // lightest blush background
          1: '#FFFFFF',    // white cards
          2: '#FFF0F0',    // subtle pink tint for inputs/hovers
          3: '#FFE4E6',    // deeper blush for nested elements
        },
        border: {
          DEFAULT: 'rgba(190,130,140,0.18)',
          hover: 'rgba(190,130,140,0.30)',
          active: 'rgba(190,130,140,0.45)',
        },
        text: {
          primary: '#2D2A26',
          secondary: '#6B5E5E',
          tertiary: '#9B8E8E',
        },
        accent: {
          DEFAULT: '#D4826A',
          dim: 'rgba(212,130,106,0.10)',
          hover: 'rgba(212,130,106,0.18)',
        },
        status: {
          success: '#4CAF7D',
          warning: '#E5A63E',
          error: '#D45454',
          info: '#5B8BD4',
        }
      },
      fontSize: {
        'xs': ['11px', { lineHeight: '16px' }],
        'sm': ['12px', { lineHeight: '16px' }],
        'base': ['13px', { lineHeight: '20px' }],
        'lg': ['14px', { lineHeight: '20px' }],
        'xl': ['16px', { lineHeight: '24px' }],
        '2xl': ['20px', { lineHeight: '28px' }],
        '3xl': ['24px', { lineHeight: '32px' }],
      },
    },
  },
  plugins: [],
}
