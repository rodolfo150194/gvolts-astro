/**
 * Revela con escalonado los elementos marcados con [data-reveal] al entrar
 * en pantalla. El retardo se controla desde el marcado con `style="--d:80ms"`.
 */
export function initReveal(selector = ".cr [data-reveal]") {
  const els = document.querySelectorAll<HTMLElement>(selector);
  if (!els.length) return;

  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-in"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        observer.unobserve(e.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  els.forEach((el) => observer.observe(el));
}
