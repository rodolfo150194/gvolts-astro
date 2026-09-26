/**
 * Idiomas del sitio. El inglés es el principal (sin prefijo: /, /about…) y el
 * español vive bajo /es (/es, /es/about…). Debe coincidir con `i18n` en
 * astro.config.mjs.
 */
export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_META: Record<
  Locale,
  { label: string; name: string; htmlLang: string; hreflang: string; ogLocale: string; intl: string }
> = {
  en: { label: "EN", name: "English", htmlLang: "en", hreflang: "en", ogLocale: "en_US", intl: "en-US" },
  es: { label: "ES", name: "Español", htmlLang: "es", hreflang: "es", ogLocale: "es_ES", intl: "es-ES" },
};
