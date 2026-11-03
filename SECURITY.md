# Security model

## Boundaries

The main exposed input is an app name or public URL, with an optional bounded public capability description and audience enum. Generation consumes external documents and, when available, model output. Both are untrusted. There are no OAuth credential collection fields and no write-capable provider tools.

| Threat | Implemented mitigation | Remaining limitation |
|---|---|---|
| SSRF and metadata access | HTTPS only; no credentials, IP literals or custom ports; DNS responses checked for non-public ranges; connection pinned; redirects revalidated | A public website can still serve misleading content |
| DNS rebinding | Every resolved address must be public; the actual connection uses the checked address | Requires the Node runtime; do not replace with an unchecked fetch |
| Oversized or slow sources | Request timeout, response byte limit, content-type checks, redirect cap and abort propagation | Some large or bot-protected docs cannot be read |
| Prompt injection | External material is data; model tools are read-only search; no secrets or provider-write tools are exposed | Model-only instructions are not a complete injection defense; output is checked and never executed |
| Malicious output links | Public HTTPS syntax validation on sources and observations, React text rendering, validated persistence | DNS is checked on fetch; displayed links are not continuously monitored |
| Unsupported citations | IDs checked; duplicates rejected; missing references rejected; quoted support checked in AI flow; critic rejects unresolved drafts | Citation validity does not imply entailment; human review still matters |
| Resource abuse | Persistent quota slots, bounded model turns/output, limited parallel source fetches, overall timeout | Network identity limits can affect shared networks; quotas are not account authentication |
| Secret exposure | `.env*`, `.vercel`, `.local` ignored; server-only model/storage calls; no raw provider errors sent to visitors | The project owner must keep hosting credentials secure |
| Cross-origin generation | Origin validation and JSON POST endpoint | This is a public tool; same-origin automated use is still quota-controlled |
| Sharing | Random generated slugs, private Blob storage, generated pages noindexed | Anyone with a guide URL can read it; never put confidential data into a query |
| Token custody | No end-user provider tokens collected or stored | Real OAuth setup remains outside this take-home's runtime |

## Headers

The app sets Content-Security-Policy, X-Content-Type-Options, Referrer-Policy, X-Frame-Options and Permissions-Policy. CSP restricts external resource origins and framing but currently allows inline framework scripts/styles. Do not describe it as a nonce-based strict CSP. TLS is provided by the hosting platform.

## Operational controls

Quota reservation fails closed if storage is unavailable. Immutable slot writes protect against cross-instance races. Failed attempts consume capacity intentionally. Raw IPs are not persisted; network identifiers use a secret HMAC with a day component. Add retention cleanup for quota records and an authenticated deletion workflow before sustained usage. Public-document source fetches do not send browser cookies or authorization headers.

The direct OpenAI credential stays in an ignored local environment and sensitive production environment variable. Model calls execute on the server; synthesis and review have no tools. No credentials are borrowed from unrelated projects and no provider registrations or review requests are submitted automatically.

Run `npm test`, `npm run typecheck`, and `npm audit --omit=dev` before release. A targeted same-major dependency override removes a vulnerable nested Zod dependency in the Blob tooling chain.

The browser stream decoder bounds buffered frames and events, validates link and slug syntax, rejects malformed payloads, and requires terminal completion. An interrupted response cannot silently become a ready guide. Direct user-supplied source URLs are candidates only: confirmed provider ownership, public-network validation and fresh retrieval still apply. Trello's parent-company documentation relationship is restricted to its product path rather than all Atlassian content.
