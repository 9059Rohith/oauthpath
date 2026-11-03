# Actual application demonstration

[Watch the 2:05 MP4](https://oauthpath-drab.vercel.app/demo/oauthpath-demo.mp4) · [Working application](https://oauthpath-drab.vercel.app) · [Generated Asana guide](https://oauthpath-drab.vercel.app/guide/asana-7aa2432c6752)

Recorded November 3, 2026 in Chromium against the public Vercel deployment. The video contains the web application only. There are no terminal windows, presentation slides, mocked provider responses, fake progress events, replayed model results or fabricated approvals. It is silent and includes a conventional pointer/click indicator because browser capture omits the operating-system pointer.

## Chapters

| Time | What to inspect                                                         |
| ---- | ----------------------------------------------------------------------- |
| 0:00 | Homepage, typography glow and scroll-linked section imagery             |
| 0:20 | Managed versus custom provider-app ownership                            |
| 0:27 | Provider-library difficulty filter                                      |
| 0:34 | GitHub facts, checklist advancement, copied handoff and Markdown export |
| 0:53 | Gmail effort, verification and provider waiting                         |
| 1:01 | Asana input, public audience and task-reading capability                |
| 1:23 | Real research completion and saved guide                                |
| 1:39 | Actual source retrieval, policy conflict and remaining uncertainty      |
| 1:51 | Share the guide and inspect launch facts                                |

Timestamps are rounded after the lead-in trim. The public video is 125.000 seconds, H.264/yuv420p, 1920 × 1080, 25 fps and 22,885,310 bytes, with fast-start metadata for browser playback. It was recorded at 1440 × 810 and scaled to 1080p; it is not a claim of native 1080p capture. The blank 2.272-second lead-in and idle tail were trimmed. No intermediate waiting time was removed or accelerated, and no UI result was substituted.

## What the live segment establishes

The script submitted `Asana`, selected `public`, and entered `Read tasks for an AI assistant`. A genuine production request completed in **18.502 seconds** as measured by the browser workflow. It fetched four official pages, saved `asana-7aa2432c6752`, opened the result and verified the full AI research label. No browser runtime exceptions were observed. The guide distinguishes the publication-policy gate from technically available workspace sharing, reports a source conflict, and retains an unknown final approval duration. A quoted requirement that could not be verified is visibly marked unknown.

The earlier GitHub and Gmail views are authored library guides. They are not represented as newly generated results. The recording does not establish authenticated provider setup, a successful OAuth token exchange or completed review. The latest fullscreen sizing correction followed capture; it changes viewport coverage and gutters, while this recorded research pipeline and guide behavior remain the same.

## Reproduce

With dependencies and Playwright Chromium installed:

```sh
node scripts/record-demo.mjs
```

Optional `DEMO_BASE_URL` and `DEMO_OUTPUT_DIR` select the deployment and local output directory. Defaults are the public application and ignored `.local/demo-recording`. The script exercises the actual application, checks copied handoff sources, downloads the GitHub guide, verifies live-mode completion, and records chapter timing plus browser errors in a local JSON file. It uses one real model-backed request, consumes public quota, can incur configured model usage, and is intentionally not part of routine CI. Failed research stops recording with an error instead of inventing a successful result.

Encode the resulting WebM with an installed FFmpeg using H.264, yuv420p and `-movflags +faststart`. Review the measured timestamps and duration before trimming; future real model latency can differ. Keep raw recordings and local diagnostics out of the repository. The published MP4 and poster contain no credential configuration or provider-account session.
