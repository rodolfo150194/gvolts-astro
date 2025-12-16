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
  },
});

