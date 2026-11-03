# Evaluation record

Recorded November 3, 2026. Targets are not reported as measurements.

| Check | Result | Boundary |
|---|---|---|
| Security and schema unit tests | 98 passed | Includes hostile URLs, IP ranges, pinned DNS, redirects, timeout/size bounds, bounded request body, source IDs and all seeds |
| Playwright browser checks | 13 passed locally and in production | Desktop Chromium; dedicated 390px responsive checks; production run 42.3s |
| Automated accessibility | Zero serious/critical issues on four routes | axe WCAG A/AA rules; not a full manual audit |
| Checklist reload | Passed | Browser-local state, not provider verification |
| Markdown export | Passed | Real download with sources |
| Reduced motion | Passed | Headline remains visible; motion disabled |
| Dependency audit | Zero production vulnerabilities | Snapshot of `npm audit --omit=dev` |
| TypeScript, ESLint, production build | Passed | Installed lockfile versions |
| Real Linear source scan | Saved and reopened | Document scan, not AI synthesis |
| Production unseeded scans | Linear 1.917s; Dropbox 3.119s | One request each, including streamed response and persistence; not a latency distribution |
| Live AI generation quality | Not measured | Gateway account verification required |
| Authenticated provider setup | Not performed | No test accounts, consent, or credentials supplied |
| Provider approval | Not tested | No applications submitted |

The two SSE browser tests deliberately mock progress and completion/error messages to test presentation. They must not be counted as successful live research. Live source retrieval is checked separately.

Production results: `/guide/linear-app-9e9650581b3d` and `/guide/dropboxapi-com-bbee2e1c65c4`. Both are explicitly labeled public-document scans, not fully synthesized approval guides.

The library has eight guides, 48 setup steps and 25 source entries. This is not a claim of 25 unique documents fetched automatically or of 48 successfully executed setup actions. Seed research used official documentation; uncertainty is preserved in each guide.

Do not infer a p95, precision score, approval success rate, or average generation cost from this small demonstration. Those require a larger representative dataset and a working model provider. No statistical benchmark is claimed.

## Visual verification

Compared the generated concept in `docs/ui-concept.png` with browser screenshots at 1440px desktop and 390px mobile. Checked headline hierarchy, charcoal/teal palette, gateway art placement, search prominence, card geometry, text wrapping, downstream rhythm and responsive overflow. The concept's illustrative scores and timing text were intentionally replaced with evidence-based content. Original screenshots are temporary QA artifacts; the final app and source are the deliverables.
