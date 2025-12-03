import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';
import { fileURLToPath } from 'url'

// https://astro.build/config
export default defineConfig({
  output:"server",
  adapter: netlify(),
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    plugins: [tailwindcss()]
  }
});

