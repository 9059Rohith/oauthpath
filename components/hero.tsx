import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { AppSearch } from "./search";
import { HeroScene } from "./motion-effects";
import "@/app/motion.css";

function Word({
  children,
  delay,
  accent = false,
}: {
  children: string;
  delay: number;
  accent?: boolean;
}) {
  return (
    <span className="word-mask">
      <span
        className={`motion-word${accent ? " headline-glow" : ""}`}
        style={{ "--word-delay": `${delay}ms` } as CSSProperties}
      >
        {children}
      </span>
    </span>
  );
}

export function Hero() {
  return (
    <HeroScene>
      <div className="hero-art" aria-hidden="true">
        <div className="hero-art-visual">
          <Image
            src="/images/oauth-cosmos-v2.png"
            alt=""
            fill
            preload
            fetchPriority="high"
            sizes="100vw"
          />
        </div>
        <div className="hero-scrim" />
        <div className="hero-orbits">
          <i className="orbital-ring orbit-one" />
          <i className="orbital-ring orbit-two" />
          <span className="orbital-light orbit-light-cyan" />
          <span className="orbital-light orbit-light-amber" />
        </div>
        <svg
          className="hero-routes"
          viewBox="0 0 1400 760"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <path
            className="route-underlay"
            d="M460 680C650 680 690 580 830 580S1060 420 1350 420"
          />
          <path
            className="route-trace route-cyan"
            d="M460 680C650 680 690 580 830 580S1060 420 1350 420"
          />
          <path
            className="route-underlay"
            d="M730 720C850 650 900 680 1000 570S1120 220 1420 180"
          />
          <path
            className="route-trace route-amber"
            d="M730 720C850 650 900 680 1000 570S1120 220 1420 180"
          />
          <circle className="route-node node-one" cx="830" cy="580" r="4" />
          <circle className="route-node node-two" cx="1000" cy="570" r="3" />
        </svg>
      </div>
      <div className="hero-copy">
        <h1 aria-label="Every app. A clear path to launch.">
          <span aria-hidden="true" className="headline-line">
            <Word delay={60}>Every</Word> <Word delay={150}>app.</Word>
          </span>
          <span aria-hidden="true" className="headline-line">
            <Word delay={240}>A</Word>{" "}
            <Word delay={330} accent>
              clear
            </Word>{" "}
            <Word delay={420} accent>
              path
            </Word>
          </span>
          <span aria-hidden="true" className="headline-line">
            <Word delay={510}>to</Word> <Word delay={600}>launch.</Word>
          </span>
        </h1>
        <p>
          OAuth setup, approval requirements, and the next step.
          <br className="desktop-break" /> Researched by agents. Grounded in
          sources.
        </p>
        <div className="hero-search-frame">
          <AppSearch />
        </div>
        <div className="suggestions">
          <span>Start with</span>
          {["GitHub", "Slack", "Google"].map((name) => (
            <Link
              prefetch={false}
              key={name}
              href={`/guide/${name.toLowerCase()}`}
            >
              {name}
              <ArrowUpRight size={12} />
            </Link>
          ))}
        </div>
      </div>
      <div className="hero-foot">
        <span>
          <Check size={14} /> Every claim has a trail.
        </span>
        <span>
          Documentation, observations, and uncertainty—clearly separated.
        </span>
      </div>
    </HeroScene>
  );
}
