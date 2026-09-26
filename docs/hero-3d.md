# Gemelo digital del Hero (3D)

Guía del plano 3D animado de la portada: qué muestra, dónde está el código y cómo modificarlo.

> Nota: son mejoras **visuales/UX**. No afectan al SEO: el contenido del lienzo WebGL no lo indexan los buscadores. Solo el texto HTML del Hero (tarjeta de cámara y panel de zonas) es rastreable.

## Archivos

| Archivo | Qué contiene |
| --- | --- |
| `src/components/control-room/Hero.astro` | Marcado del Hero, tarjeta de cámara (`cam-card`), panel de zonas (`zones`), avatar del técnico y plano CSS de respaldo (`twin__plan`). Carga la escena 3D en diferido. |
| `src/components/control-room/twin-scene.ts` | Escena Three.js del Hero (`mountTwin`). Toda la animación vive aquí. |
| `src/scripts/twin3d/scene.ts` | Escena del *laboratorio* (`DigitalTwinLab`), independiente de la del Hero. |

La escena se monta solo si el navegador soporta WebGL2 y el usuario no pide movimiento reducido. En otro caso se queda el plano CSS (`twin__plan`), que es estático y más simple.

## Plano y coordenadas

El plano usa las mismas coordenadas que el SVG original: **520 × 520 unidades**. `at(x, y, h)` convierte a mundo 3D (10 × 10, `WALL_H = 1.1` de altura de muro).

| Zona | Rectángulo `[x, y, ancho, alto]` | Sistema |
| --- | --- | --- |
| Z01 · Lobby | `[0, 0, 300, 220]` (`LOBBY`) | Incendio: detector en alarma + rociadores |
| Z02 · Bodega | `[0, 220, 300, 300]` | Control de acceso: lector, puerta y persona |
| Z03 · Servidores | `[300, 0, 220, 320]` (`SERVERS`) | CCTV con visión recortada a la sala |
| Tablero | `[300, 320, 220, 200]` | Tablero 220 V y cables con corriente |

Los muros interiores están en `WALLS`. El muro Z01/Z02 tiene un hueco de puerta entre `x = 170` y `x = 230`.

## Qué hace cada zona

### Z01 · Incendio (alarma activada)
- Detector en el techo (`DETECTOR`) con ondas rojas y estrobo rojo sobre el suelo del lobby (`alarmTint`).
- Tubería bajo el techo y dos rociadores (`SPRINKLERS`) descargando agua: estelas (`LineSegments`), gotas (`Points`), salpicaduras (anillos) y charcos.
- El agua usa planos de recorte (`roomClip(LOBBY)`), así que nunca sale del lobby.
- Densidad: `DROPS_PER_HEAD` (70 en móvil, 120 en escritorio).

### Z02 · Control de acceso (ciclo de 9 s)
1. La persona se acerca a la puerta.
2. El lector (`READER_POS`) pasa a "LEYENDO TARJETA…" (LED parpadeando).
3. "ACCESO CONCEDIDO": LED y suelo verdes, la puerta gira y se abre.
4. La persona entra a la bodega y desaparece; la puerta se cierra.

Los tiempos están en el bloque `// Z02 · ciclo de acceso` del bucle (`c` va de 0 a 1 en cada ciclo).

### Z03 · CCTV
- Cámara montada en la esquina (`CAMERA_POS`) que barre ±24° hacia el interior de la sala.
- El cono y su huella en el suelo usan `roomClip(SERVERS)`: la detección nunca atraviesa los muros.
- Un técnico camina por la sala. Cuando entra en el cono aparece la caja de detección "PERSONAL · 97%".

## Encuadre (por qué ya no se corta)

`fitDist()` proyecta las 8 esquinas del edificio en cada frame y ajusta la distancia de la cámara para que todo quede dentro del lienzo (margen del 94 % en horizontal y del 90 % en vertical). Si cambias el tamaño del edificio o del contenedor `.twin__3d`, no hace falta tocar números de zoom.

## Reglas para modificarla

- **Orden de pintado:** el suelo es semitransparente y se pinta primero (`floor.renderOrder = -2`). Cualquier efecto nuevo sobre el suelo debe tener `renderOrder` ≥ 0 y `depthWrite: false`; si no, el suelo lo tapa.
- **Efectos confinados a una sala:** añade `clippingPlanes: roomClip([x, y, w, h])` al material (el renderer ya tiene `localClippingEnabled = true`).
- **Nuevos recursos de Three.js:** envuélvelos en `track(...)` para que se liberen al desmontar.
- **Etiquetas:** son `CSS2DObject` (HTML), con fuentes y colores del tema (`var(--cr-*)`).
- **Móvil:** en pantallas de 640 px o menos, el `.twin` es más alto, el panel ocupa todo el ancho y el avatar se coloca a la derecha (`@media (max-width: 640px)` en `Hero.astro`).

## Verificación

1. `pnpm dev` y abre `/`.
2. Comprueba a 1440 px y a 390 px que el edificio no se corta y que se ven el agua, la puerta y el cono.
3. `pnpm build` debe terminar sin errores.
