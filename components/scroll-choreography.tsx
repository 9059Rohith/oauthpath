"use client";

import { useEffect } from "react";

/** Read all active geometry first, then write CSS variables. No React renders per frame. */
export function ScrollChoreography() {
  useEffect(() => {
    const scenes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-scroll-scene]"),
    );
    const active = new Set<HTMLElement>();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const paint = () => {
      frame = 0;
      if (reduced.matches || document.hidden) return;
      const height = window.innerHeight;
      const measurements = [...active].map((element) => ({
        element,
        bounds: element.getBoundingClientRect(),
      }));
      for (const { element, bounds } of measurements) {
        const progress = Math.max(
          0,
          Math.min(1, (height * 0.94 - bounds.top) / (height * 0.55)),
        );
        const depth = Math.max(
          -1,
          Math.min(
            1,
            (height / 2 - bounds.top - Math.min(bounds.height, height) / 2) /
              height,
          ),
        );
        element.style.setProperty("--type-offset", `${(1 - progress) * 25}px`);
        element.style.setProperty(
          "--art-offset",
          `${depth * (window.innerWidth < 760 ? 14 : 32)}px`,
        );
        element.dataset.scrollProgress = progress.toFixed(3);
      }
    };
    const schedule = () => {
      if (!frame && !reduced.matches && !document.hidden)
        frame = requestAnimationFrame(paint);
    };
    const preference = () => {
      if (reduced.matches) {
        cancelAnimationFrame(frame);
        frame = 0;
        scenes.forEach((element) => {
          element.style.removeProperty("--type-offset");
          element.style.removeProperty("--art-offset");
        });
      } else schedule();
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          if (entry.isIntersecting) active.add(element);
          else active.delete(element);
        }
        schedule();
      },
      { rootMargin: "120px" },
    );
    scenes.forEach((element) => observer.observe(element));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    document.addEventListener("visibilitychange", schedule);
    reduced.addEventListener("change", preference);
    preference();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      reduced.removeEventListener("change", preference);
    };
  }, []);
  return null;
}
