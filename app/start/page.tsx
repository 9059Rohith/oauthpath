import Link from "next/link";
import { ArrowRight, Building2, KeyRound, UserRound } from "lucide-react";
import { RoutePlanner } from "@/components/route-planner";

export const metadata = {
  title: "Choose your OAuth path",
  description:
    "Understand provider OAuth apps, user connections, and managed versus custom registration before you start.",
};

export default function StartPage() {
  return (
    <article className="start-page shell">
      <header className="start-heading">
        <span className="section-index">START WITH THE RIGHT QUESTION</span>
        <h1>
          Do you need to
          <br />
          <em>register an app?</em>
        </h1>
        <p className="lead">
          Connecting a user and registering an OAuth app are different jobs.
          Choose the ownership path before spending time on provider setup.
        </p>
      </header>
      <section aria-labelledby="oauth-model-heading" className="oauth-model">
        <h2 id="oauth-model-heading">
          One app registration. Many user connections.
        </h2>
        <div className="oauth-model-flow">
          <div>
            <Building2 size={23} aria-hidden="true" />
            <h3>Your integration</h3>
            <p>
              Your agent or application asks to access a provider on a user’s
              behalf.
            </p>
          </div>
          <ArrowRight className="model-arrow" aria-hidden="true" />
          <div>
            <KeyRound size={23} aria-hidden="true" />
            <h3>Provider OAuth app</h3>
            <p>
              The registered identity: client ID, allowed redirects,
              permissions, and any applicable review. You or a managed service
              owns it.
            </p>
          </div>
          <ArrowRight className="model-arrow" aria-hidden="true" />
          <div>
            <UserRound size={23} aria-hidden="true" />
            <h3>Each user’s connection</h3>
            <p>
              The user signs in and grants access. Their tokens represent that
              authorization; they are separate from app credentials.
            </p>
          </div>
        </div>
        <p className="muted">
          A registered app does not mean every user is connected. A successful
          test connection does not establish public-launch approval.
        </p>
      </section>
      <RoutePlanner />
      <section
        className="start-boundaries"
        aria-labelledby="still-applies-heading"
      >
        <h2 id="still-applies-heading">What still needs your attention</h2>
        <div className="split-grid">
          <div>
            <span className="eyebrow">Provider</span>
            <h3>Permission to distribute</h3>
            <p>
              Review and distribution requirements depend on the provider,
              requested access, and app model. Marketplace listing can be a
              separate route.
            </p>
          </div>
          <div>
            <span className="eyebrow">Customer</span>
            <h3>Organization controls</h3>
            <p>
              A customer administrator can still restrict installation or
              require approval, even when a provider permits the app.
            </p>
          </div>
          <div>
            <span className="eyebrow">User</span>
            <h3>Account authorization</h3>
            <p>
              Users still grant access to their accounts. Managed registration
              does not bypass their consent or account policies.
            </p>
          </div>
        </div>
      </section>
      <footer className="start-source">
        <p>
          Ownership guidance is based on{" "}
          <a
            href="https://docs.composio.dev/toolkits/managed-auth"
            target="_blank"
            rel="noopener noreferrer"
          >
            Composio’s managed OAuth documentation
          </a>
          , reviewed 3 November 2026. Provider-specific setup and distribution
          claims belong in the source-linked guides.
        </p>
        <Link prefetch={false} href="/methodology" className="text-link">
          How we handle evidence <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </footer>
    </article>
  );
}
