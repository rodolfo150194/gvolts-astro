/**
 * Inventario de cookies y almacenamiento local del sitio. Única fuente de
 * verdad: lo usan el aviso de cookies y la tabla de la Política de cookies.
 * Los textos (nombre visible, proveedor, finalidad, duración) están
 * traducidos en src/i18n (`cookieData`), con la misma clave `id`.
 * Si añades una herramienta nueva, regístrala aquí y en los diccionarios, y
 * sube `LEGAL.consentVersion` para volver a pedir consentimiento.
 */
export type ConsentCategory = "necessary" | "analytics" | "functional";

export interface CookieCategory {
  id: ConsentCategory;
  /** Las necesarias no se pueden desactivar. */
  required?: boolean;
}

export interface CookieItem {
  /** Clave en `cookieData.items` del diccionario. */
  id: "gv-consent" | "gv_admin" | "umami" | "cw_conversation" | "cw_user_*";
  category: ConsentCategory;
  type: "cookie" | "local";
}

export const COOKIE_CATEGORIES: CookieCategory[] = [
  { id: "necessary", required: true },
  { id: "analytics" },
  { id: "functional" },
];

export const COOKIES: CookieItem[] = [
  { id: "gv-consent", category: "necessary", type: "local" },
  { id: "gv_admin", category: "necessary", type: "cookie" },
  { id: "umami", category: "analytics", type: "local" },
  { id: "cw_conversation", category: "functional", type: "cookie" },
  { id: "cw_user_*", category: "functional", type: "cookie" },
];
