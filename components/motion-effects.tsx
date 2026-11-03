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
    let pointerX = 0;
    let pointerY = 0;
    let hasPointer = false;
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
      const amplitude = window.innerWidth < 760 ? 0.28 : 1;
      const x = hasPointer
        ? Math.max(
            -1,
            Math.min(1, ((pointerX - bounds.left) / bounds.width) * 2 - 1),
          )
        : 0;
      const y = hasPointer
        ? Math.max(
            -1,
            Math.min(1, ((pointerY - bounds.top) / bounds.height) * 2 - 1),
          )
        : 0;
      const scroll = Math.max(0, Math.min(bounds.height, -bounds.top));
      element.style.setProperty("--scene-x", `${x * 18 * amplitude}px`);
      element.style.setProperty(
        "--scene-y",
        `${(scroll * 0.17 + y * 11) * amplitude}px`,
      );
      element.style.setProperty(
        "--scene-rotate-x",
        `${-y * 1.3 * amplitude}deg`,
      );
      element.style.setProperty(
        "--scene-rotate-y",
        `${x * 1.6 * amplitude}deg`,
      );
      element.style.setProperty("--orbit-x", `${x * -24 * amplitude}px`);
    };
    const schedule = () => {
      if (!frame && !reduced.matches)
        frame = window.requestAnimationFrame(paint);
    };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      hasPointer = true;
      schedule();
    };
    const onLeave = () => {
      hasPointer = false;
      schedule();
    };
    const onPreference = () => {
      element.dataset.motion = reduced.matches ? "reduced" : "enabled";
      if (reduced.matches) {
        window.cancelAnimationFrame(frame);
        frame = 0;
        for (const name of [
          "--scene-x",
          "--scene-y",
          "--scene-rotate-x",
          "--scene-rotate-y",
          "--orbit-x",
        ])
          element.style.removeProperty(name);
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
    element.addEventListener("pointermove", onPointer, { passive: true });
    element.addEventListener("pointerleave", onLeave, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    reduced.addEventListener("change", onPreference);
    onPreference();
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      element.removeEventListener("pointermove", onPointer);
      element.removeEventListener("pointerleave", onLeave);
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
