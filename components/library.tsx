"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Clock3,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { guides, type GuideSummary } from "@/lib/catalog";
export function AppMark({ guide }: { guide: GuideSummary }) {
  return (
    <span
      className={`app-mark mark-${guide.slug}`}
      style={{ "--app-color": guide.color } as React.CSSProperties}
    >
      {guide.name === "Google" ? (
        "G"
      ) : guide.name === "GitHub" ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 .9a11.1 11.1 0 0 0-3.5 21.6c.6.1.8-.2.8-.5v-2.1c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.7.4-1.2.8-1.5-2.6-.3-5.4-1.3-5.4-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0C17.3 4.4 18.3 4.7 18.3 4.7c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.4 5.7.4.4.8 1.1.8 2.2V22c0 .3.2.6.8.5A11.1 11.1 0 0 0 12 .9Z"
          />
        </svg>
      ) : guide.name === "Slack" ? (
        "#"
      ) : (
        guide.name.slice(0, 1)
      )}
    </span>
  );
}
export function GuideCard({ guide: g }: { guide: GuideSummary }) {
  const level = ["Straightforward", "Some setup"].includes(g.difficulty)
    ? "easy"
    : g.difficulty === "Access gated"
      ? "gated"
      : "review";
  return (
    <Link href={`/guide/${g.slug}`} className="guide-card">
      <div className="card-top">
        <AppMark guide={g} />
        <span className={`difficulty ${level}`}>
          <i />
          {g.difficulty}
        </span>
      </div>
      <h3>
        {g.name}
        <ArrowUpRight size={18} />
      </h3>
      <p>{g.summary}</p>
      <div className="card-meta">
        <span>
          <Clock3 size={14} />
          {g.effort.split("·")[0].trim()}
        </span>
        <span className="muted">Planning estimate</span>
      </div>
      <div className="card-bottom">
        <span>View launch guide</span>
        <ArrowRight size={17} />
      </div>
    </Link>
  );
}
export function Library({ featured = false }: { featured?: boolean }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All apps");
  const options = [
    "All apps",
    "Straightforward",
    "Review required",
    "Access gated",
  ];
  const filtered = guides.filter(
    (g) =>
      `${g.name} ${g.category}`.toLowerCase().includes(query.toLowerCase()) &&
      (filter === "All apps" || g.difficulty === filter),
  );
  const ordered = featured
    ? ["github", "slack", "google", "notion", "linkedin", "shopify"]
        .map((s) => guides.find((g) => g.slug === s)!)
        .filter(Boolean)
    : filtered;
  return (
    <section id="library" className="library-section shell">
      <div className="section-heading">
        <div>
          <span className="section-index">01 / THE LIBRARY</span>
          <h2>
            {featured
              ? "Find your next integration."
              : "The integration library."}
          </h2>
          <p className="muted">
            Different apps. Different rules. One clear starting point.
          </p>
        </div>
        {featured ? (
          <Link href="/library" className="text-link">
            Explore all {guides.length} guides <ArrowUpRight size={16} />
          </Link>
        ) : (
          <span className="count-label">
            {filtered.length} researched guides
          </span>
        )}
      </div>
      {!featured && (
        <div className="library-controls">
          <div className="filter-tabs" aria-label="Filter guides">
            {options.map((f) => (
              <button
                key={f}
                className={filter === f ? "selected" : ""}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <label className="filter-search">
            <Search size={16} />
            <input
              aria-label="Filter by app name"
              placeholder="Filter apps…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <SlidersHorizontal size={15} />
          </label>
        </div>
      )}
      <div className="guide-grid">
        {ordered.map((g) => (
          <GuideCard guide={g} key={g.slug} />
        ))}
      </div>
      {ordered.length === 0 && (
        <div className="empty-state">
          <h3>No guide here yet.</h3>
          <p>Let the research agent investigate it.</p>
          <Link
            className="btn btn-primary"
            href={`/generate?q=${encodeURIComponent(query)}`}
          >
            Research this app <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </section>
  );
}
