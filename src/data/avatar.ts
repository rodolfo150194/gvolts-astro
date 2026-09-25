import type { ImageMetadata } from "astro";
import generalArms from "@/assets/img/avatar/general-arms.webp";
import generalPoint from "@/assets/img/avatar/general-point.webp";
import fire from "@/assets/img/avatar/fire.webp";
import security from "@/assets/img/avatar/security.webp";
import elec from "@/assets/img/avatar/elec.webp";
import generalLean from "@/assets/img/avatar/general-lean.webp";
import fireInstall from "@/assets/img/avatar/fire-install.webp";
import elecPanel from "@/assets/img/avatar/elec-panel.webp";
import securityAccess from "@/assets/img/avatar/security-access.webp";
import blueprint from "@/assets/img/avatar/blueprint.png";

/** Variantes del técnico de GVolts: mismo personaje, distinto casco y herramienta. */
export type AvatarKey =
  | "general"
  | "point"
  | "fire"
  | "security"
  | "elec"
  | "lean"
  | "monitoring"
  | "blueprint"
  | "fireInstall"
  | "elecPanel"
  | "securityAccess";

export const avatars: Record<AvatarKey, { src: ImageMetadata; alt: string }> = {
  general: { src: generalArms, alt: "Técnico de GVolts con casco negro, de brazos cruzados y sonriendo" },
  point: { src: generalPoint, alt: "Técnico de GVolts con casco negro señalando hacia el formulario" },
  fire: { src: fire, alt: "Técnico de alarmas contra incendio con casco naranja, extintor y detector de humo" },
  security: { src: security, alt: "Técnico de seguridad con casco azul instalando una cámara y con una tablet de videovigilancia" },
  elec: { src: elec, alt: "Técnico electricista con casco amarillo midiendo un tablero con un multímetro" },
  lean: { src: generalLean, alt: "Técnico de GVolts apoyado sobre el panel de zonas, sonriendo" },
  fireInstall: { src: fireInstall, alt: "Técnico de incendio fijando un extintor a la pared con un taladro" },
  elecPanel: { src: elecPanel, alt: "Técnico electricista revisando un tablero eléctrico con una tablet" },
  securityAccess: { src: securityAccess, alt: "Técnico de seguridad arrodillado configurando un lector de control de acceso" },
  blueprint: { src: blueprint, alt: "Técnico de GVolts revisando planos de obra" },
};
