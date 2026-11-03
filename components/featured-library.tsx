import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { guides } from "@/lib/catalog";
import { GuideCard } from "./guide-card";

const featuredSlugs = [
  "github",
  "slack",
  "google",
  "notion",
  "linkedin",
  "shopify",
];

/** The home-page preview renders on the server; filtering lives on /library. */
export function FeaturedLibrary() {
  const featured = featuredSlugs.flatMap((slug) => {
    const guide = guides.find((item) => item.slug === slug);
    return guide ? [guide] : [];
  });
  return (
    <section id="library" className="library-section shell">
      <div className="section-heading">
        <div>
          <span className="section-index">01 / THE LIBRARY</span>
          <h2>Find your next integration.</h2>
          <p className="muted">
            Different apps. Different rules. One clear starting point.
          </p>
        </div>
        <Link prefetch={false} href="/library" className="text-link">
          Explore all {guides.length} guides <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="guide-grid">
        {featured.map((guide) => (
          <GuideCard guide={guide} key={guide.slug} />
        ))}
      </div>
    </section>
  );
}
