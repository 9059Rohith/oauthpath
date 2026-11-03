import { randomBytes } from "node:crypto";
import {
  applyLaunchSafeguards,
  auditRequirementQuotes,
  canonicalSourceUrl,
  cleanPage,
  registeredProviderDocuments,
} from "../lib/agent/research";
import { assertGuide, type Guide, type Source } from "../lib/schema";
import { safeFetch } from "../lib/security/safe-fetch";
import { readGuide, saveGuide } from "../lib/store";

// Narrow, one-off editorial correction. No model, registration or OAuth calls.
// Preview: node --env-file=.env.local --import tsx scripts/review-miro-guide.ts miro-adee6b37cdb2
// Publish a NEW immutable guide only by appending --publish.
const allowedSlug = "miro-adee6b37cdb2";

async function main() {
  const args = process.argv.slice(2);
  if (
    args[0] !== allowedSlug ||
    args.length > 2 ||
    (args.length === 2 && args[1] !== "--publish")
  )
    throw new Error(
      "Use the whitelisted original slug, optionally followed by --publish.",
    );
  const publish = args[1] === "--publish";
  const original = await readGuide(allowedSlug);
  if (
    !original ||
    original.slug !== allowedSlug ||
    original.domain !== "miro.com" ||
    original.generation?.mode !== "live"
  )
    throw new Error(
      "The whitelisted original live Miro guide was not available.",
    );

  const documents = registeredProviderDocuments("miro.com");
  if (documents.length !== 4)
    throw new Error(
      "Review requires the four bounded Miro documentation roles.",
    );
  const observations: NonNullable<Guide["probes"]> = [];
  const pages = (
    await Promise.all(
      documents.map(async (doc, index) => {
        const started = Date.now();
        let response;
        try {
          response = await safeFetch(doc.url, { timeoutMs: 15000 });
        } catch {
          observations.push({
            url: doc.url,
            status: 0,
            latencyMs: Math.min(120000, Date.now() - started),
            at: new Date().toISOString(),
            finding:
              "Editorial review: public-document retrieval failed. No source text established; no authenticated setup was attempted.",
          });
          return null;
        }
        const sameDocument =
          canonicalSourceUrl(response.url) === canonicalSourceUrl(doc.url);
        const text =
          response.status === 200 && sameDocument
            ? cleanPage(response.text)
            : "";
        const usable = text.length >= 100;
        const at = new Date().toISOString();
        observations.push({
          url: doc.url,
          status: response.status,
          latencyMs: Math.min(120000, response.latencyMs),
          at,
          finding: usable
            ? "Editorial review: current public documentation retrieved. No new model generation, authenticated app setup, token exchange or approval was performed."
            : "Editorial review: response provided no usable source evidence. No authenticated setup or approval was tested; missing policy remains unconfirmed.",
        });
        if (!usable) return null;
        const existing = original.sources.find(
          (source) =>
            canonicalSourceUrl(source.url) === canonicalSourceUrl(doc.url),
        );
        const source: Source = {
          id: existing?.id ?? `review-source-${index + 1}`,
          title: doc.title,
          url: response.url,
          fetchedAt: at,
        };
        return { source, text };
      }),
    )
  ).filter((page): page is NonNullable<typeof page> => page !== null);

  const manifest = pages.find(
    (page) =>
      page.source.url === "https://developers.miro.com/docs/app-manifest",
  );
  if (
    !manifest ||
    !/required only for apps that use the web sdk/i.test(manifest.text) ||
    !/redirectUris/i.test(manifest.text)
  )
    throw new Error(
      "The current manifest evidence needed for this correction was unavailable; nothing published.",
    );
  const sources = new Map(
    original.sources.map((source) => [source.id, source]),
  );
  for (const page of pages) sources.set(page.source.id, page.source);
  const candidate = { ...original, sources: [...sources.values()] };
  const corrected = auditRequirementQuotes(
    applyLaunchSafeguards(
      candidate,
      pages,
      "oauth2",
      "public",
      "Read board items",
    ),
    pages,
  );
  const originalUrl = `https://oauthpath-drab.vercel.app/guide/${allowedSlug}`;
  const reviewed = assertGuide({
    ...corrected,
    slug: `miro-reviewed-${randomBytes(6).toString("hex")}`,
    category: "Reviewed live research",
    updatedAt: new Date().toISOString().slice(0, 10),
    uncertainties: [
      `Reviewed derivative of original live research ${allowedSlug} (${originalUrl}). The original stored guide is unchanged. This editorial source review made no model calls and performed no authenticated setup.`,
      "Generation duration records the original AI research only; it is not the duration of this editorial review. The original research URL may redirect to this correction.",
      ...corrected.uncertainties,
    ].slice(0, 15),
    probes: observations,
    generation: {
      mode: "curated",
      model: `AI draft (${original.generation.model.slice(0, 100)}) + fresh-source editorial review`,
      durationMs: original.generation.durationMs,
      promptVersion: `${original.generation.promptVersion.slice(0, 58)}-source-reviewed`,
    },
  });
  if (reviewed.slug === original.slug)
    throw new Error("Refusing to replace the original guide.");
  if (publish) await saveGuide(reviewed); // saveGuide always uses allowOverwrite: false.
  console.log(
    JSON.stringify({
      published: publish,
      slug: reviewed.slug,
      url: publish
        ? `https://oauthpath-drab.vercel.app/guide/${reviewed.slug}`
        : null,
      originalSlug: allowedSlug,
      mode: reviewed.generation?.mode,
      modelCalls: 0,
      originalResearchDurationMs: original.generation.durationMs,
      sourceCount: reviewed.sources.length,
      stepCount: reviewed.steps.length,
      observations: observations.map(({ url, status }) => ({ url, status })),
    }),
  );
}

main().catch(() => {
  // Provider/storage error objects can include request metadata. Do not print them.
  console.error(
    "Miro review stopped: verify the whitelisted slug, storage access and current source availability. No original guide was overwritten.",
  );
  process.exitCode = 1;
});
