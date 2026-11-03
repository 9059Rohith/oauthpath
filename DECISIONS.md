# Implementation decisions

1. **Scope:** eight researched providers plus arbitrary public-URL investigation. The 100-app target is an extensible content model, not a claim that 100 guides have been authored.
2. **Fresh sources beat pasted assumptions:** provider research on November 3, 2026 corrected several assumptions in the supplied draft. See `docs/RESEARCH.md`.
3. **Current dependencies:** used the installed current Next.js and AI SDK APIs rather than pinning an old framework or assuming a model name exists. The chosen Gateway model ID was verified in its live catalog.
4. **AI account capability:** the authenticated Vercel account requires card verification. A real public-document scanner provides useful but explicitly incomplete output. It is never presented as equivalent to an AI approval guide.
5. **Storage:** private Vercel Blob stores generated guides as immutable JSON. Reads are validated. An unguessable slug is an unlisted link, not authentication.
6. **Limits:** immutable Blob slots enforce five attempts per hour per network identity and thirty globally per UTC day. Model steps/output and wall time are bounded. These are request budgets, not measured dollar-spend guarantees. Limit records need a lifecycle cleanup job before sustained production use.
7. **Job lifecycle:** generation streams in a bounded request and persists before reporting completion. A disconnect cancels work. Resumable queue-based jobs are deferred; do not claim they exist.
8. **Visual design:** generated architectural gateway and milestone assets, charcoal surfaces, teal accents, generous typography, native scroll, restrained parallax, and clear task hierarchy. Provider monograms avoid reliance on remote logo services. The image concept's illustrative provider scores were replaced with researched content.
9. **Motion:** the first mobile audit found too much main-thread work. Removed the motion runtime and client imports of full guide data/Zod; use progressive CSS scroll-driven parallax with a static fallback instead. Reduced-motion paths stay complete and usable.
10. **Evidence:** an HTTP fetch confirms document availability only. The app does not equate liveness with OAuth correctness, public-launch eligibility, or approval.
11. **Timing:** provider waits remain unknown without evidence. Hands-on estimates are labeled editorial planning estimates. Difficulty is separate from time.
12. **Browser validation:** in-app browser could not open localhost; Playwright Chromium was used. Native browser account switching was blocked because Computer Use could not verify the browser URL.
13. **Hosting:** GitHub Pages cannot run this app's server-side agent and private persistence. Vercel is the full-stack deployment target; GitHub stores the source.
14. **Security tradeoff:** the current CSP allows same-origin inline framework scripts. It blocks framing, objects and third-party connections; nonce-based strict script CSP remains hardening work, not a completed guarantee.
15. **Editorial limitations:** source references and structural validation do not prove semantic correctness. The live AI critic is an additional check, not a trust oracle, and its full behavior is still blocked from live validation.
16. **Publishing permissions:** GitHub rejected the initial push containing an active workflow because the credential lacks workflow scope. The repository was published with the same workflow preserved as `docs/ci-workflow.yml`; Vercel is connected to the repository for builds. No CI success is invented.
