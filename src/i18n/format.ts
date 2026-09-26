/**
 * Sustituye marcadores `{name}` en una cadena traducida.
 * No depende de Astro: se puede importar también desde scripts de cliente.
 *
 *   fmt("Call {phone}", { phone: "+1 555" }) → "Call +1 555"
 */
export const fmt = (str: string, vars: Record<string, string | number> = {}) =>
  str.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));

/** Lee las cadenas que un componente pasa a su script en `data-i18n` (JSON). */
export const readStrings = <T>(el: HTMLElement | null | undefined, attr = "i18n"): T =>
  JSON.parse(el?.dataset[attr] ?? "{}") as T;
