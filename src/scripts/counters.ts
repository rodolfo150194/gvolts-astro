/**
 * Los contadores [data-count] suben como una aguja que se asienta. Respeta
 * `prefers-reduced-motion`: en ese caso el valor final queda tal cual.
 */
export function initCounters(selector = "[data-count]", duration = 1600) {
  const counters = document.querySelectorAll<HTMLElement>(selector);
  if (!counters.length || !("IntersectionObserver" in window)) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target as HTMLElement;
      observer.unobserve(el);

      const end = Number(el.dataset.count);
      if (reduce || Number.isNaN(end)) return;

      const decimals = Number.isInteger(end) ? 0 : 1;
      const start = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - k, 4);
        el.textContent = (end * eased).toFixed(decimals);
        if (k < 1) requestAnimationFrame(step);
      };
      el.textContent = "0";
      requestAnimationFrame(step);
    });
  });
  counters.forEach((c) => observer.observe(c));
}
