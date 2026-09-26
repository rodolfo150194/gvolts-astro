import { localizePath, t, type Locale } from "@/i18n";

/**
 * Configuración global del sitio. Única fuente de verdad para la URL base,
 * la navegación (menú, pie de página) y los datos legales.
 */
export const SITE = {
  name: "GVolts Corp",
  legalName: "GVoltsCorp",
  url: "https://gvoltscorp.cloud",
  logo: "/img/logo/logo-gvoltscorp2.png",
  /** Idioma principal. Los textos traducibles viven en src/i18n (meta.description, etc.). */
  locale: "en",
} as const;

/** Construye una URL absoluta del sitio a partir de una ruta. */
export const absoluteUrl = (path = "/") => new URL(path, SITE.url).href.replace(/\/$/, "");

export interface NavLink {
  label: string;
  href: string;
}

/** Entrada de menú: `key` apunta a `links` del diccionario; `href` es la ruta sin prefijo de idioma. */
export interface NavItem {
  key: keyof ReturnType<typeof t>["links"];
  href: string;
}

export const NAV_SERVICES: NavItem[] = [
  { key: "fireAlarm", href: "/services/fire-alarm" },
  { key: "security", href: "/services/security" },
  { key: "electricity", href: "/services/electricity" },
];

export const NAV_COMPANY: NavItem[] = [
  { key: "projects", href: "/projects" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
];

export const NAV_LEGAL: NavItem[] = [
  { key: "privacy", href: "/privacy" },
  { key: "cookies", href: "/cookies" },
];

/** Traduce y localiza una lista de enlaces del menú. */
export const navLinks = (items: NavItem[], locale: Locale): NavLink[] =>
  items.map((item) => ({ label: t(locale).links[item.key], href: localizePath(item.href, locale) }));

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
