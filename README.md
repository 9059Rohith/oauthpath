# OAuthPath

**Know the work, the wait, and the next step before launching an integration.**

[Working app](https://oauthpath-drab.vercel.app) · [Source](https://github.com/9059Rohith/oauthpath) · [Submission walkthrough](docs/SUBMISSION.md)

OAuthPath helps developers decide whether they need their own provider OAuth app, follow an evidence-linked setup guide, and research an unfamiliar app live. It distinguishes app registration, provider review, Marketplace listing, organization approval, and each user's consent.

## Try it

1. [Choose managed or custom OAuth](https://oauthpath-drab.vercel.app/start). Availability is checked in the official directory, never assumed here.
2. Compare [GitHub](https://oauthpath-drab.vercel.app/guide/github), [Google / Gmail](https://oauthpath-drab.vercel.app/guide/google), and [LinkedIn](https://oauthpath-drab.vercel.app/guide/linkedin): app-model choice, sensitive data, and gated access.
3. Check a step, reload, continue to the next unfinished task, and copy a handoff with technical decisions, blockers, uncertainties, and sources. Export Markdown or print a guide.
4. [Generate a guide](https://oauthpath-drab.vercel.app/generate) for an unfamiliar name or public documentation URL. Optionally specify internal/pilot/public users and the capability you need. Watch real research, then open and share the saved URL.
5. Inspect live research examples and a reviewed revision: [Linear](https://oauthpath-drab.vercel.app/guide/linear-e0fc5709ccf7), [Dropbox](https://oauthpath-drab.vercel.app/guide/dropbox-f2693009770b), [Miro](https://oauthpath-drab.vercel.app/guide/miro-reviewed-ea26bc366b64).

## Run locally

Requires Node.js 24 and npm. The library and interface work without credentials.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

For live AI research, set server-only `OPENAI_API_KEY`. Durable generated guides and quotas require a private Vercel Blob store and `BLOB_READ_WRITE_TOKEN`. Optional model names and site URL are documented in `.env.example`. Never prefix credentials with `NEXT_PUBLIC_`, commit `.env.local`, or enter tokens into the research form. To use an existing authorized Vercel project, `vercel link` and `vercel env pull .env.local` retrieve its configuration.

```sh
npm run verify
npx playwright install chromium
npm run test:e2e
npm run build
npm audit --omit=dev
```

Deploy this Next.js project to Vercel with the same server environment variables. GitHub Pages cannot execute its research API or private storage operations.

## Key decisions

- **Focused content:** eight varied researched providers, 52 authored steps and 29 source entries. The brief permits a sample; 100 authored guides are not claimed. A validated schema and generated compact catalog support expansion.
- **Evidence before confidence:** direct OpenAI web search → provenance-checked first-party documents → bounded DNS-pinned retrieval → typed synthesis → quotation/citation checks → skeptical review → one repair attempt → immutable private storage. Supplied URLs must match confirmed provider ownership. Failed drafts are not published.
- **Launch coverage:** a separate policy search runs when setup sources lack distribution guidance. Maintained entry points and fresh-source-dependent safeguards address difficult provider policies. OAuth protocol, user audience and requested capability affect the guide.
- **Useful next action:** local progress advances the checklist, opens the right task, and produces a shareable handoff. Checking a box never claims provider approval.
- **Fast, accessible presentation:** server-rendered featured content, generated artwork, section-specific artwork, scroll-linked word animation, event-driven pointer/scroll parallax, pausable provider marquees, and reduced-motion support. No heavyweight animation runtime.

## Verification and limits

176 unit tests and 29 production browser checks passed. Production dependency audit found zero known vulnerabilities. Latest mobile Lighthouse: **92 performance / 100 accessibility / 100 best practices / 100 SEO**, LCP 2.5s, TBT 140ms, CLS 0. These are lab observations, not field guarantees. Real browser Miro research completed in 36.945s; earlier Linear/Dropbox runs took 17.740s/18.955s. The Miro example is explicitly labeled as a source-reviewed derivative of that live run. See [the detailed evaluation](EVALUATION.md).

No authenticated provider app registration, token exchange, or completed approval is claimed. [Actual anonymous setup attempts](docs/SETUP_ATTEMPTS.md) record sign-in boundaries, an inaccessible console, and public OIDC metadata. [Corrections](docs/SEED_CORRECTIONS.md) explain what source review changed. Model prose still needs source inspection; citations and an AI critic do not establish universal accuracy.

Generated guides are unlisted and noindexed, but anyone with their link can read them. Research inputs must be public information. Progress stays in browser storage. Limits are five attempts/hour/network and thirty/day globally; interrupted work is not resumable. A document-only fallback is explicitly incomplete. No user accounts, provider-write tools, or deletion dashboard are included. Retention cleanup and broad accuracy evaluation remain future work.

Every Vercel build gates on lint and unit tests. The [GitHub Actions template](docs/ci-workflow.yml) is inactive because the publishing credential lacks workflow scope; no green Actions run is claimed.

[Security model](SECURITY.md) · [Decisions](DECISIONS.md) · [Assignment audit](docs/FINAL_REQUIREMENTS_AUDIT.md) · [Research notes](docs/RESEARCH.md) · [1,000-line build specification](docs/MASTER_BUILD_PROMPT.md)
