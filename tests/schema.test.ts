import { beforeEach, describe, expect, it, vi } from "vitest";
import seeds from "../content/seeds.json";
import {
  assertGuide,
  citationIssues,
  guideSchema,
  isPublicHttpsUrl,
} from "../lib/schema";

const blob = vi.hoisted(() => ({ put: vi.fn(), get: vi.fn(), list: vi.fn() }));
vi.mock("@vercel/blob", () => blob);
import { saveGuide } from "../lib/store";

const fixture = () => guideSchema.parse(structuredClone(seeds[0]));
beforeEach(() => vi.clearAllMocks());

describe("browser-safe source URL boundary", () => {
  it.each([
    "javascript:alert(1)",
    "data:text/html,unsafe",
    "file:///etc/passwd",
    "http://github.com",
    "https://127.0.0.1",
    "https://2130706433",
    "https://0x7f000001",
    "https://[::1]",
    "https://[::ffff:8.8.8.8]",
    "https://user:secret@github.com",
    "https://github.com:8443",
    "https://localhost.localdomain",
    "https://api.internal",
    "https://service.home.arpa",
    "https://example",
    "https://api..github.com",
    "https://github.com\\@localhost",
    "https://github.com\n",
  ])("rejects unsafe source URL %s", (url) =>
    expect(isPublicHttpsUrl(url)).toBe(false),
  );
  it.each([
    "https://github.com",
    "https://docs.github.com:443/oauth#flow",
    "https://bücher.de/docs",
  ])("accepts public HTTPS syntax %s", (url) => {
    expect(isPublicHttpsUrl(url)).toBe(true);
  });
});

describe("guide invariants", () => {
  it("validates all eight researched seed guides and their citations", () => {
    expect(seeds).toHaveLength(8);
    for (const seed of seeds)
      expect(citationIssues(assertGuide(seed))).toEqual([]);
  });
  it("preserves the object schema omit API used by the model", () => {
    expect(
      guideSchema.omit({ probes: true, generation: true }).safeParse(fixture())
        .success,
    ).toBe(true);
  });
  it("rejects a dangling citation", () => {
    const guide = fixture();
    guide.steps[0]!.sourceIds = ["not-a-source"];
    expect(() => assertGuide(guide)).toThrow("missing source");
  });
  it.each(["documented", "inferred"] as const)(
    "requires citations for %s claims",
    (evidence) => {
      const guide = fixture();
      guide.requirements[0]!.evidence = evidence;
      guide.requirements[0]!.sourceIds = [];
      expect(() => assertGuide(guide)).toThrow("no supporting source");
    },
  );
  it("permits explicit unknown requirements without fabricated citations", () => {
    const guide = fixture();
    guide.requirements[0]!.evidence = "unknown";
    guide.requirements[0]!.sourceIds = [];
    expect(() => assertGuide(guide)).not.toThrow();
  });
  it("requires source IDs on actionable steps", () => {
    const guide = fixture();
    guide.steps[0]!.sourceIds = [];
    expect(() => assertGuide(guide)).toThrow("no supporting source");
  });
  it("rejects duplicate source and step identifiers", () => {
    const guide = fixture();
    guide.sources[1]!.id = guide.sources[0]!.id;
    expect(guideSchema.safeParse(guide).success).toBe(false);
    const other = fixture();
    other.steps[1]!.id = other.steps[0]!.id;
    expect(guideSchema.safeParse(other).success).toBe(false);
  });
  it("rejects unsafe URLs in sources and observed probes", () => {
    const guide = fixture();
    guide.sources[0]!.url = "javascript:alert(1)";
    expect(guideSchema.safeParse(guide).success).toBe(false);
    const other = fixture();
    other.probes = [
      {
        url: "https://127.0.0.1",
        status: 200,
        latencyMs: 10,
        at: new Date().toISOString(),
        finding: "Responded.",
      },
    ];
    expect(guideSchema.safeParse(other).success).toBe(false);
  });
  it("bounds identifiers and rejects invalid observation values", () => {
    const guide = fixture();
    guide.slug = "a".repeat(101);
    expect(guideSchema.safeParse(guide).success).toBe(false);
    const other = fixture();
    other.probes = [
      {
        url: "https://github.com",
        status: 999,
        latencyMs: -1,
        at: "yesterday",
        finding: "Responded.",
      },
    ];
    expect(guideSchema.safeParse(other).success).toBe(false);
  });
  it("retains the honest document-scan generation mode", () => {
    const guide = fixture();
    guide.generation = {
      model: "Document scanner",
      mode: "document-scan",
      durationMs: 100,
      promptVersion: "v1",
    };
    expect(assertGuide(guide).generation?.mode).toBe("document-scan");
  });
});

describe("persistence boundary", () => {
  it("does not write an unsupported claim to private storage", async () => {
    const guide = fixture();
    guide.technical[0]!.sourceIds = ["missing"];
    await expect(saveGuide(guide)).rejects.toThrow("citation validation");
    expect(blob.put).not.toHaveBeenCalled();
  });
  it("writes only a validated immutable private guide", async () => {
    blob.put.mockResolvedValue({});
    const guide = fixture();
    await saveGuide(guide);
    expect(blob.put).toHaveBeenCalledWith(
      `guides/${guide.slug}.json`,
      JSON.stringify(guide),
      expect.objectContaining({
        access: "private",
        allowOverwrite: false,
        addRandomSuffix: false,
      }),
    );
  });
});
