# OAuthPath release evaluation

Recorded November 3, 2026. Targets are distinguished from observations.

## Working production demonstrations

- **Linear:** [open the full AI guide](https://oauthpath-drab.vercel.app/guide/linear-e0fc5709ccf7) — 17.740 seconds. Production POST/SSE, then guide page. Mode verified as live AI research.
- **Dropbox:** [open the full AI guide](https://oauthpath-drab.vercel.app/guide/dropbox-f2693009770b) — 18.955 seconds. Real browser form → production stream → persisted guide. Mode verified as live AI research.

Both runs used direct OpenAI web search, fresh first-party source retrieval, full-model synthesis, evidence review, source-conditioned policy safeguards, private durable persistence, and reopened guide pages. The Dropbox test used the real browser form and streamed activity, not a mocked response. Individual timings are not a p95 or SLA.

## Automated checks

| Check | Result | Boundary |
|---|---|---|
| Unit tests | 117 passed | 60 network-security, 34 schema, 4 bounded-request, 19 research-policy tests |
| Browser regression | 15 passed in production, 43.1s | Keyboard, filtering, persistence, Markdown download, responsive overflow, reduced motion, accessibility, streaming UI, real pointer/scroll transforms |
| Automated accessibility | Zero serious/critical issues on four routes | WCAG A/AA axe rules; not a complete manual audit |
| TypeScript, lint, build | Passed | Production build also runs lint and unit tests before publishing |
| Production dependency audit | Zero known vulnerabilities | Snapshot, not a security certification |
| Secret handling check | Passed | Supplied credential absent from tracked files; local environment and QA artifacts ignored |
| Mobile Lighthouse | Performance 83; Accessibility 100; Best Practices 100; SEO 100 | LCP 2.3 s; TBT 510 ms; CLS 0 |

The mobile performance target of 92 was not met. Previous lab runs ranged from 75 to 85; the final run improved LCP to 2.3s, with zero layout shift. Remaining main-thread work is primarily framework hydration. Do not claim measured field INP or production p95.

Two stream-presentation tests use explicit fixtures to exercise UI success/error behavior; they are separate from the real production demonstrations above.

## Semantic checks and corrections

- Dropbox: fetched the production guide, distinguished its development cap and threshold-triggered application deadline from an unknown approval turnaround, included review materials, and removed blanket claims about customer-admin exemptions.
- Linear: public distribution distinguished from its private default, optional listing/native-agent features separated from ordinary OAuth, least-privilege read baseline, secure callback-state validation.
- Both: source IDs and supporting excerpts validated, uncited factual assertions removed, missing evidence surfaced, and no successful OAuth setup or provider approval fabricated.
- A model-only reviewer missed important omissions; source-conditioned maintained provider checks now complement model synthesis. These are engineering guardrails, not proof that all future generated prose is correct.

## Practical setup investigation

[Reproducible setup attempts](docs/SETUP_ATTEMPTS.md) record GitHub and Slack sign-in boundaries, a Google console transport failure, and successfully parsed Google OIDC metadata. No authenticated app registration, token exchange, payment, or provider submission was performed. Those account-bound actions remain explicit human handoffs.

The library contains eight researched guides, 48 authored steps, and 25 source entries, plus recorded anonymous setup observations. The 100-app goal is supported by a validated schema and automatically generated compact catalog; 100 authored guides are not claimed.

## Visual verification

Inspected the generated artwork and actual desktop/mobile browser screenshots. Checked headline hierarchy, readable scrims, new orbital background placement, search prominence, provider rows, section rhythm, mobile wrapping, gradient text, pointer tilt, scroll parallax, and reduced-motion behavior. The original restrained artwork was replaced with a stronger user-requested direction. Section movement keeps full text contrast; continuous ornamental painting is reduced on mobile.

Vercel is connected to GitHub and gates builds with lint and unit tests. The GitHub Actions workflow remains an installable template because the available publishing credential lacks workflow scope. No GitHub Actions green run or broad accuracy benchmark is claimed.
