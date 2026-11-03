# OAuthPath seed research
Research date: 3 November 2026 (Asia/Calcutta).
This file describes documentation research, not a successful OAuth setup or approval.
The eight guides live in `content/seeds.json`.

## Method
- Read official provider documentation through web search and page retrieval.
- Resolve legacy documentation redirects to their current pages where possible.
- Keep approval rules specific to audience, product, scope, and distribution route.
- Attach source IDs to each requirement, step, blocker, and technical field.
- Treat setup instructions and agent tasks as recommended work, not completed work.
- Label effort ranges as editorial planning estimates; they assume an existing app/backend and exclude full product implementation.
- Mark review waits unknown unless a reviewed official source states a duration.
- Do not infer successful OAuth, account eligibility, PKCE support, or approval from a reachable documentation page.
- Do not equate a documentation retrieval date with policy publication or an authenticated test date.
- No provider account was created; no consent, token exchange, review request, customer installation, or support message was submitted.
- No community anecdotes were used to manufacture p50/p95 estimates or approval guarantees.

## Findings that changed the guides
- GitHub's current OAuth documentation supports S256 PKCE and expiring-token configuration. Do not reuse an older assertion that OAuth Apps lack PKCE.
- Notion now distinguishes public connections from OAuth integrations limited to selected workspaces. Installation scope is immutable; its new PAT quickstart is not a customer OAuth recipe.
- Slack distinguishes pilots from commercial distribution. Current Marketplace suitability guidance explicitly excludes an MCP-only server without meaningful in-Slack functionality.
- Gmail classifies gmail.send as sensitive and gmail.readonly as restricted. Read-only access can still lead to substantial verification and assessment work.
- LinkedIn access depends on a selected product. Basic OIDC sign-in should not be portrayed as gated access to all business APIs.
- Zoom's published-unlisted route is not a way around review. External beta access also requires approval.
- Shopify's distribution choice affects authentication and review. Standalone/API-only agents should use the relevant auth-code guide, not an embedded-app example.
- Atlassian advises one distributable 3LO integration rather than asking each customer to create an individual app. OAuth scopes still do not override a user's permissions.

## Interpretation limits
The directory shows a concrete default scenario per provider, not a universal score for that brand.
Qualitative difficulty is an editorial interpretation of the scenario's requirements, not a provider rating or a statistical launch prediction.
Requirements and instructions remain subject to provider changes, organization policy, account tier, region, and feature eligibility.
The current implementation should render documentation evidence explicitly and must not relabel these seeds as tested.
A real test log should be attached only after an actual probe or authorized setup attempt, with its narrow observed result and timestamp.
For uncertainty, the correct next action is to inspect the account-specific console or ask the provider through its official support channel.

## Source inventory
### GitHub
Scenario: User-authorized GitHub.com integration; organization policies still apply.
- [Register an OAuth app](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) — source ID: `registration`.
- [Authorize an OAuth app](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps) — source ID: `oauth`.
- [Organization OAuth restrictions](https://docs.github.com/en/organizations/managing-oauth-access-to-your-organizations-data/about-oauth-app-access-restrictions) — source ID: `org`.

### Notion
Scenario: Public integration for users in any Notion workspace.
- [Public integrations](https://developers.notion.com/guides/connections-and-tokens/public-integrations/overview) — source ID: `public`.
- [Authorization flow](https://developers.notion.com/guides/authorization/overview) — source ID: `oauth`.
- [Scoped OAuth integrations](https://developers.notion.com/guides/connections-and-tokens/oauth-integrations/overview) — source ID: `scoped`.

### Slack
Scenario: Commercial agent integration distributed to external workspaces.
- [App lifecycle and distribution](https://docs.slack.dev/app-management/distribution/) — source ID: `distribution`.
- [Installing with OAuth](https://docs.slack.dev/authentication/installing-with-oauth/) — source ID: `oauth`.
- [Marketplace guidelines](https://docs.slack.dev/slack-marketplace/slack-marketplace-app-guidelines-and-requirements/) — source ID: `review`.

### Google / Gmail
Scenario: External Gmail integration that reads mailbox data through a backend.
- [Gmail scope classifications](https://developers.google.com/workspace/gmail/api/auth/scopes) — source ID: `scopes`.
- [Restricted scope verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification) — source ID: `review`.
- [Configure consent and scopes](https://developers.google.com/workspace/guides/configure-oauth-consent) — source ID: `consent`.

### LinkedIn
Scenario: A business-data agent requesting APIs beyond basic LinkedIn sign-in.
- [Getting API access](https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access) — source ID: `access`.
- [Authorization-code flow](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow) — source ID: `oauth`.
- [Sign in with OpenID Connect](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2) — source ID: `oidc`.

### Zoom
Scenario: A user-managed OAuth integration for external Zoom users.
- [Choose management and distribution](https://developers.zoom.us/docs/build-flow/before-you-build/) — source ID: `model`.
- [Submit an app for review](https://developers.zoom.us/docs/build-flow/submitting-apps-for-review/) — source ID: `review`.
- [OAuth authorization](https://developers.zoom.us/docs/integrations/oauth/) — source ID: `oauth`.

### Shopify
Scenario: Standalone or API-only app for multiple unrelated merchants.
- [About app distribution](https://shopify.dev/docs/apps/launch/distribution) — source ID: `distribution`.
- [Select a distribution method](https://shopify.dev/docs/apps/launch/distribution/select-distribution-method) — source ID: `select`.
- [Authenticate standalone apps](https://shopify.dev/docs/apps/build/authentication-authorization/authenticate-standalone-apps) — source ID: `oauth`.
- [Shopify App Store review](https://shopify.dev/docs/apps/launch/app-store-review) — source ID: `review`.

### Atlassian
Scenario: Distributable Jira Cloud OAuth 2.0 integration acting for a user.
- [OAuth 2.0 3LO apps](https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/) — source ID: `oauth`.
- [Jira OAuth scopes](https://developer.atlassian.com/cloud/jira/platform/scopes-for-oauth-2-3LO-and-forge-apps/) — source ID: `scopes`.
- [Jira app security](https://developer.atlassian.com/cloud/jira/platform/security-overview/) — source ID: `security`.

## Recommended authenticated follow-up
1. Select an account the builder owns and explicitly intends to use for testing.
2. Choose a provider and minimal non-destructive operation.
3. Record every configuration action, result, blocker, and handoff without storing credentials in logs.
4. Perform consent and a token exchange only within the authorized account/session.
5. Verify the intended API operation and revoke test access afterward when appropriate.
6. Keep provider review submissions, contractual attestations, payments, and customer access separate from documentation research.

