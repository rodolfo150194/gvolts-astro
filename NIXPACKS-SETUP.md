# 🚀 Configuración de Nixpacks - Resumen Rápido

## ✅ Lo que se configuró

### 1. Archivos creados/modificados

- ✅ `nixpacks.toml` - Configuración de Nixpacks
- ✅ `Dockerfile` - Alternativa con Docker
- ✅ `.dockerignore` - Excluir archivos en Docker build
- ✅ `astro.config.mjs` - Cambiado adaptador a `@astrojs/node`
- ✅ `package.json` - Agregado script `start`
- ✅ `DEPLOYMENT.md` - Guía completa de deployment
- ✅ `README.md` - Actualizado con instrucciones

### 2. Dependencias instaladas

```bash
pnpm add @astrojs/node
```

### 3. Configuración actual

**Adaptador**: `@astrojs/node` (modo standalone)
**Puerto**: 3000 (configurable con `PORT`)
**Host**: 0.0.0.0 (configurable con `HOST`)

## 🎯 Para desplegar en Dokploy

### Paso 1: Conectar repositorio

En Dokploy:
1. New Application
2. Git Repository
3. Conecta tu repo

### Paso 2: Variables de entorno

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_clave_anon
RESEND_API_KEY=re_tu_clave
FROM_EMAIL=info@gvoltscorp.com
FROM_NAME=GVolts
NODE_ENV=production
```

### Paso 3: Deploy

Click en **Deploy** y espera (2-5 min)

## 🔍 Verificar configuración local

### Build de prueba

```bash
pnpm run build
```

**Resultado esperado**:
```
✓ built in X.XXs
✓ Completed in X.XXs
```

### Probar servidor local

```bash
# 1. Build
pnpm run build

# 2. Iniciar servidor
pnpm start

# 3. Abrir en navegador
# http://localhost:3000
```

## 📁 Estructura de deployment

Después del build, Nixpacks/Dokploy:

```
1. Setup → Instala Node.js 20 + pnpm
2. Install → pnpm install --frozen-lockfile
3. Build → pnpm run build
4. Start → node ./dist/server/entry.mjs
```

## 🎨 Archivos de configuración

### nixpacks.toml

```toml
[phases.setup]
nixPkgs = ["nodejs_20", "pnpm"]

[phases.install]
cmds = ["pnpm install --frozen-lockfile"]

[phases.build]
cmds = ["pnpm run build"]

[start]
cmd = "node ./dist/server/entry.mjs"
```

### astro.config.mjs

```js
import node from '@astrojs/node';

export default defineConfig({
  adapter: node({
    mode: 'standalone'
  }),
  // ...
});
```

## 🐛 Troubleshooting

### Error: "Cannot find module"

**Causa**: Dependencias no instaladas
**Solución**: Verifica que `pnpm install` se ejecutó

### Error: "Port already in use"

**Causa**: Puerto 3000 ocupado
**Solución**: Cambia variable `PORT=3001`

### Error: Build falla

**Causa**: Cache corrupto
**Solución**:
```bash
rm -rf node_modules .astro dist
pnpm install
pnpm run build
```

## 📊 Verificación de deployment

### Health checks

```bash
# Verificar que el servidor responde
curl https://gvoltscorp.com

# Verificar status
curl -I https://gvoltscorp.com
```

**Respuesta esperada**: `200 OK`

## 🔄 Auto-deploy (CI/CD)

Dokploy puede auto-desplegar en cada push:

1. En Dokploy: Copiar webhook URL
2. En GitHub: Settings > Webhooks > Add webhook
3. Pega la URL y activa

Ahora cada push a `main` despliega automáticamente.

## 📖 Documentación completa

- **README.md** - Instalación y comandos
- **DEPLOYMENT.md** - Guía completa de deployment
- **CLAUDE.md** - Arquitectura del proyecto

## ✨ Resumen

Tu proyecto está listo para Nixpacks/Dokploy:

✅ Build automático con pnpm
✅ Servidor standalone con Node.js
✅ Variables de entorno configurables
✅ Puerto y host configurables
✅ Dockerfile alternativo incluido
✅ Auto-deploy con webhooks

**¡Solo conecta tu repo en Dokploy y despliega!** 🚀
