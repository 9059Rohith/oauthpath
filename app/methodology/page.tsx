import Link from "next/link";
import { ArrowRight } from "lucide-react";
export const metadata = { title: "How the research works" };
export default function Methodology() {
  return (
    <article className="methodology shell">
      <span className="section-index">OUR METHODOLOGY</span>
      <h1>
        Useful guidance.
        <br />
        <em>Honest boundaries.</em>
      </h1>
      <p className="lead">
        OAuthPath helps you understand the path to an integration before you
        commit to it. Evidence should be easy to inspect, and unknowns should be
        impossible to miss.
      </p>
      <section>
        <h2>Three approvals that are easy to confuse</h2>
        <div className="split-grid">
          <div>
            <h3>Provider review</h3>
            <p>
              The provider may review your use case, scopes, branding, security,
              or distribution before allowing public use.
            </p>
          </div>
          <div>
            <h3>Organization approval</h3>
            <p>
              A customer’s administrator may need to allow your app, even after
              the provider has approved it.
            </p>
          </div>
          <div>
            <h3>User consent</h3>
            <p>
              An individual authorizes access to their data. A successful
              consent flow does not establish public-launch readiness.
            </p>
          </div>
        </div>
      </section>
      <section>
        <h2>How a guide is researched</h2>
        <ol>
          <li>
            <strong>Discover.</strong> Identify official developer documentation
            relevant to your app and use case.
          </li>
          <li>
            <strong>Retrieve.</strong> Fetch public pages through a restricted
            HTTPS client. Record URLs, status, and timestamps.
          </li>
          <li>
            <strong>Synthesize.</strong> When AI is available, build a
            structured guide from the retrieved sources.
          </li>
          <li>
            <strong>Verify.</strong> Validate the schema, citation IDs,
            supporting excerpts, and approval claims.
          </li>
          <li>
            <strong>Share.</strong> Save the result before showing its permanent
            link.
          </li>
        </ol>
      </section>
      <section>
        <h2>What the labels mean</h2>
        <p>
          <strong>Documented</strong> means provider documentation supports the
          statement. <strong>Inferred</strong> means a planning assumption or
          interpretation. <strong>Unknown</strong> means we could not confirm
          the answer. A source link is evidence to inspect, not an infallibility
          guarantee.
        </p>
        <p>
          <strong>Observed HTTP checks</strong> show that a public document
          responded. They do not demonstrate app registration, token exchange,
          access to user data, provider review, or successful approval.
        </p>
        <p>
          Library guides were researched from public documentation on November
          3, 2026. No authenticated setup was performed for those guides.
          Personal checklists remain in your browser; checking a box does not
          change the research evidence.
        </p>
      </section>
      <section>
        <h2>Time estimates and difficulty</h2>
        <p>
          Hands-on effort is a labeled planning estimate. Provider waiting time
          is separate and remains unknown when no reliable timeline is
          available. Difficulty is a qualitative description of the process—not
          a conversion into a promised launch date.
        </p>
        <p>
          Requirements depend on the scopes, audience, app model, data handling,
          and distribution scenario shown in each guide. Recheck official
          sources before a production submission.
        </p>
      </section>
      <section>
        <h2>When full AI research is unavailable</h2>
        <p>
          A public-document scan follows relevant links from a supplied website
          and records short OAuth-related excerpts. It identifies source
          material and next research steps. It does not produce a verified
          approval plan or infer undocumented technical details. The result is
          explicitly labeled and saved with its limitations.
        </p>
      </section>
      <section>
        <h2>Your data and control</h2>
        <p>
          Do not enter credentials, confidential URLs, or private business
          details. Research accepts app names and public websites. Generated
          guides are unlisted and excluded from search indexing, but anyone with
          the link can read them. The site stores public guide content and
          bounded quota records. It does not store OAuth secrets or customer
          access tokens.
        </p>
        <p>
          The agent can research and prepare guidance. Account ownership,
          consent, identity checks, payment, legal commitments, and submission
          decisions remain with you.
        </p>
      </section>
      <Link className="btn btn-primary" href="/generate">
        Research your next app <ArrowRight size={17} />
      </Link>
    </article>
  );
}
