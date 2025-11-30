# Sistema de Iconos SVG Sprite

Este proyecto utiliza un sistema de sprite SVG para optimizar el uso de iconos.

## Uso

Importa el componente `Icon` y úsalo con el nombre del icono:

```astro
---
import Icon from './components/Icon.astro';
---

<!-- Uso básico (hereda el color del texto) -->
<Icon name="rocket-2" />

<!-- Con tamaño personalizado -->
<Icon name="flame" size="32" />

<!-- Con color usando clases de Tailwind -->
<Icon name="shield-check" class="text-white" />
<Icon name="heart-pulse" class="text-red-500" />
<Icon name="eye" class="text-blue-600" />

<!-- Combinando tamaño y color -->
<Icon name="flame" size="48" class="text-orange-500" />

<!-- Con clases CSS personalizadas -->
<Icon name="settings" class="mi-icono text-gray-700" />

<!-- Con ancho y alto diferentes -->
<Icon name="play-circle" width="40" height="30" class="text-green-500" />
```

## Props Disponibles

- **name** (requerido): El nombre del icono a mostrar
- **size**: Tamaño del icono (aplica tanto al width como al height). Default: "24"
- **class**: Clases CSS/Tailwind para estilos (incluyendo color con `text-*`)
- **width**: Ancho específico (sobrescribe size)
- **height**: Alto específico (sobrescribe size)

## Usar Colores con Tailwind

El componente `Icon` usa `fill: currentColor`, lo que significa que hereda el color del texto del contenedor. Puedes controlarlo de dos formas:

1. **Con clases de Tailwind directamente:**
```astro
<Icon name="flame" class="text-red-500" />
```

2. **Heredando del contenedor:**
```astro
<div class="text-blue-500">
  <Icon name="shield-check" />
</div>
```

## Iconos Disponibles (44)

1. adhesive-plaster
2. alt-arrow-right
3. alt-arrow-up
4. circle-bottom-up
5. clapperboard-play
6. cloud-check
7. corkscrew
8. eye
9. face-scan-square
10. flame
11. flame--copy
12. folder
13. forward-1
14. gallery-circle
15. gallery-round
16. glasses
17. heart-pulse
18. incognito
19. letter
20. letter-unread
21. lightbulb-bolt
22. lightbulb-minimalistic
23. link-square
24. magnifer
25. map-point-hospital
26. map-point-rotate
27. mirror-left
28. notes
29. paint-roller
30. pallete-2
31. play
32. play-circle
33. point-on-map
34. question-circle
35. rewind-back-circle
36. rewind-forward-circle
37. rocket-2
38. ruler
39. ruler-pen
40. settings
41. shield-check
42. shield-keyhole
43. shield-warning
44. widget-5

## Archivos del Sistema

- **public/sprite.svg**: Archivo sprite que contiene todos los iconos como símbolos SVG
- **src/components/Icon.astro**: Componente reutilizable para mostrar iconos
- **public/img/svg/**: Carpeta con los archivos SVG originales

## Ventajas

- Un solo archivo HTTP request para todos los iconos
- Fácil de mantener y actualizar
- Optimizado para rendimiento
- Flexible y personalizable
