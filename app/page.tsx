import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  BookOpen,
  ScanLine,
  CircleHelp,
  ArrowRight,
} from "lucide-react";
import { Hero } from "@/components/hero";
import { FeaturedLibrary } from "@/components/featured-library";
import { Reveal } from "@/components/motion-effects";
import { ScrollHeading } from "@/components/scroll-heading";
import { ScrollChoreography } from "@/components/scroll-choreography";
import { ProviderMarquee } from "@/components/provider-marquee";
export default function Home() {
  return (
    <>
      <Hero />
      <div className="ownership-entry shell">
        <div className="ownership-art" aria-hidden="true">
          <Image src="/images/oauth-gateway.png" alt="" fill sizes="180px" />
        </div>
        <div>
          <span className="eyebrow">BEFORE YOU REGISTER</span>
          <p>You may be able to use a managed OAuth app.</p>
        </div>
        <Link prefetch={false} href="/start" className="text-link">
          Choose your path <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <ProviderMarquee />
      <Reveal>
        <FeaturedLibrary />
      </Reveal>
      <Reveal>
        <section className="method-section shell" data-scroll-scene>
          <div className="section-heading">
            <div>
              <span className="section-index">02 / LESS GUESSWORK</span>
              <ScrollHeading
                lines={["Know what’s ahead.", "Before you write the code."]}
                accentLast
              />
            </div>
            <Link prefetch={false} className="text-link" href="/methodology">
              Behind the research <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="method-layout">
            <div className="journey-art section-parallax">
              <Image
                src="/images/oauth-route-v2.png"
                alt=""
                fill
                sizes="(max-width: 760px) 100vw, 50vw"
              />
            </div>
            <div className="method-steps">
              {[
                [
                  "01",
                  "Find the right route",
                  "Internal use, a customer pilot, or a public launch? Your scenario changes the requirements.",
                ],
                [
                  "02",
                  "Separate work from waiting",
                  "See hands-on effort alongside provider review, with uncertainty kept visible.",
                ],
                [
                  "03",
                  "Take the next step",
                  "Follow an actionable checklist. Know what the agent can prepare and where you take over.",
                ],
              ].map(([n, title, body]) => (
                <div key={n}>
                  <span>{n}</span>
                  <article>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>
      <Reveal>
        <section className="evidence-band" data-scroll-scene>
          <div className="shell">
            <div>
              <span className="section-index">BUILT ON EVIDENCE</span>
              <ScrollHeading
                lines={["Confidence comes", "with a source."]}
                accentLast
              />
              <p>
                Open the evidence behind the guidance.
                <br />
                No invented approval dates. No hidden unknowns.
              </p>
              <div
                className="evidence-section-art section-parallax"
                aria-hidden="true"
              >
                <Image
                  src="/images/oauth-evidence-v3.png"
                  alt=""
                  fill
                  sizes="(max-width: 760px) 100vw, 45vw"
                />
              </div>
            </div>
            <div className="evidence-explainer">
              <article>
                <ScanLine />
                <div>
                  <h3>Observed</h3>
                  <p>
                    A real HTTP check, with a timestamp. Never a claim of
                    approval.
                  </p>
                </div>
              </article>
              <article>
                <BookOpen />
                <div>
                  <h3>Documented</h3>
                  <p>
                    Supported by provider documentation you can read yourself.
                  </p>
                </div>
              </article>
              <article>
                <CircleHelp />
                <div>
                  <h3>Estimated or unknown</h3>
                  <p>
                    Planning assumptions are labeled. Missing answers stay
                    visible.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>
      </Reveal>
      <Reveal>
        <section className="final-cta shell" data-scroll-scene>
          <div className="cta-section-art section-parallax" aria-hidden="true">
            <Image
              src="/images/oauth-horizon-v3.png"
              alt=""
              fill
              sizes="100vw"
            />
          </div>
          <div className="cta-section-scrim" aria-hidden="true" />
          <div className="cta-section-copy">
            <span className="section-index">YOUR NEXT INTEGRATION</span>
            <ScrollHeading
              lines={["Not in the library?", "Let’s map it."]}
              accentLast
            />
            <p>
              Give the agent an app name or website.
              <br />
              Get a guide you can follow—and forward.
            </p>
            <Link prefetch={false} href="/generate" className="btn btn-primary">
              Generate a guide <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </Reveal>
      <ScrollChoreography />
    </>
  );
}
