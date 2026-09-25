---
name: gvolts-avatar
description: Genera el avatar/mascota oficial de GVolts (técnico con casco de trabajo) de forma consistente, cambiando casco, herramienta y color según el servicio (seguridad, incendio, electricidad o general) y la pose según dónde se usará en el sitio web. Úsala siempre que el usuario pida el avatar, la mascota, el personaje o el "técnico" de GVolts, o una imagen de él para una página, sección, estado (error, éxito) o red social.
---

# GVolts Avatar

Crea imágenes del personaje oficial de GVolts, una empresa de sistemas eléctricos, alarmas contra incendio y seguridad (videovigilancia y control de acceso). El personaje es **siempre el mismo**: solo cambian el **casco**, la **herramienta**, el **color de acento** y la **pose**.

## Flujo de trabajo

1. **Identifica el servicio**: `seguridad`, `incendio`, `electricidad` o `general`. Si el usuario no lo dice y no se deduce del contexto (p. ej. "para la página de alarmas" = incendio), pregunta una sola vez.
2. **Identifica la pose** según el uso (tabla de poses). Si no lo indica, usa `hero`.
3. **Referencia de personaje**:
   - Si el usuario adjunta una imagen previa del avatar, úsala como referencia y di explícitamente: *"Same character as the reference image: keep face, hair, skin tone, body proportions, jacket and art style identical. Only change the helmet, the tool, the accent color and the pose."*
   - Si no hay referencia y es la primera imagen de la conversación, genera primero la versión **general** (sirve de hoja de personaje) y después la variante pedida.
4. **Arma el prompt** en inglés concatenando, en este orden: `BASE` + `SERVICIO` + `POSE` + `SALIDA` + `EVITAR`.
5. **Genera la imagen** y muestra debajo el prompt final usado dentro de un bloque de código, para que el usuario pueda reutilizarlo.
6. Ofrece en una línea generar las otras variantes (los otros servicios o poses) con el mismo personaje.

## BASE (no cambiar nunca)

```
Mascot character for "GVolts", an electrical, fire alarm and security systems company.
A friendly, confident field technician, gender-neutral, mid-20s to 30s, short dark hair,
warm expression with a slight smile, 3/4 view, shown from the waist up,
body turned slightly left, looking at the viewer.
Outfit: charcoal-black work jacket (#111012) with reflective bone-white stripes (#ede8e0)
on the sleeves, a small lightning-bolt "G" patch on the chest, dark work gloves.
Style: modern flat vector illustration with subtle cel shading, clean thick outlines,
geometric shapes, limited palette, industrial "control room" aesthetic, crisp edges,
readable at small sizes (website avatar and icon use).
```

## SERVICIO (elige uno)

| Servicio | Acento | Bloque |
|---|---|---|
| Seguridad | `#4da8ff` azul | ver abajo |
| Incendio | `#ff6b35` naranja | ver abajo |
| Electricidad | `#ffd66b` amarillo | ver abajo |
| General | `#ede8e0` hueso | ver abajo |

**Seguridad**
```
Wearing a matte blue hard hat (#4da8ff) with a small camera-lens emblem on the front
and a slim headset microphone. Holding a compact tablet showing a live CCTV camera grid.
Accent color #4da8ff used on the tablet screen glow and small highlights.
```

**Incendio**
```
Wearing a glossy orange-red hard hat (#ff6b35) with a flame emblem on the front
and a clear face shield flipped up. Holding a red fire extinguisher; a round ceiling
smoke detector floats beside the character. Accent color #ff6b35 on highlights.
```

**Electricidad**
```
Wearing a bright yellow hard hat (#ffd66b) with a lightning-bolt emblem on the front
and a headlamp. Holding a digital multimeter with red and black probes; an insulated
screwdriver is tucked in the jacket pocket. Accent color #ffd66b on highlights.
```

**General**
```
Wearing a charcoal hard hat with a bone-white "G" emblem on the front. No tool.
Accent color #ede8e0 on highlights.
```

## POSE (según dónde se usará)

| Uso en el sitio | Clave | Bloque |
|---|---|---|
| Hero / bienvenida | `hero` | `Waving hello with the free hand, energetic and welcoming pose.` |
| Formulario de contacto / CTA | `cta` | `Pointing to the right with the free hand, inviting gesture.` |
| Sección "Cómo funciona" | `explica` | `Explaining, free hand open palm up, thoughtful smile.` |
| Error / 404 | `error` | `Scratching the back of the helmet with the free hand, confused but friendly.` |
| Envío correcto / éxito | `exito` | `Thumbs up with the free hand, big smile, a few small sparks in the accent color.` |
| Foto de perfil / chat | `avatar` | `Head and shoulders only, centered, neutral friendly smile, tool not visible.` |

Si la pose necesita las dos manos (p. ej. pulgares arriba con ambas), deja la herramienta colgada del cinturón.

## SALIDA

```
Background: fully transparent (PNG). No ground shadow, no scenery.
Square 1:1 composition, character centered and filling about 85% of the frame.
```

Si el usuario pide otro formato (banner, historia de Instagram, 16:9), cambia solo la proporción y mantén el fondo transparente o el color `#111012` si pide fondo.

## EVITAR

```
Avoid: photorealism, 3D render look, blur, extra or deformed fingers, any text or letters
other than the "G" emblem, watermarks, busy or gradient backgrounds, multiple characters,
cropped head or helmet.
```

## Reglas

- Nunca cambies la cara, el pelo, el tono de piel, las proporciones, la chaqueta ni el estilo entre variantes.
- Un solo personaje por imagen.
- Los colores hex de esta skill son los de la web de GVolts: no los sustituyas por otros.
- Responde al usuario en español; los prompts de imagen, en inglés.

## Ejemplo

Usuario: *"Hazme el avatar para el formulario de contacto de la página de electricidad."*

Prompt final:
```
[BASE] + [Electricidad] + Pointing to the right with the free hand, inviting gesture. + [SALIDA] + [EVITAR]
```
(Escrito completo, con los bloques sustituidos por su texto.)
