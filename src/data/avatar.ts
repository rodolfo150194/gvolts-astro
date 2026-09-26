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

/** Imagen de cada variante. El texto alternativo está traducido en src/i18n (`avatars`). */
export const avatars: Record<AvatarKey, { src: ImageMetadata }> = {
  general: { src: generalArms },
  point: { src: generalPoint },
  fire: { src: fire },
  security: { src: security },
  elec: { src: elec },
  lean: { src: generalLean },
  fireInstall: { src: fireInstall },
  elecPanel: { src: elecPanel },
  securityAccess: { src: securityAccess },
  blueprint: { src: blueprint },
};
