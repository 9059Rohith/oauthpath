import seeds from "@/content/seeds.json";
import { guideSchema, type Guide } from "./schema";
export const guides: Guide[] = seeds.map((seed) => guideSchema.parse(seed));
export function findSeed(query: string): Guide | undefined {
  const normalized = query
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
  return guides.find((g) =>
    [g.slug, g.name.toLowerCase(), g.domain].includes(normalized),
  );
}
export { guideMarkdown } from "./export";
