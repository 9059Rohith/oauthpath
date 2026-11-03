import type { Guide } from "./schema";

// Provider/model text is literal content, not author-supplied Markdown.
function text(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[\\`*_[\]<>#|]/g, "\\$&")
    .replace(/^([-+=!~])/, "\\$1")
    .replace(/^(\d+)\./, "$1\\.");
}

function link(label: string, raw: string): string {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.username || url.password)
      throw new Error("Unsupported source URL");
    const destination = url.href.replace(/[()]/g, (character) =>
      character === "(" ? "%28" : "%29",
    );
    return `[${text(label)}](${destination})`;
  } catch {
    return `${text(label)} (source URL unavailable)`;
  }
}

export function guideMarkdown(g: Guide): string {
  const sources = (ids: string[]) =>
    ids
      .map((id) => g.sources.find((s) => s.id === id))
      .filter((s) => s !== undefined)
      .map((s) => link(s.title, s.url))
      .join(", ") || "No supporting source confirmed.";
  const mode = g.generation?.mode ?? "curated";
  const research =
    mode === "document-scan"
      ? "Public-document scan; no AI synthesis. Setup and approval requirements remain unverified unless explicitly supported."
      : mode === "live"
        ? "AI-researched guide. Check the cited sources; generation is not proof of authenticated setup or approval."
        : "Curated guide based on reviewed documentation. Review the current provider requirements before launch.";
  return [
    `# ${text(g.name)}: OAuth setup & approval`,
    text(g.summary),
    `Scenario: ${text(g.scenario)}`,
    `Complexity: ${text(g.difficulty)}\n\nHands-on: ${text(g.effort)}\n\nApproval wait: ${text(g.wait)}`,
    `Approval route: ${text(g.approval)}`,
    `Reviewed: ${text(g.updatedAt)}`,
    "## Research context",
    `Mode: ${mode}\n\n${research}`,
    ...(g.generation
      ? [
          `Research model/tool: ${text(g.generation.model)}`,
          `Generation duration: ${g.generation.durationMs} ms. This measures guide research and generation, not developer setup effort or provider review time.`,
          `Research version: ${text(g.generation.promptVersion)}`,
        ]
      : [
          "Generation model and duration were not recorded for this curated guide.",
        ]),
    "## Requirements",
    ...g.requirements.map(
      (r) => `- [ ] ${text(r.text)} (${r.evidence}) ${sources(r.sourceIds)}`,
    ),
    "## Steps",
    ...g.steps.map(
      (s, i) =>
        `### ${i + 1}. ${text(s.title)}\n\nOwner: ${text(s.owner)}\n\n${text(s.description)}\n\nDone when: ${text(s.doneWhen)}\n\nIf blocked: ${text(s.ifBlocked)}\n\n${sources(s.sourceIds)}`,
    ),
    "## Blockers",
    ...g.blockers.map(
      (b) =>
        `### ${text(b.title)}\n\n${text(b.description)}\n\nNext: ${text(b.action)}\n\n${sources(b.sourceIds)}`,
    ),
    "## Technical details",
    ...g.technical.map(
      (t) => `- **${text(t.label)}:** ${text(t.value)} ${sources(t.sourceIds)}`,
    ),
    "## Agent and human handoffs",
    "These are possible next tasks, not actions already performed by this guide.",
    "### The agent can prepare",
    ...g.agentCan.map((task) => `- ${text(task)}`),
    "### You take over for",
    ...g.humanMust.map((task) => `- ${text(task)}`),
    "## What we checked",
    ...(g.probes?.length
      ? g.probes.map(
          (probe) =>
            `- ${link(probe.url, probe.url)}\n  Status: ${probe.status === 0 ? "No response received (no HTTP status established)" : `HTTP ${probe.status}`}\n  Observed: ${text(probe.at)}\n  Retrieval duration: ${probe.latencyMs} ms\n  Finding: ${text(probe.finding)}`,
        )
      : [
          "No runtime HTTP observations were recorded. Documentation review does not establish a successful authenticated setup.",
        ]),
    "## What remains uncertain",
    ...g.uncertainties.map((s) => `- ${text(s)}`),
    "## Sources",
    ...g.sources.map(
      (s) =>
        `- ${link(s.title, s.url)} — ${s.fetchedAt ? `Retrieved: ${text(s.fetchedAt)}` : "Retrieval date not recorded"}`,
    ),
    "Documentation and HTTP checks do not prove authenticated OAuth or provider approval.",
    "This export contains the guide, not your browser's personal checklist. Checking a step is self-reported progress, not provider approval.",
  ].join("\n\n");
}
