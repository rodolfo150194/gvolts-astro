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
         const url = new URL(item.url);
         if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/$/, '');
         return { ...item, url: url.href };
       },
       i18n: {
         defaultLocale: 'es',
         locales: {
           es: 'es-ES',
         },
       },
     }),
     copyEmailTemplates()
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
        usePolling: true,
        interval: 1000,
        ignored: ['**/public/img/**'],
      },
      allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app'],
    },
  },
});

