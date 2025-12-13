import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'url'

// https://astro.build/config
export default defineConfig({
  site: 'https://www.gvoltscorp.com',
  output:"server",
  adapter: netlify(),
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es-ES',
        },
      },
    })
  ],
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    plugins: [tailwindcss()],
    server: {
      watch: {
        usePolling: false,
        ignored: ['**/node_modules/**', '**/.git/**']
      }
    }
  }
});

