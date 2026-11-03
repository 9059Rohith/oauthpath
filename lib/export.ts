import type { Guide } from "./schema";

export function guideMarkdown(g: Guide): string {
  const sources = (ids: string[]) =>
    ids
      .map((id) => g.sources.find((s) => s.id === id))
      .filter(Boolean)
      .map((s) => `[${s!.title}](${s!.url})`)
      .join(", ");
  return [
    `# ${g.name}: OAuth setup & approval`,
    g.summary,
    `Scenario: ${g.scenario}`,
    `Complexity: ${g.difficulty}\nHands-on: ${g.effort}\nApproval wait: ${g.wait}`,
    `Reviewed: ${g.updatedAt}`,
    "## Requirements",
    ...g.requirements.map(
      (r) => `- [ ] ${r.text} (${r.evidence}) ${sources(r.sourceIds)}`,
    ),
    "## Steps",
    ...g.steps.map(
      (s, i) =>
        `### ${i + 1}. ${s.title}\nOwner: ${s.owner}\n${s.description}\nDone when: ${s.doneWhen}\nIf blocked: ${s.ifBlocked}\n${sources(s.sourceIds)}`,
    ),
    "## Blockers",
    ...g.blockers.map(
      (b) =>
        `### ${b.title}\n${b.description}\nNext: ${b.action}\n${sources(b.sourceIds)}`,
    ),
    "## Technical details",
    ...g.technical.map(
      (t) => `- **${t.label}:** ${t.value} ${sources(t.sourceIds)}`,
    ),
    "## What remains uncertain",
    ...g.uncertainties.map((s) => `- ${s}`),
    "## Sources",
    ...g.sources.map((s) => `- [${s.title}](${s.url})`),
    "\nDocumentation and HTTP checks do not prove authenticated OAuth or provider approval.",
  ].join("\n\n");
}
