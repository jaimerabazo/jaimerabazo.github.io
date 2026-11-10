"use client";

import { useEffect } from "react";
import Lenis from "lenis";

// Stashed on window so components outside this tree (e.g. the mobile nav
// overlay) can stop/start scrolling without threading the instance through props.
declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export default function SmoothScroll() {
  useEffect(() => {
    // Reduced motion: keep native scrolling and instant anchor jumps.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });
    window.__lenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Intercept anchor clicks for smooth scroll-to
    const handler = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest?.(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      if (!target) return;
      const id = target.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -40, duration: 1.4 });
      // preventDefault skips the native focus move: do it by hand so keyboard
      // and screen-reader users land where the page scrolled to.
      const dest = el as HTMLElement;
      if (!dest.matches("a[href], button, input, select, textarea, [tabindex]")) dest.setAttribute("tabindex", "-1");
      dest.focus({ preventScroll: true });
    };
    document.addEventListener("click", handler);

    return () => {
      document.removeEventListener("click", handler);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  return null;
}
