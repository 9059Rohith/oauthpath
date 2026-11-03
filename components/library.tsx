"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { guides } from "@/lib/catalog";
import { GuideCard } from "./guide-card";
export function Library({ featured = false }: { featured?: boolean }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All apps");
  const options = [
    "All apps",
    "Straightforward",
    "Some setup",
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
          <Link prefetch={false} href="/library" className="text-link">
            Explore all {guides.length} guides <ArrowUpRight size={16} />
          </Link>
        ) : (
          <span
            className="count-label"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {filtered.length} researched guides
          </span>
        )}
      </div>
      {!featured && (
        <div className="library-controls">
          <div className="filter-tabs" role="group" aria-label="Filter guides">
            {options.map((f) => (
              <button
                key={f}
                className={filter === f ? "selected" : ""}
                aria-pressed={filter === f}
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
            prefetch={false}
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
