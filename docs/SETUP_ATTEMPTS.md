# Setup attempts and human handoffs

These are **real anonymous, read-only requests from the development machine**, made on **3 November 2026 at 20:16–20:17 IST**. They are not logged-in browser sessions. No accounts, OAuth apps, credentials, consent grants, installations, or approval submissions were created. No cookies, authentication headers, or secrets were supplied.

Run the repeatable probes from the repository root:

```sh
node --import tsx scripts/setup-probes.ts
```

The script uses the application's DNS-pinned, public-HTTPS-only `safeFetch`, a 15-second deadline, bounded responses, and validated redirects. It prints summarized findings; it does not print headers or complete page bodies. Reruns are new observations and can differ from the recorded sample below.

## Recorded observations

| Target | Started at (UTC) | Completed at (UTC) | Result | Observed boundary |
| --- | --- | --- | --- | --- |
| GitHub OAuth app registration | 2026-11-03T14:46:38.887Z | 2026-11-03T14:46:40.698Z | Final HTTP 200; fetch latency 1,782 ms | Redirected to the GitHub sign-in page. Title: “Sign in to GitHub · GitHub”. |
| Slack app management | 2026-11-03T14:46:38.895Z | 2026-11-03T14:46:39.858Z | HTTP 200; fetch latency 922 ms | The apps page explicitly required sign-in to create an application. |
| Google OAuth client console | 2026-11-03T14:46:38.896Z | 2026-11-03T14:46:40.638Z | Fetch failed; final status and URL unavailable | `The website closed the document before it completed.` This is a transport failure, not proof of a login wall. |
| Google OIDC discovery metadata | 2026-11-03T14:46:38.896Z | 2026-11-03T14:46:39.070Z | HTTP 200; fetch latency 170 ms | Retrieved and parsed the documented public metadata. No authorization flow was attempted. |

Fetch latency is measured inside `safeFetch`; completion timestamps also include parsing and classification. The single observations are not p50/p95 measurements or provider latency guarantees.

### GitHub: account ownership is the first handoff

- Requested: `https://github.com/settings/applications/new`
- Final: `https://github.com/login?return_to=https%3A%2F%2Fgithub.com%2Fsettings%2Fapplications%2Fnew`
- Tested: anonymous navigation to the registration entry point redirects to sign-in.
- Not tested: authenticated form access, app creation, client-secret issuance, token exchange, API access, or organization policy.

**Next action:** the developer signs into the GitHub account that should own the app, chooses an appropriate personal or organization owner, and reviews whether a GitHub App better fits fine-grained repository access. For the OAuth App route, prepare the application name, homepage URL, and exact callback URL before opening registration. These are documented prerequisites, not observations of a completed form. [GitHub registration documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)

**Agent preparation:** draft the non-secret registration fields and scope rationale, compare the callback against the integration's expected callback, and prepare a harmless test-account verification plan. Account selection and submission remain with the authorized owner; no existing browser session was used here.

### Slack: an authenticated workspace is required to continue

- Requested and final: `https://api.slack.com/apps`
- Page title: `Slack API: Applications | Slack`.
- Tested page text: “You'll need to sign in to your Slack account to create an application.”
- Not tested: workspace selection, app creation, workspace-admin approval, installation, or public distribution.

**Next action:** the developer signs into the intended development workspace, opens app management, and starts the current blank-app flow. The official instructions require an app name and development workspace. The choice of workspace matters; it should be a sandbox or a workspace the developer is authorized to administer. [Slack app-settings quickstart](https://docs.slack.dev/app-management/quickstart-app-settings/)

**Agent preparation:** draft the app description, minimum scope list, redirect URL list, and a reviewed app manifest. Slack documents manifests as a reusable configuration artifact, but manifest creation was not executed or submitted in this attempt. Commercial distribution requirements must be investigated separately from this sign-in boundary. [Slack manifests](https://docs.slack.dev/app-manifests/configuring-apps-with-app-manifests), [Slack distribution](https://docs.slack.dev/app-management/distribution/)

### Google: console retrieval was incomplete; public discovery worked

- Requested console URL: `https://console.cloud.google.com/apis/credentials/oauthclient`
- Final console URL/status: **unknown**, because `safeFetch` did not receive a complete response.
- A bounded second anonymous attempt started at `2026-11-03T14:47:13.245Z` and ended at `2026-11-03T14:47:15.267Z` with the same incomplete-document error.
- Separately, following the official documentation's current Clients link through the research browser tool reported a redirect from `https://console.developers.google.com/auth/clients` to Google's sign-in service. That tool could not retrieve the redirected page. This is a tool-reported redirect, not a successful console inspection.
- The tool-reported destination was `https://accounts.google.com/ServiceLogin?service=cloudconsole&passive=1209600&osid=1&continue=https://console.cloud.google.com/auth/clients&followup=https://console.cloud.google.com/auth/clients`.

**Next action:** the developer opens the [current Clients page](https://console.cloud.google.com/auth/clients) in an authenticated browser, selects the intended Cloud project, and checks the configured audience, app branding, requested scopes, and redirect URIs. The official web-server documentation describes “Create Client” and the “Web application” type. The developer must choose the appropriate type for the actual app. [Google web-server OAuth documentation](https://developers.google.com/identity/protocols/oauth2/web-server)

**Agent preparation:** draft the scope-to-feature mapping, exact redirect URIs, reviewer-demo checklist, and missing-domain/branding questions. Do not claim domain ownership, accept terms, choose billing, or submit verification on the developer's behalf without the required account access and authorization.

The public discovery request used the exact endpoint published in Google's official OIDC documentation rather than an invented probe path. Requested and final URL:

```text
https://accounts.google.com/.well-known/openid-configuration
```

The parsed response contained:

```json
{
  "issuer": "https://accounts.google.com",
  "authorization_endpoint": "https://accounts.google.com/o/oauth2/v2/auth",
  "token_endpoint": "https://oauth2.googleapis.com/token",
  "jwks_uri": "https://www.googleapis.com/oauth2/v3/certs",
  "revocation_endpoint": "https://oauth2.googleapis.com/revoke",
  "code_challenge_methods_supported": ["plain", "S256"]
}
```

**Evidence boundary:** this verifies that the public metadata was reachable and advertised those fields at the recorded time. It does not verify a client, prove a particular flow works, establish scope approval, or make a production-readiness claim. If implementing PKCE, use the appropriate secure flow and current provider guidance; the presence of `plain` in metadata is not a recommendation to use it. [Google OIDC documentation](https://developers.google.com/identity/openid-connect/openid-connect)

## How these attempts change the product guidance

1. Surface account/workspace/project ownership before asking developers to follow console steps.
2. Offer useful preparation artifacts before the human handoff, while keeping credentials out of the guide.
3. Display “sign-in required,” “fetch failed,” and “discovery metadata retrieved” as different outcomes.
4. Keep registration, a successful test connection, and provider approval as separate milestones.
5. Keep the practical-test label narrow. These attempts establish entry-point behavior and metadata retrieval, **not completed OAuth setups**.

No approval wait or hands-on setup duration was measured. Completing an authenticated test registration and harmless API call remains outstanding until a suitable test account and explicit scope are available.
