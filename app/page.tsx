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
import { Library } from "@/components/library";
export default function Home() {
  return (
    <>
      <Hero />
      <Library featured />
      <section className="method-section shell">
        <div className="section-heading">
          <div>
            <span className="section-index">02 / LESS GUESSWORK</span>
            <h2>
              Know what’s ahead.
              <br />
              <span className="muted">Before you write the code.</span>
            </h2>
          </div>
          <Link className="text-link" href="/methodology">
            Behind the research <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="method-layout">
          <div className="journey-art">
            <Image
              src="/images/oauth-milestones.png"
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
      <section className="evidence-band">
        <div className="shell">
          <div>
            <span className="section-index">BUILT ON EVIDENCE</span>
            <h2>
              Confidence comes
              <br />
              with a source.
            </h2>
            <p>
              Open the evidence behind the guidance.
              <br />
              No invented approval dates. No hidden unknowns.
            </p>
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
      <section className="final-cta shell">
        <span className="section-index">YOUR NEXT INTEGRATION</span>
        <h2>
          Not in the library?
          <br />
          <em>Let’s map it.</em>
        </h2>
        <p>
          Give the agent an app name or website.
          <br />
          Get a guide you can follow—and forward.
        </p>
        <Link href="/generate" className="btn btn-primary">
          Generate a guide <ArrowRight size={18} />
        </Link>
      </section>
    </>
  );
}
