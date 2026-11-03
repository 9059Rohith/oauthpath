import { z } from "zod";

// Client-safe syntax validation. Network access additionally requires safeFetch,
// which resolves DNS and pins a globally routable destination for every hop.
export function isPublicHttpsUrl(value: string): boolean {
  if (value.length > 2048 || /[\u0000-\u0020\u007f\\]/u.test(value))
    return false;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/\.$/u, "");
    const forbidden = [
      "localhost",
      "localdomain",
      "local",
      "internal",
      "intranet",
      "lan",
      "home",
      "home.arpa",
      "onion",
      "invalid",
      "test",
      "example",
    ];
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      (!url.port || url.port === "443") &&
      host.length <= 253 &&
      host.includes(".") &&
      !host.includes(":") &&
      !/^\d+\.\d+\.\d+\.\d+$/u.test(host) &&
      !forbidden.some(
        (suffix) => host === suffix || host.endsWith(`.${suffix}`),
      ) &&
      host
        .split(".")
        .every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/u.test(label))
    );
  } catch {
    return false;
  }
}

export const publicHttpsUrlSchema = z
  .string()
  .max(2048)
  .refine(isPublicHttpsUrl, "Expected a public HTTPS website URL.");
export const evidenceSchema = z.enum(["documented", "inferred", "unknown"]);
const idSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-zA-Z0-9_-]+$/u);
const refs = z
  .array(idSchema)
  .max(12)
  .refine(
    (ids) => new Set(ids).size === ids.length,
    "Duplicate citation IDs are not allowed.",
  );
const text = (max: number) => z.string().trim().min(1).max(max);
const uniqueIds = <T extends { id: string }>(items: T[]) =>
  new Set(items.map((item) => item.id)).size === items.length;

export const sourceSchema = z.object({
  id: idSchema,
  title: text(250),
  url: publicHttpsUrlSchema,
  fetchedAt: z.iso.datetime({ offset: true }).optional(),
  excerpt: z.string().max(1200).optional(),
});

// Keep this an object schema so the model adapter can omit probe/generation fields.
// Cross-field citation integrity is enforced by assertGuide at persistence boundaries.
export const guideSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/u),
  name: text(100),
  domain: text(180),
  category: text(80),
  color: z
    .string()
    .regex(/^#[\da-fA-F]{6}$/u)
    .default("#77e7cf"),
  summary: text(600),
  difficulty: z.enum([
    "Straightforward",
    "Some setup",
    "Review required",
    "Access gated",
    "Unknown",
  ]),
  effort: text(400),
  wait: text(500),
  approval: text(500),
  scenario: text(500),
  updatedAt: z.iso.date(),
  sources: z
    .array(sourceSchema)
    .min(1)
    .max(12)
    .refine(uniqueIds, "Source IDs must be unique."),
  requirements: z
    .array(
      z.object({
        text: text(700),
        evidence: evidenceSchema,
        sourceIds: refs,
        quote: z.string().max(250).optional(),
      }),
    )
    .min(1)
    .max(15),
  steps: z
    .array(
      z.object({
        id: idSchema,
        title: text(180),
        description: text(1400),
        owner: z.enum(["You", "Agent", "Together"]),
        doneWhen: text(500),
        ifBlocked: text(600),
        sourceIds: refs,
      }),
    )
    .min(1)
    .max(12)
    .refine(uniqueIds, "Step IDs must be unique."),
  blockers: z
    .array(
      z.object({
        title: text(200),
        description: text(700),
        action: text(800),
        sourceIds: refs,
      }),
    )
    .max(8),
  technical: z
    .array(z.object({ label: text(150), value: text(1000), sourceIds: refs }))
    .max(12),
  uncertainties: z.array(text(700)).max(15),
  agentCan: z.array(text(500)).max(10),
  humanMust: z.array(text(500)).max(10),
  probes: z
    .array(
      z.object({
        url: publicHttpsUrlSchema,
        status: z
          .number()
          .int()
          .min(0)
          .max(599)
          .refine((status) => status === 0 || status >= 100),
        latencyMs: z.number().finite().min(0).max(120_000),
        at: z.iso.datetime({ offset: true }),
        finding: text(800),
      }),
    )
    .max(20)
    .optional(),
  generation: z
    .object({
      model: text(160),
      durationMs: z.number().finite().min(0).max(3_600_000),
      mode: z.enum(["live", "curated", "document-scan"]),
      promptVersion: text(80),
    })
    .optional(),
});

export type Guide = z.infer<typeof guideSchema>;
export type Source = z.infer<typeof sourceSchema>;

export function citationIssues(guide: Guide): string[] {
  const ids = new Set(guide.sources.map((source) => source.id));
  const issues: string[] = [];
  if (ids.size !== guide.sources.length)
    issues.push("Source IDs must be unique.");
  if (!uniqueIds(guide.steps)) issues.push("Step IDs must be unique.");
  for (const item of [
    ...guide.requirements,
    ...guide.steps,
    ...guide.blockers,
    ...guide.technical,
  ]) {
    if (item.sourceIds.some((id) => !ids.has(id)))
      issues.push("Citation refers to a missing source.");
    if (
      !item.sourceIds.length &&
      !("evidence" in item && item.evidence === "unknown")
    ) {
      issues.push("A claim has no supporting source.");
    }
  }
  return [...new Set(issues)];
}

/** Parse untrusted guide data and reject dangling or absent supporting references. */
export function assertGuide(input: unknown): Guide {
  const guide = guideSchema.parse(input);
  const issues = citationIssues(guide);
  if (issues.length)
    throw new Error(`Guide citation validation failed: ${issues.join(" ")}`);
  return guide;
}
