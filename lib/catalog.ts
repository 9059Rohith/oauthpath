import catalog from "@/content/catalog.json";
import type { Guide } from "./schema";

/** Static card/search data: no guide bodies or runtime validation in client bundles. */
export type GuideSummary = Pick<
  Guide,
  | "slug"
  | "name"
  | "domain"
  | "category"
  | "color"
  | "summary"
  | "difficulty"
  | "effort"
>;
export const guides = catalog as GuideSummary[];

export function findSeed(query: string): GuideSummary | undefined {
  const normalized = query
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
  return guides.find((guide) =>
    [guide.slug, guide.name.toLowerCase(), guide.domain].includes(normalized),
  );
}
