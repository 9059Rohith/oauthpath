import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { AppSearch } from "./search";
export function Hero() {
  return (
    <section className="hero shell">
      <div className="hero-art">
        <Image
          src="/images/oauth-gateway.png"
          alt=""
          fill
          preload
          sizes="(max-width: 760px) 100vw, 75vw"
        />
      </div>
      <div className="hero-copy">
        <h1>
          <span className="headline-line">Every app.</span>
          <span className="headline-line">
            A <em>clear path</em>
          </span>
          <span className="headline-line">to launch.</span>
        </h1>
        <p>
          OAuth setup, approval requirements, and the next step.
          <br className="desktop-break" /> Researched by agents. Grounded in
          sources.
        </p>
        <AppSearch />
        <div className="suggestions">
          <span>Start with</span>
          {["GitHub", "Slack", "Google"].map((name) => (
            <Link key={name} href={`/guide/${name.toLowerCase()}`}>
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
    </section>
  );
}
