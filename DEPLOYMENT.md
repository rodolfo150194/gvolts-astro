# Guía de Deployment - GVolts Astro

## 🚀 Deployment en Hostinger con Dokploy

Esta guía detalla el proceso completo para desplegar el proyecto en Hostinger usando Dokploy.

### Prerrequisitos

1. Cuenta de Hostinger con VPS
2. Dokploy instalado en tu VPS de Hostinger
3. Repositorio Git (GitHub, GitLab, etc.)
4. Credenciales de Supabase y Resend

### Paso 1: Preparar el Repositorio

El proyecto ya está configurado con:
- ✅ `nixpacks.toml` - Configuración de Nixpacks
- ✅ `Dockerfile` - Alternativa con Docker
- ✅ `@astrojs/node` - Adaptador para servidor Node.js
- ✅ Scripts de inicio en `package.json`

### Paso 2: Configurar en Dokploy

1. **Accede al panel de Dokploy** en tu VPS de Hostinger

2. **Crea una nueva aplicación**
   - Click en "New Application"
   - Selecciona "Git Repository"

3. **Conecta tu repositorio**
   - URL del repositorio: `https://github.com/tu-usuario/gvolts_astro`
   - Rama: `main` o `master`
   - Autoriza el acceso si es necesario

4. **Configuración de Build**
   - Dokploy detectará automáticamente `nixpacks.toml`
   - **Build method**: Nixpacks (auto-detectado)
   - **Node.js version**: 20 (especificado en nixpacks.toml)
   - **Package manager**: pnpm (auto-detectado)

### Paso 3: Variables de Entorno

En el panel de Dokploy, agrega las siguientes variables de entorno:

#### Variables Requeridas

```env
# Supabase (Newsletter)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_clave_anon_publica

# Resend (Envío de emails)
RESEND_API_KEY=re_tu_clave_api
FROM_EMAIL=info@gvoltscorp.com
FROM_NAME=GVolts

# Node.js
NODE_ENV=production
```

#### Variables Opcionales

```env
# Puerto (por defecto 3000)
PORT=3000

# Host (por defecto 0.0.0.0)
HOST=0.0.0.0
```

### Paso 4: Configurar Dominio

1. **En Dokploy**:
   - Ve a la sección "Domains"
   - Agrega tu dominio: `gvoltscorp.com`
   - Habilita SSL/HTTPS (Let's Encrypt automático)

2. **En tu DNS (Hostinger)**:
   - Crea un registro A apuntando a la IP de tu VPS
   - Ejemplo:
     ```
     Tipo: A
     Nombre: @
     Valor: IP_DE_TU_VPS
     TTL: 3600
     ```
   - Para www:
     ```
     Tipo: CNAME
     Nombre: www
     Valor: gvoltscorp.com
     TTL: 3600
     ```

### Paso 5: Deploy

1. Click en **"Deploy"** en Dokploy
2. Espera a que el proceso termine (2-5 minutos)
3. Verifica los logs en tiempo real

### Proceso de Build (Automático)

Nixpacks ejecutará:

```bash
# 1. Setup
Instalar Node.js 20 y pnpm

# 2. Install
pnpm install --frozen-lockfile

# 3. Build
pnpm run build

# 4. Start
node ./dist/server/entry.mjs
```

### Verificación

Una vez desplegado:

1. **Health Check**: `https://gvoltscorp.com`
2. **Logs**: Revisar en panel de Dokploy
3. **Métricas**: CPU, RAM, uptime en dashboard

### 🔄 Auto-Deploy

Configura auto-deployment en webhooks:

1. En Dokploy, copia la URL del webhook
2. En tu repositorio (GitHub):
   - Settings > Webhooks > Add webhook
   - Payload URL: URL del webhook de Dokploy
   - Events: "Just the push event"
   - Active: ✓

Ahora cada push a `main` desplegará automáticamente.

## 🐳 Alternativa: Deploy con Docker

Si prefieres usar Docker directamente en tu VPS:

### 1. Conectarse al VPS

```bash
ssh root@tu-vps-ip
```

### 2. Clonar y Build

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/gvolts_astro.git
cd gvolts_astro

# Build de la imagen
docker build -t gvolts-astro .
```

### 3. Crear archivo .env

```bash
nano .env
```

Agrega las variables de entorno:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_clave_anon
RESEND_API_KEY=re_tu_clave
FROM_EMAIL=info@gvoltscorp.com
FROM_NAME=GVolts
NODE_ENV=production
```

### 4. Run del contenedor

```bash
docker run -d \
  --name gvolts \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  gvolts-astro
```

### 5. Configurar Nginx como Reverse Proxy

```bash
# Instalar Nginx
apt update && apt install nginx -y

# Configurar sitio
nano /etc/nginx/sites-available/gvolts
```

Contenido del archivo:

```nginx
server {
    listen 80;
    server_name gvoltscorp.com www.gvoltscorp.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activar y recargar:

```bash
ln -s /etc/nginx/sites-available/gvolts /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 6. SSL con Certbot

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d gvoltscorp.com -d www.gvoltscorp.com
```

## 🔧 Troubleshooting

### Error: "Cannot find module"

**Solución**: Verifica que `pnpm install` se ejecutó correctamente

```bash
# En Dokploy logs, busca:
pnpm install --frozen-lockfile
```

### Error: "Port already in use"

**Solución**: Cambia el puerto en variables de entorno

```env
PORT=3001
```

### Error: "ECONNREFUSED" (Supabase)

**Solución**: Verifica las variables de entorno:
- `SUPABASE_URL` debe terminar con `.supabase.co`
- `SUPABASE_KEY` debe ser la clave **anon** (pública)

### Logs en tiempo real

```bash
# Con Dokploy: Ver en el panel
# Con Docker:
docker logs -f gvolts
```

## 📊 Monitoreo

### Métricas recomendadas

- **Uptime**: > 99.9%
- **Response time**: < 500ms
- **CPU usage**: < 70%
- **Memory usage**: < 512MB

### Herramientas

- **Uptime Kuma**: Monitoreo de uptime
- **Grafana + Prometheus**: Métricas detalladas
- **Sentry**: Error tracking (opcional)

## 🔐 Seguridad

### Checklist

- ✅ SSL/HTTPS habilitado
- ✅ Variables de entorno en servidor (no en código)
- ✅ Firewall configurado (solo puertos 80, 443, 22)
- ✅ Backups automáticos de base de datos
- ✅ Rate limiting en Nginx (opcional)

### Backups

```bash
# Backup de base de datos Supabase
# Se hace automáticamente desde el panel de Supabase

# Backup de código
# Git es tu backup :)
```

## 📞 Soporte

- **Dokploy Docs**: https://docs.dokploy.com
- **Astro Docs**: https://docs.astro.build
- **Hostinger Support**: https://www.hostinger.com/contact
