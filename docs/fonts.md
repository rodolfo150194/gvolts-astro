# Tipografías autoalojadas

El sitio ya no carga fuentes de Google Fonts: todas se sirven desde `public/fonts/`.

| Familia | Uso (variable CSS) | Archivos |
| --- | --- | --- |
| Big Shoulders Display (500–900) | `--cr-display`, títulos | `BigShouldersDisplay-latin(-ext).woff2` |
| Hanken Grotesk (400–700, normal e itálica) | `--cr-body`, texto | `HankenGrotesk-(Italic-)latin(-ext).woff2` |
| JetBrains Mono (100–800, normal e itálica) | `--cr-mono`, etiquetas | `JetBrainsMono-(Italic-)latin(-ext).woff2` |
| Roboto Mono (TTF) | Panel de administración y estilos antiguos | `RobotoMono-*.ttf` |

- Las reglas `@font-face` están en `src/styles/fonts.css`, que se importa en `ControlRoomLayout.astro`.
- Son fuentes **variables** en `woff2`, con los subconjuntos `latin` y `latin-ext` (cubren español e inglés, incluidos ñ, tildes y ¿¡). El navegador solo descarga `latin-ext` si la página usa esos caracteres.
- En el `<head>` se precargan los tres archivos `latin` que se pintan en el primer pantallazo.

## Cómo actualizar o añadir una fuente

1. Descarga el CSS de Google con un user-agent moderno para obtener `woff2`:
   ```sh
   curl -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36" \
     "https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@500..900&family=Hanken+Grotesk:ital,wght@0,400..700;1,400..700&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap"
   ```
2. De cada bloque `/* latin */` y `/* latin-ext */`, descarga el `url(...)` a `public/fonts/` con un nombre descriptivo.
3. Copia `font-family`, `font-style`, `font-weight` y `unicode-range` a `src/styles/fonts.css`, apuntando a `/fonts/<archivo>.woff2`.
4. Si la fuente aparece arriba del todo en la página, añade su `latin` al `<link rel="preload">` de `ControlRoomLayout.astro`.
5. Comprueba en DevTools → Network que no hay peticiones a `fonts.googleapis.com` ni a `fonts.gstatic.com`.
