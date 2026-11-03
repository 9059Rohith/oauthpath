"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  LoaderCircle,
  Search,
  ScanLine,
  BookOpen,
  ShieldCheck,
  Link2,
  CircleAlert,
  Square,
} from "lucide-react";
import {
  isGuideSlug,
  ResearchStreamDecoder,
  type ResearchProgress,
} from "@/lib/agent/stream";
const stages = [
  { key: "discover", label: "Find the official path", icon: Search },
  { key: "fetch", label: "Read the documentation", icon: BookOpen },
  { key: "synthesize", label: "Build the launch guide", icon: ScanLine },
  { key: "verify", label: "Check the evidence", icon: ShieldCheck },
  { key: "save", label: "Make it shareable", icon: Link2 },
];
export function Generator({
  initial = "",
  refresh = false,
}: {
  initial?: string;
  refresh?: boolean;
}) {
  const [query, setQuery] = useState(initial);
  const [audience, setAudience] = useState<"pilot" | "public" | "internal">(
    "public",
  );
  const [capability, setCapability] = useState("");
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState<ResearchProgress[]>([]);
  const [error, setError] = useState("");
  const [finished, setFinished] = useState("");
  const controller = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      controller.current?.abort();
    };
  }, []);
  const router = useRouter();
  async function run() {
    if (!query.trim() || running || controller.current) return;
    setRunning(true);
    setEvents([]);
    setError("");
    setFinished("");
    const active = new AbortController();
    controller.current = active;
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, refresh, audience, capability }),
        signal: active.signal,
      });
      if (response.headers.get("content-type")?.includes("application/json")) {
        const data = await response.json();
        if (!mounted.current) return;
        if (!response.ok) throw new Error(data.error);
        if (isGuideSlug(data.slug)) {
          router.push(`/guide/${data.slug}`);
          return;
        }
        throw new Error(
          "The server did not return a valid guide. Please try again.",
        );
      }
      if (!response.ok || !response.body)
        throw new Error("Research could not start. Please try again.");
      if (!response.headers.get("content-type")?.includes("text/event-stream"))
        throw new Error(
          "The research service returned an unexpected response. Please try again.",
        );
      reader = response.body.getReader();
      const decoder = new ResearchStreamDecoder();
      let completed = false;
      while (true) {
        const { value, done } = await reader.read();
        if (!mounted.current) return;
        if (done) break;
        for (const event of decoder.push(value)) {
          if (event.type === "progress")
            setEvents((list) => [...list, event.data]);
          if (event.type === "error") throw new Error(event.message);
          if (event.type === "complete") {
            completed = true;
            setFinished(event.slug);
            setEvents((list) => [
              ...list,
              {
                stage: "done",
                message:
                  event.mode === "document-scan"
                    ? "Your public-document scan is saved. Requirements that need confirmation are marked unknown."
                    : "Your source-backed guide is ready.",
              },
            ]);
          }
        }
        if (completed) break;
      }
      decoder.finish();
    } catch (e) {
      if (!mounted.current) return;
      if (e instanceof Error && e.name === "AbortError")
        setError(
          "Research stopped. You can start a new scan whenever you’re ready.",
        );
      else
        setError(
          e instanceof Error
            ? e.message
            : "Something went wrong. Please retry.",
        );
    } finally {
      await reader?.cancel().catch(() => {});
      reader?.releaseLock();
      if (controller.current === active) controller.current = null;
      if (mounted.current) setRunning(false);
    }
  }
  const current = events.at(-1)?.stage;
  const currentIndex = stages.findIndex((s) => s.key === current);
  return (
    <div className="generator shell">
      <div className="generator-heading">
        <span className="section-index">LIVE RESEARCH</span>
        <h1>
          One app.
          <br />
          <em>A path worth knowing.</em>
        </h1>
        <p>
          Find the requirements, surface the blockers, and leave with a guide
          you can share.
        </p>
      </div>
      <form
        className="app-search generate-search"
        onSubmit={(e) => {
          e.preventDefault();
          void run();
        }}
      >
        <Search size={21} />
        <label className="sr-only" htmlFor="research-query">
          App name or public website
        </label>
        <input
          id="research-query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="App name or public documentation URL"
          maxLength={180}
          required
          disabled={running}
        />
        <button type="submit" disabled={running} aria-label="Start research">
          {running ? (
            <LoaderCircle className="spin" size={20} />
          ) : (
            <ArrowRight size={22} />
          )}
        </button>
      </form>
      <div className="generator-note">
        <ShieldCheck size={14} />
        <span>
          Public sources only. No credentials needed. Generated guides are
          accessible to anyone with their link.
        </span>
      </div>
      <details className="scenario-controls">
        <summary>Tailor this guide</summary>
        <p>
          Describe public product information only. Do not include secrets,
          credentials, or private customer data.
        </p>
        <div className="scenario-fields">
          <label htmlFor="research-audience">Who will connect the app?</label>
          <select
            id="research-audience"
            value={audience}
            disabled={running}
            onChange={(event) =>
              setAudience(event.target.value as "pilot" | "public" | "internal")
            }
          >
            <option value="public">External users — public launch</option>
            <option value="pilot">A limited pilot or test group</option>
            <option value="internal">People in my own organization</option>
          </select>
          <label htmlFor="research-capability">
            What should your integration do? <span>(optional)</span>
          </label>
          <textarea
            id="research-capability"
            value={capability}
            onChange={(event) => setCapability(event.target.value)}
            maxLength={240}
            rows={2}
            disabled={running}
            placeholder="Read calendar events, create tasks…"
          />
        </div>
      </details>
      <div className="research-workspace">
        <aside className="research-stages">
          <span className="section-index">THE RESEARCH PATH</span>
          {stages.map((s, i) => (
            <div
              className={`research-stage ${running && current === s.key ? "active" : ""} ${finished || currentIndex > i ? "done" : ""}`}
              key={s.key}
            >
              <span>
                {finished || currentIndex > i ? (
                  <Check size={17} />
                ) : (
                  <s.icon size={17} />
                )}
              </span>
              <div>
                <strong>{s.label}</strong>
                <small>
                  {finished || currentIndex > i
                    ? "Complete"
                    : error && i === Math.max(0, currentIndex)
                      ? "Stopped"
                      : running && current === s.key
                        ? "In progress"
                        : "Waiting"}
                </small>
              </div>
            </div>
          ))}
          {running && (
            <button
              onClick={() => controller.current?.abort()}
              className="btn btn-ghost"
            >
              <Square size={13} /> Stop research
            </button>
          )}
        </aside>
        <section className="research-feed" aria-label="Research activity">
          <div className="feed-header">
            <span>
              <i className={running ? "live-dot" : ""} />
              {running
                ? "Research in progress"
                : finished
                  ? "Research complete"
                  : error
                    ? "Research stopped"
                    : "Ready when you are"}
            </span>
            <span className="mono">ACTIVITY LOG</span>
          </div>
          <div className="feed-content" aria-live="polite">
            {events.length === 0 && !error && (
              <div className="feed-empty">
                <ScanLine size={35} strokeWidth={1} />
                <h3>Watch the evidence come together.</h3>
                <p>
                  Actual source retrieval and research events will appear here
                  as they happen.
                </p>
                <div className="try-links">
                  <span>Try an app outside the library</span>
                  {["Linear", "Dropbox", "HubSpot"].map((app) => (
                    <button key={app} onClick={() => setQuery(app)}>
                      {app}
                      <ArrowUpRight size={12} />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {events.map((e, i) => (
              <div className="feed-event" key={i}>
                <span className="event-index">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p>{e.message}</p>
                  {e.url && (
                    <a href={e.url} target="_blank" rel="noopener noreferrer">
                      {new URL(e.url).hostname}
                      <ArrowUpRight size={12} />
                    </a>
                  )}
                </div>
                {e.status && <span className="http-status">{e.status}</span>}
              </div>
            ))}
            {running && (
              <div className="feed-working">
                <LoaderCircle size={15} className="spin" /> Checking the next
                source…
              </div>
            )}
            {error && (
              <div className="research-error" role="alert">
                <CircleAlert size={20} />
                <div>
                  <h3>We hit a stopping point.</h3>
                  <p>{error}</p>
                  <button onClick={() => void run()} className="text-link">
                    Try again <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
            {finished && (
              <div className="research-success">
                <Check size={24} />
                <h3>Your guide is ready.</h3>
                <p>
                  Sources, observations, and open questions—saved in one place.
                </p>
                <a href={`/guide/${finished}`} className="btn btn-primary">
                  Open your guide <ArrowRight size={17} />
                </a>
              </div>
            )}
          </div>
        </section>
      </div>
      <p className="generation-disclosure">
        If AI synthesis is unavailable, a public-document scan can still inspect
        a website and save its sources. That mode labels unverified setup and
        approval requirements as unknown.
      </p>
    </div>
  );
}
