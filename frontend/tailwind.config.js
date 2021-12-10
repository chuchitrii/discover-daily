const plugin = require('tailwindcss/plugin');
const colors = require('tailwindcss/colors');
const mode = process.env.TAILWIND_MODE ? 'jit' : 'aot';

module.exports = {
  prefix: '',
  mode: mode,
  purge: {
    // enabled: process.env.NODE_ENV === 'production',
    content: ['./src/**/*.{html,ts}'],
  },
  darkMode: 'media',
  theme: {
    extend: {
      boxShadow: {
        'lg-up': '0 -10px 15px -3px rgba(0, 0, 0, 0.1), 0 -4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      colors: {
        emerald: colors.emerald,
        rose: colors.rose,
        indigo: colors.indigo,
        teal: colors.teal,
        blueGray: colors.blueGray,
        warmGray: colors.warmGray,
        trueGray: colors.trueGray,
      },
      fontFamily: {
        discover: ['"Source Code Pro"', 'mono'],
      },
    },
  },
  variants: {
    extend: {
      padding: ['first', 'last'],
      margin: ['first', 'last'],
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/aspect-ratio'),
    plugin(function ({ addUtilities }) {
      const chUtilities = {
        '.text-gradient': {
          'background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
      };
      addUtilities(chUtilities, ['responsive', 'hover']);
    }),
  ],
};
