"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/** Event-driven animation: one queued frame, no perpetual JavaScript render loop. */
export function HeroScene({ children }: { children: ReactNode }) {
  const scene = useRef<HTMLElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = scene.current;
    if (!element) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = true;
    const paint = () => {
      frame = 0;
      if (reduced.matches) return;
      const distance = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      progress.current?.style.setProperty(
        "transform",
        `scaleX(${Math.min(1, Math.max(0, window.scrollY / distance))})`,
      );
      if (!visible) return;
      const bounds = element.getBoundingClientRect();
      // Artwork moves only vertically; the page and typography remain level.
      const limit = window.innerWidth < 760 ? 25 : 60;
      const travelled = Math.max(0, -bounds.top);
      element.style.setProperty(
        "--scene-y",
        `${Math.min(limit, travelled * (window.innerWidth < 760 ? 0.09 : 0.22))}px`,
      );
    };
    const schedule = () => {
      if (!frame && !reduced.matches)
        frame = window.requestAnimationFrame(paint);
    };
    const onPreference = () => {
      element.dataset.motion = reduced.matches ? "reduced" : "enabled";
      if (reduced.matches) {
        window.cancelAnimationFrame(frame);
        frame = 0;
        element.style.removeProperty("--scene-y");
      } else schedule();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        element.dataset.sceneActive = String(visible);
        if (visible) schedule();
      },
      { rootMargin: "80px" },
    );
    observer.observe(element);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    reduced.addEventListener("change", onPreference);
    onPreference();
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduced.removeEventListener("change", onPreference);
    };
  }, []);
  return (
    <>
      <div className="page-scroll-track" aria-hidden="true">
        <div ref={progress} className="page-scroll-progress" />
      </div>
      <section
        ref={scene}
        className="hero hero-cinematic shell"
        data-scene-active="true"
      >
        {children}
      </section>
    </>
  );
}

/** Content stays visible without JavaScript and with reduced-motion enabled. */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const node = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = node.current;
    if (
      !element ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    if (element.getBoundingClientRect().top < window.innerHeight * 0.93) return;
    element.dataset.reveal = "waiting";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          element.dataset.reveal = "visible";
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={node}
      className={`motion-reveal ${className}`}
      style={
        {
          "--reveal-delay": `${Math.max(0, Math.min(delay, 500))}ms`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
