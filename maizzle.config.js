/** @type {import('@maizzle/framework').Config} */
export default {
  build: {
    templates: {
      source: 'src/emails',
      destination: {
        path: 'dist/emails',
      },
    },
  },
  inlineCSS: true,
  removeUnusedCSS: true,
  minify: false, // Deshabilitado para mejor debugging
  prettify: true,
  tailwind: {
    config: {
      content: ['src/emails/**/*.html'],
      theme: {
        extend: {
          colors: {
            'indian-red': {
              50: '#fef2f2',
              100: '#fee2e2',
              200: '#fecaca',
              300: '#fca5a5',
              400: '#f87171',
              500: '#DC2626', // Color principal de GVolts
              600: '#B91C1C',
              700: '#991b1b',
              800: '#7f1d1d',
              900: '#7f1d1d',
            },
          },
        },
      },
    },
  },
};
