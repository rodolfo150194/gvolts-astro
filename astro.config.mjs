import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'url';
import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

// Custom integration to copy email templates to dist
const copyEmailTemplates = () => ({
  name: 'copy-email-templates',
  hooks: {
    'astro:build:done': () => {
      const emailsDir = join(process.cwd(), 'src', 'emails');
      const distEmailsDir = join(process.cwd(), 'dist', 'emails');

      // Create dist/emails directory if it doesn't exist
      if (!existsSync(distEmailsDir)) {
        mkdirSync(distEmailsDir, { recursive: true });
      }

      // Copy all email templates
      if (existsSync(emailsDir)) {
        const files = readdirSync(emailsDir);
        files.forEach(file => {
          const srcPath = join(emailsDir, file);
          const destPath = join(distEmailsDir, file);
          copyFileSync(srcPath, destPath);
          console.log(`✅ Copied email template: ${file}`);
        });
      }
    }
  }
});

// https://astro.build/config
export default defineConfig({
  site: 'https://gvoltscorp.cloud',
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [
     sitemap({
       // El panel de administración no debe indexarse
       filter: (page) => !new URL(page).pathname.startsWith('/admin'),
       // Coherente con las URL canónicas (sin barra final)
       serialize: (item) => {
         const clean = (href) => {
           const url = new URL(href);
           if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/$/, '');
           return url.href;
         };
         return {
           ...item,
           url: clean(item.url),
           links: item.links?.map((link) => ({ ...link, url: clean(link.url) })),
         };
       },
       // Alternativas hreflang entre /ruta (inglés) y /es/ruta (español)
       i18n: {
         defaultLocale: 'en',
         locales: {
           en: 'en-US',
           es: 'es-ES',
         },
       },
     }),
     copyEmailTemplates()
   ],
  // Inglés en la raíz (/about) y español bajo /es (/es/about). Ver src/i18n.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    plugins: [tailwindcss()],
    server: {
      watch: {
        usePolling: true,
        interval: 1000,
        ignored: ['**/public/img/**'],
      },
      allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app'],
    },
  },
});

