import { DEFAULT_LOCALE, LOCALES, LOCALE_META, type Locale } from "./config";
import en from "./en";
import es from "./es";

export { DEFAULT_LOCALE, LOCALES, LOCALE_META, type Locale };
export { fmt } from "./format";
export type { Dictionary } from "./es";

const dictionaries = { en, es } as const;

export const isLocale = (value: unknown): value is Locale => LOCALES.includes(value as Locale);

/** Idioma de la petición actual (Astro lo deduce de la ruta: /es/... → "es"). */
export const getLocale = (astro: { currentLocale?: string | undefined }): Locale =>
  isLocale(astro.currentLocale) ? astro.currentLocale : DEFAULT_LOCALE;

/** Diccionario de un idioma. */
export const t = (locale: Locale) => dictionaries[locale];

/** Atajo para componentes: `const tr = useTranslations(Astro)`. */
export const useTranslations = (astro: { currentLocale?: string | undefined }) => t(getLocale(astro));

/**
 * Separa el prefijo de idioma de una ruta.
 *   "/es/about" → { locale: "es", path: "/about" }
 *   "/about"    → { locale: "en", path: "/about" }
 */
export const splitLocale = (pathname: string): { locale: Locale; path: string } => {
  const match = pathname.match(/^\/([a-z]{2})(?=\/|$)(.*)$/);
  if (match && isLocale(match[1]) && match[1] !== DEFAULT_LOCALE) {
    return { locale: match[1], path: match[2] || "/" };
  }
  return { locale: DEFAULT_LOCALE, path: pathname || "/" };
};

/**
 * Construye la URL de una ruta del sitio en un idioma. Admite ancla y query.
 *   localizePath("/about", "es")      → "/es/about"
 *   localizePath("/", "es")           → "/es"
 *   localizePath("/#servicios", "es") → "/es#servicios"
 *   localizePath("/about", "en")      → "/about"
 */
export const localizePath = (path: string, locale: Locale): string => {
  if (!path.startsWith("/")) return path; // externo, mailto:, tel:, #ancla…
  const [, pathname = "/", suffix = ""] = path.match(/^([^?#]*)(.*)$/) ?? [];
  const base = splitLocale(pathname || "/").path;
  if (locale === DEFAULT_LOCALE) return `${base}${suffix}`;
  const localized = base === "/" ? `/${locale}` : `/${locale}${base}`;
  return `${localized}${suffix}`;
};

/** La misma página en otro idioma (sin barra final). */
export const switchLocalePath = (pathname: string, target: Locale) =>
  localizePath(pathname.replace(/(.)\/$/, "$1"), target);

/** Ayudante para componentes: idioma, diccionario y constructor de enlaces. */
export const i18n = (astro: { currentLocale?: string | undefined }) => {
  const locale = getLocale(astro);
  return { locale, tr: t(locale), href: (path: string) => localizePath(path, locale) };
};
