"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, ArrowUpRight } from "lucide-react";
import { guides } from "@/lib/catalog";

const phases = [
  "Find the requirements",
  "Understand the wait",
  "Prepare the evidence",
  "Take the next step",
];
export function ProviderMarquee() {
  const [paused, setPaused] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      element.dataset.active = String(entry?.isIntersecting ?? false);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      className="provider-marquee"
      ref={root}
      data-paused={paused}
      data-active="true"
    >
      <div className="marquee-heading shell">
        <p>Eight researched apps. Different paths to launch.</p>
        <button
          type="button"
          onClick={() => setPaused(!paused)}
          aria-pressed={paused}
          aria-label="Pause moving provider list"
        >
          {paused ? (
            <Play size={13} aria-hidden="true" />
          ) : (
            <Pause size={13} aria-hidden="true" />
          )}
          {paused ? "Resume" : "Pause"} motion
        </button>
      </div>
      <div className="marquee-window">
        <div className="marquee-track">
          <ul aria-label="Researched provider guides" className="marquee-group">
            {guides.map((guide) => (
              <li key={guide.slug}>
                <a href={`/guide/${guide.slug}`}>
                  <span
                    className="marquee-dot"
                    style={{ background: guide.color }}
                  />
                  {guide.name}
                  <ArrowUpRight size={20} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <div className="marquee-group marquee-copy" aria-hidden="true">
            {guides.map((guide) => (
              <a key={guide.slug} href={`/guide/${guide.slug}`} tabIndex={-1}>
                <i
                  className="marquee-dot"
                  style={{ background: guide.color }}
                />
                {guide.name}
                <ArrowUpRight size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="marquee-window phase-window" aria-hidden="true">
        <div className="marquee-track phase-track">
          {[0, 1].map((group) => (
            <div className="marquee-group phase-group" key={group}>
              {phases.map((phase) => (
                <span key={phase}>
                  {phase}
                  <i>✳</i>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
