import { defineMiddleware } from "astro:middleware";

const ADMIN_COOKIE = "gv_admin";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (!pathname.startsWith("/admin")) return next();
  if (pathname === "/admin/login") return next();

  const cookie = context.cookies.get(ADMIN_COOKIE);
  const adminPassword = import.meta.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error("[middleware] ADMIN_PASSWORD not set");
    return context.redirect("/admin/login?error=config");
  }

  const expected = btoa(`gvolts:${adminPassword}`);

  if (!cookie || cookie.value !== expected) {
    return context.redirect("/admin/login");
  }

  return next();
});
