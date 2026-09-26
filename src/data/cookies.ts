/**
 * Inventario de cookies y almacenamiento local del sitio. Única fuente de
 * verdad: lo usan el aviso de cookies y la tabla de la Política de cookies.
 * Si añades una herramienta nueva, regístrala aquí y sube
 * `LEGAL.consentVersion` para volver a pedir consentimiento.
 */
export type ConsentCategory = "necessary" | "analytics" | "functional";

export interface CookieCategory {
  id: ConsentCategory;
  label: string;
  description: string;
  /** Las necesarias no se pueden desactivar. */
  required?: boolean;
}

export interface CookieItem {
  name: string;
  category: ConsentCategory;
  provider: string;
  purpose: string;
  duration: string;
  type: "Cookie" | "Almacenamiento local";
}

export const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: "necessary",
    label: "Necesarias",
    description:
      "Imprescindibles para que el sitio funcione y para recordar tu elección sobre cookies. No se pueden desactivar.",
    required: true,
  },
  {
    id: "analytics",
    label: "Analítica",
    description:
      "Nos ayudan a entender, de forma agregada y anónima, qué páginas se visitan para mejorar el sitio. Usamos una herramienta autoalojada que no comparte datos con terceros.",
  },
  {
    id: "functional",
    label: "Funcionales",
    description:
      "Activan el chat en vivo para que puedas escribirnos y continuar la conversación entre visitas.",
  },
];

export const COOKIES: CookieItem[] = [
  {
    name: "gv-consent",
    category: "necessary",
    provider: "GVolts Corp",
    purpose: "Guarda tus preferencias de cookies para no volver a preguntarte.",
    duration: "12 meses",
    type: "Almacenamiento local",
  },
  {
    name: "gv_admin",
    category: "necessary",
    provider: "GVolts Corp",
    purpose: "Mantiene la sesión del panel de administración (solo personal autorizado).",
    duration: "Sesión",
    type: "Cookie",
  },
  {
    name: "Umami (sin cookies)",
    category: "analytics",
    provider: "GVolts Corp (autoalojado)",
    purpose: "Mide visitas de forma agregada sin identificarte ni usar cookies de seguimiento.",
    duration: "No persiste",
    type: "Almacenamiento local",
  },
  {
    name: "cw_conversation",
    category: "functional",
    provider: "Chatwoot",
    purpose: "Identifica tu conversación del chat en vivo para mostrarte el historial.",
    duration: "12 meses",
    type: "Cookie",
  },
  {
    name: "cw_user_*",
    category: "functional",
    provider: "Chatwoot",
    purpose: "Asocia la conversación al visitante que abrió el chat.",
    duration: "12 meses",
    type: "Cookie",
  },
];
