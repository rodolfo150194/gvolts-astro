import type { ImageMetadata } from "astro";
import generalArms from "@/assets/img/avatar/general-arms.webp";
import generalPoint from "@/assets/img/avatar/general-point.webp";
import fire from "@/assets/img/avatar/fire.webp";
import security from "@/assets/img/avatar/security.webp";
import elec from "@/assets/img/avatar/elec.webp";

/** Variantes del técnico de GVolts: mismo personaje, distinto casco y herramienta. */
export type AvatarKey = "general" | "point" | "fire" | "security" | "elec";

export const avatars: Record<AvatarKey, { src: ImageMetadata; alt: string }> = {
  general: { src: generalArms, alt: "Técnico de GVolts con casco negro, de brazos cruzados y sonriendo" },
  point: { src: generalPoint, alt: "Técnico de GVolts con casco negro señalando hacia el formulario" },
  fire: { src: fire, alt: "Técnico de alarmas contra incendio con casco naranja, extintor y detector de humo" },
  security: { src: security, alt: "Técnico de seguridad con casco azul instalando una cámara y con una tablet de videovigilancia" },
  elec: { src: elec, alt: "Técnico electricista con casco amarillo midiendo un tablero con un multímetro" },
};
