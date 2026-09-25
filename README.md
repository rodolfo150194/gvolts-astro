# GVolts - Sistema de Seguridad Electrónica

Sitio web profesional para servicios de alarmas contra incendios, seguridad/vigilancia y electricidad.

## 📋 Requisitos Previos

- **Node.js** 18.0 o superior
- **pnpm** 10.24+ (requerido)

### Instalar pnpm

```bash
npm install -g pnpm
```

## 🚀 Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd gvolts_astro
```

2. **Instalar dependencias**
```bash
pnpm install
```

3. **Configurar variables de entorno**

Copia el archivo de ejemplo y configura tus credenciales:

```bash
cp .env.example .env
```

Edita `.env` y agrega tus credenciales:

```env
# Supabase (para newsletter)
SUPABASE_URL=tu_supabase_url
SUPABASE_KEY=tu_supabase_anon_key

# Resend (para envío de emails)
RESEND_API_KEY=tu_resend_api_key
FROM_EMAIL=tu_email@dominio.com
FROM_NAME=GVolts
```

## 🛠️ Comandos de Desarrollo

| Comando | Acción |
|---------|--------|
| `pnpm dev` | Inicia servidor de desarrollo en `localhost:4321` |
| `pnpm build` | Construye el sitio para producción en `./dist/` |
| `pnpm preview` | Previsualiza el build de producción localmente |

## 🏗️ Stack Tecnológico

- **Framework**: Astro 5.15+ (SSR)
- **Estilos**: Tailwind CSS 4.1+
- **Iconos**: Lucide Astro 0.561+
- **Base de datos**: Supabase
- **Animaciones**: GSAP 3.13+
- **Deployment**: Netlify

## 📦 Estructura del Proyecto

```
src/
├── actions/       # Astro Actions (formularios)
├── components/    # Componentes reutilizables
├── data/          # Contenido JSON
├── layouts/       # Layouts base
├── pages/         # Rutas (file-based routing)
├── services/      # Lógica de negocio
└── styles/        # CSS global
```

## 🎨 Sistema de Iconos

### Iconos Lucide (preferido para iconos estáticos)
```astro
import { Phone, Mail } from '@lucide/astro';

<Phone size={24} />
```

### Icon.astro (para iconos dinámicos) — componente legado
```astro
import Icon from "@/components/old-version/Icon.astro";

<Icon name="custom-icon" size={24} />
```

## 🗄️ Base de Datos (Supabase)

Crea una tabla `subscriber` con el siguiente esquema:

```sql
CREATE TABLE subscriber (
  email TEXT PRIMARY KEY UNIQUE NOT NULL
);
```

## 🚢 Deployment

### Opción 1: Hostinger con Dokploy (Nixpacks) - Recomendado

El proyecto está configurado con `nixpacks.toml` para deployment automático en Dokploy:

1. **Conecta tu repositorio Git** en Dokploy
2. **Configura las variables de entorno** en el panel de Dokploy:
   ```env
   SUPABASE_URL=tu_supabase_url
   SUPABASE_KEY=tu_supabase_anon_key
   RESEND_API_KEY=tu_resend_api_key
   FROM_EMAIL=tu_email@dominio.com
   FROM_NAME=GVolts
   NODE_ENV=production
   ```
3. **Deploy settings** (auto-detectados por Nixpacks):
   - **Build command**: `pnpm run build` (auto-configurado)
   - **Start command**: `node ./dist/server/entry.mjs` (auto-configurado)
   - **Port**: 3000 (configurable con variable `PORT`)
   - **Node.js version**: 20

4. **Deploy**: Dokploy detectará automáticamente el `nixpacks.toml` y hará el build

### Opción 2: Docker (Hostinger VPS)

Si prefieres usar Docker en lugar de Nixpacks:

```bash
# Build de la imagen
docker build -t gvolts-astro .

# Run del contenedor
docker run -d \
  -p 3000:3000 \
  -e SUPABASE_URL=tu_url \
  -e SUPABASE_KEY=tu_key \
  -e RESEND_API_KEY=tu_key \
  -e FROM_EMAIL=tu_email \
  -e FROM_NAME=GVolts \
  --name gvolts \
  gvolts-astro
```

### Opción 3: Netlify

Si quieres usar Netlify (requiere cambiar adaptador):

1. Instalar adaptador de Netlify: `pnpm add @astrojs/netlify`
2. Cambiar en `astro.config.mjs`:
   ```js
   import netlify from '@astrojs/netlify';
   // ...
   adapter: netlify()
   ```
3. Configurar variables de entorno en Netlify
4. Build command: `pnpm run build`
5. Publish directory: `dist`

## 📖 Documentación

Para más detalles sobre la arquitectura y convenciones del proyecto, consulta [CLAUDE.md](./CLAUDE.md).

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado y confidencial.
