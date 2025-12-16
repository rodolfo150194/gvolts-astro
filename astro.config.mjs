import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'url';
import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.gvoltscorp.com',
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
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
  },
  integrations: [
    {
      name: 'copy-email-templates',
      hooks: {
        'astro:build:done': () => {
          // Copiar templates de email al directorio dist
          const srcDir = 'src/emails';
          const destDir = 'dist/emails';

          if (!existsSync(destDir)) {
            mkdirSync(destDir, { recursive: true });
          }

          const files = readdirSync(srcDir);
          files.forEach(file => {
            copyFileSync(join(srcDir, file), join(destDir, file));
          });

          console.log('✓ Email templates copiados a dist/emails');
        }
      }
    }
  ]
});

