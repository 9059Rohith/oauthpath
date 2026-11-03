import { readFile, writeFile } from "node:fs/promises";
import { assertGuide } from "../lib/schema";

// Keep the browser index small as the researched library grows to 100+ guides.
// Only explicit public card/search fields cross this build-time boundary.
async function syncCatalog() {
  const seeds: unknown[] = JSON.parse(
    await readFile("content/seeds.json", "utf8"),
  );
  const catalog = seeds.map((input) => {
    const guide = assertGuide(input);
    const { slug, name, domain, category, color, summary, difficulty, effort } =
      guide;
    return { slug, name, domain, category, color, summary, difficulty, effort };
  });
  await writeFile(
    "content/catalog.json",
    JSON.stringify(catalog, null, 2) + "\n",
  );
  console.log(`Validated and indexed ${catalog.length} researched guides.`);
}
void syncCatalog().catch(() => {
  console.error(
    "Catalog build failed. Validate the seed guide schema and references.",
  );
  process.exitCode = 1;
});
