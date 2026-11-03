# OAuthPath release evaluation

Recorded November 3, 2026. Targets are distinguished from observations.

## Working production demonstrations

- **Linear:** [open the full AI guide](https://oauthpath-drab.vercel.app/guide/linear-e0fc5709ccf7) — 17.740 seconds. Production POST/SSE, then guide page. Mode verified as live AI research.
- **Dropbox:** [open the full AI guide](https://oauthpath-drab.vercel.app/guide/dropbox-f2693009770b) — 18.955 seconds. Real browser form → production stream → persisted guide. Mode verified as live AI research.
- **Asana:** [open the fresh demo result](https://oauthpath-drab.vercel.app/guide/asana-7aa2432c6752) — **18.502 seconds** in the actual browser recording. Public audience, task-reading capability; four first-party HTTP 200 observations; full AI mode verified; saved result reopened. The 2:05 [application-only demo](https://oauthpath-drab.vercel.app/demo/oauthpath-demo.mp4) shows submission, real research activity, saved output and its uncertainties. Earlier known inaccurate Asana demonstration URLs now lead to this checked fresh run; their private originals remain unchanged.

- **Miro:** actual tailored browser research completed in **36.945 seconds**, with zero browser runtime errors. Its [source-reviewed revision](https://oauthpath-drab.vercel.app/guide/miro-reviewed-ea26bc366b64) is the current example. The revision made no model calls, freshly fetched three usable official sources, recorded Help HTTP 403 as unavailable, and preserves the original AI timing as provenance; that duration is not editorial review time. Old demonstration links redirect to this correction; immutable originals remain intact.

The Linear and Dropbox runs used direct OpenAI web search, fresh first-party source retrieval, full-model synthesis, evidence review, source-conditioned policy safeguards, private durable persistence, and reopened guide pages. The Dropbox test used the real browser form and streamed activity, not a mocked response. Individual timings are not a p95 or SLA.

## Automated checks

| Check                       | Result                                                         | Boundary                                                                                                                                                                  |
| --------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit tests                  | 182 passed                                                     | 60 network-security, 34 schema, 4 bounded-request, 47 research-policy, 20 stream, 9 scenario-input, 6 export, 2 revision tests                                            |
| Browser regression          | 33 passed in production, 1.3 minutes                           | Keyboard, filtering, persistence, Markdown download, responsive overflow, reduced motion, accessibility, streaming UI, level hero and measured vertical scroll transforms |
| Automated accessibility     | Zero serious/critical issues on five routes                    | WCAG A/AA axe rules; not a complete manual audit                                                                                                                          |
| TypeScript, lint, build     | Passed                                                         | Production build also runs lint and unit tests before publishing                                                                                                          |
| Production dependency audit | Zero known vulnerabilities                                     | Snapshot, not a security certification                                                                                                                                    |
| Secret handling check       | Passed                                                         | Supplied credential absent from tracked files; local environment and QA artifacts ignored                                                                                 |
| Mobile Lighthouse           | Performance 80; Accessibility 100; Best Practices 100; SEO 100 | LCP 2.7 s; TBT 580 ms; CLS 0; measured 2026-11-03 17:55 UTC                                                                                                               |

The latest isolated fullscreen mobile run scored **80** (17:55 UTC); the preceding fullscreen run scored **77** (17:52 UTC), and the pre-sizing release scored **93** (17:42 UTC). The machine benchmark indices were 1734.5, 1179 and 2279 respectively, so these results do not isolate application cost from machine variation. The larger viewport artwork and main-thread work deserve further profiling on slower devices. This is a disclosed limitation, not a claim of meeting a consistent 92 performance target. Accessibility, best practices and SEO scored 100 in all three runs; CLS remained 0. No measured field INP or production p95 is claimed.

Seven stream-presentation tests use explicit fixtures to exercise UI success/error behavior; they are separate from the real production demonstrations above.

## Semantic checks and corrections

- Dropbox: fetched the production guide, distinguished its development cap and threshold-triggered application deadline from an unknown approval turnaround, included review materials, and removed blanket claims about customer-admin exemptions.
- Linear: public distribution distinguished from its private default, optional listing/native-agent features separated from ordinary OAuth, least-privilege read baseline, secure callback-state validation.
- Both: source IDs and supporting excerpts validated, uncited factual assertions removed, missing evidence surfaced, and no successful OAuth setup or provider approval fabricated.
- A model-only reviewer missed important omissions; source-conditioned maintained provider checks now complement model synthesis. These are engineering guardrails, not proof that all future generated prose is correct.
- Asana: a real mobile lookup completed in 19.912 seconds, but its draft treated review as directory-only. Fresh official publication guidance explicitly covers availability beyond the developer's organization/development environment, while the sharing page permits Any workspace authorization. The source conflict is now exposed instead of choosing the easier route. A subsequent browser run revealed an ordering mistake and an invented technical setting lock. An exact regression fixture failed before the correction and passed afterward: review now precedes the observed Distribute step, and policy review is distinguished from a technically enabled sharing setting. A one-week initial-response target is never presented as final approval time. No Asana review or authenticated setup was attempted.

## Practical setup investigation

[Reproducible setup attempts](docs/SETUP_ATTEMPTS.md) record GitHub and Slack sign-in boundaries, a Google console transport failure, and successfully parsed Google OIDC metadata. No authenticated app registration, token exchange, payment, or provider submission was performed. Those account-bound actions remain explicit human handoffs.

The library contains eight researched guides, 52 authored steps, and 29 source entries, plus recorded anonymous setup observations. The 100-app goal is supported by a validated schema and automatically generated compact catalog; 100 authored guides are not claimed.

## Visual verification

Inspected the generated artwork and actual 1440px desktop / 390px mobile screenshots. The reported sideways tilt came from pointer-driven horizontal translation and perspective rotation of the hero image. Those transforms were removed. The image now moves vertically by at most 60px on desktop and 25px on mobile; section frames stay fixed while overscanned image pixels move inside them. Typography rises on scroll with stronger glow and a gradient sweep. Regression checks cover eight widths from 320px to 1920px at multiple scroll positions, level transform matrices, live scroll displacement, marquee behavior and static reduced-motion content. Full text contrast is retained.

The fullscreen follow-up removed the homepage's 1,264px width cap and fixed hero height. Fluid gutters now span wide screens; the hero fills the viewport below the header using small viewport units and grows naturally if content needs more room. Production geometry was 1920 × 997 at y=83 in a 1920 × 1080 viewport, with document width exactly 1920. Extra regression cases cover up to 2560 × 1440 and mobile landscape. Actual 390px and 1920px production screenshots had no runtime exceptions or console errors.

The public MP4 returned HTTP 206 with a correct byte range and decoded as 125 seconds / 1920 × 1080. Local playback and seeking passed. The first production seek exceeded the initial 15-second check while buffering; it subsequently reached readyState 4, exposed the complete seekable range, and played from 100 seconds without a media error. Cold seek latency remains network/CDN dependent.

Vercel is connected to GitHub and gates builds with lint and unit tests. The GitHub Actions workflow remains an installable template because the available publishing credential lacks workflow scope. No GitHub Actions green run or broad accuracy benchmark is claimed.

## Final product improvements

The ownership chooser explains managed versus custom registration and links to Composio's provider/method-specific directory. Guides advance to the next incomplete task, open it, allow local reset, and copy remaining work with sources and human handoffs. Research accepts audience/capability input, distinguishes protocol families, retrieves supplied official URLs independently of search indexing, searches missing launch policies separately, records failed retrieval observations, and rejects interrupted/unsafe stream payloads.

Google and GitHub procedural gaps were corrected from fresh sources; see [the correction notes](docs/SEED_CORRECTIONS.md). Independent Miro review caught a direct-install versus Marketplace mistake in an unpublished local draft. Maintained sharing sources, narrowed absence claims, and a source-conditioned distinction now qualify the route without promising customer-admin exemptions.

Miro's [manifest reference](https://developers.miro.com/docs/app-manifest) was fetched with the restricted client (HTTP 200; 5,493 cleaned characters) to verify that App URL/`sdkUri` is required only for Web SDK apps. Source-conditioned corrections separate that field from REST OAuth `redirectUris`. Callback validation, server-side code exchange and an authorized scoped test appear before app sharing. This is guidance, not a claim that the provider setup was performed.

Production API boundary checks returned 200 for an existing cached guide, 400 for an IP-literal target, 403 for a foreign Origin and 413 for an oversized request. These checks did not trigger model generation.

## Final submission audit and presentation

[Every assignment requirement is mapped to evidence](docs/FINAL_REQUIREMENTS_AUDIT.md). New art is documented in [the asset prompts](docs/ASSETS.md). Scroll type and parallax are driven by one bounded frame callback for visible sections, with static reduced-motion behavior. Marquees pause manually, on hover/focus and offscreen; visible repeated links work without duplicate keyboard stops. Actual desktop/mobile screenshots were inspected for word spacing, image composition, readability and clipping. Mobile guide cards use a readable single column.

The final audit corrected export omissions (approval, research mode, agent/human handoffs, source dates and HTTP observations) and cross-section Miro contradictions. Positive corrections require fresh official evidence; blocked customer-policy evidence remains explicitly unknown. Source review was necessary because a model-only critic did not establish complete semantic accuracy. The reviewed Miro derivative retains actual test-install actions while correcting SDK-specific recovery instructions.
