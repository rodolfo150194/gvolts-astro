/**
 * Configuración global del sitio. Única fuente de verdad para la URL base,
 * la navegación (menú, pie de página) y los datos legales.
 */
export const SITE = {
  name: "GVolts Corp",
  legalName: "GVoltsCorp",
  url: "https://gvoltscorp.cloud",
  logo: "/img/logo/logo-gvoltscorp2.png",
  locale: "es",
  description:
    "Diseñamos, instalamos y monitoreamos alarmas contra incendios, videovigilancia y sistemas eléctricos certificados para hogares y negocios.",
} as const;

/** Construye una URL absoluta del sitio a partir de una ruta. */
export const absoluteUrl = (path = "/") => new URL(path, SITE.url).href.replace(/\/$/, "");

/** Tipografías de Google usadas por el diseño Control Room. */
export const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@500;600;700;800;900&family=Hanken+Grotesk:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap";

export interface NavLink {
  label: string;
  href: string;
}

export const NAV_SERVICES: NavLink[] = [
  { label: "Alarmas de Incendio", href: "/services/fire-alarm" },
  { label: "Seguridad Electrónica", href: "/services/security" },
  { label: "Electricidad", href: "/services/electricity" },
];

export const NAV_COMPANY: NavLink[] = [
  { label: "Proyectos", href: "/projects" },
  { label: "Nosotros", href: "/about" },
  { label: "Contacto", href: "/contact" },
];

export const NAV_LEGAL: NavLink[] = [
  { label: "Política de privacidad", href: "/privacy" },
  { label: "Política de cookies", href: "/cookies" },
];

/** Analítica web (Umami autoalojado). Solo se carga con consentimiento. */
export const ANALYTICS = {
  src: "https://analytics.gvoltscorp.cloud/script.js",
  websiteId: "5bd6008f-052c-466f-86e1-016f32ff1ee8",
} as const;

/**
 * Datos del responsable del tratamiento, usados en las páginas legales.
 * Fecha de última revisión: actualízala cada vez que cambie el contenido legal.
 */
export const LEGAL = {
  updated: "2026-09-26",
  /** Clave de localStorage donde se guarda la elección de cookies. */
  consentKey: "gv-consent",
  /** Súbela cuando cambien las categorías de cookies para volver a pedir consentimiento. */
  consentVersion: 1,
  /** Meses que se conserva la elección antes de volver a preguntar. */
  consentMonths: 12,
} as const;
