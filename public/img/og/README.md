# Open Graph Images - GVolts

Este directorio contiene las imágenes Open Graph (OG) para compartir en redes sociales.

## Imágenes Requeridas

Necesitas crear las siguientes imágenes con las especificaciones exactas:

### Especificaciones Técnicas
- **Dimensiones**: 1200x630px (exacto)
- **Formato**: PNG o JPG
- **Tamaño máximo**: < 1MB
- **Propósito**: Previsualizaciones en Facebook, Twitter, LinkedIn, WhatsApp

---

## Imágenes a Crear

### 1. `og-default.png` (PRINCIPAL - REQUERIDA)
Imagen por defecto para todas las páginas que no tengan imagen específica.

**Elementos de diseño:**
- Fondo: Gradiente de indian-red-500 (#DC2626) a slate-900
- Logo GVolts (blanco) - esquina superior izquierda
- Texto principal (centrado, grande, bold, blanco): "Sistemas de Protección Profesional"
- Subtexto (centrado, mediano, blanco): "Alarmas • Seguridad • Electricidad"
- Iconos pequeños en parte inferior:
  - Fuego (alarmas)
  - Cámara (seguridad)
  - Rayo eléctrico (electricidad)
- URL "gvoltscorp.com" - esquina inferior derecha, texto pequeño

---

### 2. `fire-alarm-og.png` (Para página de Alarmas)
Basada en la plantilla principal pero enfocada en alarmas contra incendios.

**Diferencias:**
- Texto principal: "Alarmas Contra Incendios Certificadas"
- Subtexto: "Protección NFPA 72 • Monitoreo 24/7"
- Icono de fuego más grande y prominente
- Puede incluir imagen de fondo: detector de humo o panel de control

---

### 3. `security-og.png` (Para página de Seguridad)
Basada en la plantilla principal pero enfocada en videovigilancia.

**Diferencias:**
- Texto principal: "Videovigilancia Inteligente"
- Subtexto: "Cámaras 4K • IA • Control de Acceso"
- Icono de cámara más grande y prominente
- Puede incluir imagen de fondo: cámara de seguridad o monitor de vigilancia

---

### 4. `electricity-og.png` (Para página de Electricidad)
Basada en la plantilla principal pero enfocada en servicios eléctricos.

**Diferencias:**
- Texto principal: "Servicios Eléctricos Certificados"
- Subtexto: "Instalación • Reparación • Automatización"
- Icono de rayo eléctrico más grande y prominente
- Puede incluir imagen de fondo: panel eléctrico o técnico trabajando

---

## Herramientas Recomendadas

### Opción 1: Canva (Fácil, Online)
1. Crear diseño personalizado de 1200x630px
2. Usar plantillas de "Facebook Post" o "Twitter Header"
3. Exportar como PNG de alta calidad

### Opción 2: Figma (Profesional, Online)
1. Crear frame de 1200x630px
2. Diseñar con componentes reutilizables
3. Exportar como PNG 2x para mejor calidad

### Opción 3: Photoshop/GIMP (Avanzado)
1. Crear documento nuevo 1200x630px, 72 DPI
2. Diseñar con capas para fácil edición
3. Exportar para web (PNG-24 o JPG alta calidad)

---

## Paleta de Colores GVolts

```
- Indian Red: #DC2626 (primary)
- Slate 900: #0F172A (dark background)
- White: #FFFFFF (text)
- Slate 600: #475569 (secondary text)
```

---

## Testing

Después de crear las imágenes, probarlas en:
- **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/

---

## Ejemplo de Estructura Visual

```
┌─────────────────────────────────────────┐
│  [Logo]                                 │
│                                         │
│          TEXTO PRINCIPAL                │
│          Subtexto descriptivo           │
│                                         │
│      🔥    📷    ⚡                     │
│                         gvoltscorp.com │
└─────────────────────────────────────────┘
       1200px × 630px
```

---

## Estado Actual

- [ ] og-default.png (Requerida)
- [ ] fire-alarm-og.png (Opcional pero recomendada)
- [ ] security-og.png (Opcional pero recomendada)
- [ ] electricity-og.png (Opcional pero recomendada)

**Nota**: Si solo creas `og-default.png`, funcionará para todas las páginas, pero las imágenes específicas mejorarán la conversión en redes sociales.
