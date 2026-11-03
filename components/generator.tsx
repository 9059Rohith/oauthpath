"use client";
import { useRef, useState } from "react";
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
import type { ResearchEvent } from "@/lib/agent/research";
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
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState<ResearchEvent[]>([]);
  const [error, setError] = useState("");
  const [finished, setFinished] = useState("");
  const controller = useRef<AbortController | null>(null);
  const router = useRouter();
  async function run() {
    if (!query.trim() || running) return;
    setRunning(true);
    setEvents([]);
    setError("");
    setFinished("");
    controller.current = new AbortController();
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, refresh }),
        signal: controller.current.signal,
      });
      if (response.headers.get("content-type")?.includes("application/json")) {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (data.slug) {
          router.push(`/guide/${data.slug}`);
          return;
        }
      }
      if (!response.ok || !response.body)
        throw new Error("Research could not start. Please try again.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let boundary;
        while ((boundary = buffer.indexOf("\n\n")) >= 0) {
          const chunk = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          const event = chunk
            .split("\n")
            .find((l) => l.startsWith("event: "))
            ?.slice(7);
          const raw = chunk
            .split("\n")
            .find((l) => l.startsWith("data: "))
            ?.slice(6);
          if (!raw) continue;
          const data = JSON.parse(raw);
          if (event === "progress") setEvents((list) => [...list, data]);
          if (event === "error") throw new Error(data.message);
          if (event === "complete") {
            setFinished(data.slug);
            setEvents((list) => [
              ...list,
              {
                stage: "done",
                message:
                  data.mode === "document-scan"
                    ? "Your public-document scan is saved. Requirements that need confirmation are marked unknown."
                    : "Your source-backed guide is ready.",
              },
            ]);
          }
        }
      }
    } catch (e) {
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
      setRunning(false);
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
      <div className="research-workspace">
        <aside className="research-stages">
          <span className="section-index">THE RESEARCH PATH</span>
          {stages.map((s, i) => (
            <div
              className={`research-stage ${current === s.key ? "active" : ""} ${finished || currentIndex > i ? "done" : ""}`}
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
                    : current === s.key
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
