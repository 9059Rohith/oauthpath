import { describe, expect, it } from "vitest";
import seeds from "../content/seeds.json";
import { guideSchema } from "../lib/schema";
import { guideMarkdown } from "../lib/export";

const fixture = () => guideSchema.parse(structuredClone(seeds[0]));

describe("shareable Markdown guide", () => {
  it("preserves the seed guide's approval, ownership, recovery and source context", () => {
    const guide = fixture();
    const markdown = guideMarkdown(guide);
    expect(markdown).toContain("# GitHub: OAuth setup & approval");
    expect(markdown).toContain(`Approval route: ${guide.approval}`);
    expect(markdown).toContain("## Agent and human handoffs");
    expect(markdown).toContain(guide.agentCan[0]);
    expect(markdown).toContain(guide.humanMust[0]);
    expect(markdown).toContain("Done when:");
    expect(markdown).toContain("If blocked:");
    expect(markdown).toContain("## What remains uncertain");
    expect(markdown).toContain("https://docs.github.com/");
    expect(markdown).toContain("not actions already performed");
    expect(markdown).toContain("not your browser's personal checklist");
  });

  it("does not invent runtime observations for a curated guide", () => {
    const guide = fixture();
    delete guide.generation;
    delete guide.probes;
    const markdown = guideMarkdown(guide);
    expect(markdown).toContain("Mode: curated");
    expect(markdown).toContain(
      "Generation model and duration were not recorded",
    );
    expect(markdown).toContain("No runtime HTTP observations were recorded");
    expect(markdown).not.toContain("Status: HTTP 200");
  });

  it("exports actual live observations, source dates and generation timing with separate meanings", () => {
    const guide = fixture();
    guide.generation = {
      mode: "live",
      model: "Research model + reviewer",
      durationMs: 14250,
      promptVersion: "test-v1",
    };
    guide.sources[0]!.fetchedAt = "2026-11-03T12:00:00Z";
    guide.probes = [200, 403, 0].map((status) => ({
      url: guide.sources[0]!.url,
      status,
      latencyMs: 280,
      at: "2026-11-03T12:00:00Z",
      finding: status
        ? "Public document observation only."
        : "Retrieval failed; no source facts established.",
    }));
    const markdown = guideMarkdown(guide);
    expect(markdown).toContain("Mode: live");
    expect(markdown).toContain(
      "Research model/tool: Research model + reviewer",
    );
    expect(markdown).toContain("Generation duration: 14250 ms");
    expect(markdown).toContain(
      "not developer setup effort or provider review time",
    );
    expect(markdown).toContain("Status: HTTP 200");
    expect(markdown).toContain("Status: HTTP 403");
    expect(markdown).toContain(
      "Status: No response received (no HTTP status established)",
    );
    expect(markdown).not.toContain("HTTP 0");
    expect(markdown).toContain("Retrieval duration: 280 ms");
    expect(markdown).toContain("Retrieved: 2026-11-03T12:00:00Z");
    expect(markdown).toContain(
      "Retrieval failed; no source facts established.",
    );
    expect(markdown).toContain(
      "Documentation and HTTP checks do not prove authenticated OAuth or provider approval.",
    );
  });

  it("keeps document-only fallback boundaries explicit", () => {
    const guide = fixture();
    guide.generation = {
      mode: "document-scan",
      model: "Public-document scanner (no LLM)",
      durationMs: 1200,
      promptVersion: "test-v1",
    };
    const markdown = guideMarkdown(guide);
    expect(markdown).toContain("Mode: document-scan");
    expect(markdown).toContain("Public-document scan; no AI synthesis");
    expect(markdown).toContain(
      "Setup and approval requirements remain unverified",
    );
    expect(markdown).not.toContain("AI-researched guide");
  });

  it("does not turn untrusted text into new Markdown headings, links or HTML tags", () => {
    const guide = fixture();
    guide.name = "Example\n# Forged heading";
    guide.summary = '<script>alert("x")</script>\n## Extra heading';
    guide.steps[0]!.title = "Task\n### Hidden step";
    guide.sources[0]!.title = "Docs](https://untrusted.example)\n# Fake source";
    const markdown = guideMarkdown(guide);
    expect(markdown).toContain(
      "# Example \\# Forged heading: OAuth setup & approval",
    );
    expect(markdown).not.toMatch(/^# Forged heading$/m);
    expect(markdown).not.toMatch(/^## Extra heading$/m);
    expect(markdown).not.toContain("<script>");
    expect(markdown).toContain("\\<script\\>");
    expect(markdown).toContain(
      "Docs\\](https://untrusted.example) \\# Fake source",
    );
    expect(markdown).not.toMatch(/^### Hidden step$/m);
  });

  it("encodes link destination parentheses and refuses executable or credential-bearing URLs", () => {
    const guide = fixture();
    guide.sources[0]!.url = "https://docs.github.com/a_(b)?version=2";
    let markdown = guideMarkdown(guide);
    expect(markdown).toContain("https://docs.github.com/a_%28b%29?version=2");
    for (const url of [
      "javascript:alert(1)",
      "https://user:secret@docs.github.com/path",
    ]) {
      guide.sources[0]!.url = url;
      markdown = guideMarkdown(guide);
      expect(markdown).toContain("source URL unavailable");
      expect(markdown).not.toContain(url);
    }
  });
});
