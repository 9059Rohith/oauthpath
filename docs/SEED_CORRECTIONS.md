# Seed procedure corrections

Reviewed and changed on 3 November 2026. These are documentation-backed improvements to instructions, not completed OAuth registrations or authenticated tests.

## GitHub: make the chosen application type explicit

The guide now describes an **OAuth App** scenario throughout. Its initial decision step redirects developers who need the alternative GitHub App model to that model's separate documentation. The following registration menu is explicitly limited to OAuth Apps. Callback instructions also state that returned state is validated before exchanging the code.

Sources re-opened during this correction:

- [Creating an OAuth app](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)
- [Authorizing OAuth apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- [About creating GitHub Apps](https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/about-creating-github-apps)

The added source ID is `github-app-alternative`. Existing step IDs remain stable.

## Google / Gmail: fill the gap between consent configuration and testing

The previous sequence went directly from project configuration to testing. The revised ten-step sequence separates:

1. Feature-to-scope selection.
2. Project/API and consent configuration.
3. Web-client creation and callback registration.
4. Test-audience configuration.
5. Callback implementation and security validation.
6. Code exchange and token lifecycle handling.
7. A narrowly described, non-destructive test operation.
8. Verification evidence preparation.
9. Assessment applicability.
10. Review submission and follow-up.

Each new step has an owner, an observable completion condition, a recovery instruction, and supporting source IDs. Adding a test user no longer claims to complete consent. A successful profile request is explicitly distinct from production approval. Guidance does not assert that every client always receives a secret or refresh token.

Sources retrieved and inspected during this correction:

- [`client`: Create access credentials](https://developers.google.com/workspace/guides/create-credentials) — current web-client creation instructions.
- [`oauth`: Web-server OAuth](https://developers.google.com/identity/protocols/oauth2/web-server) — project prerequisites, callback validation, code exchange, and background access.
- [`profile`: users.getProfile](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users/getProfile) — the selected test operation and its accepted scopes.

Existing `scopes`, `consent`, and `review` sources remain attached to their applicable steps. New step IDs are `client`, `callback-security`, `token-exchange`, and `test-connection`; `test` now means configuring test-user eligibility only.

## Checks performed

- `npx vitest run tests/schema.test.ts` — **34 tests passed**.
- All eight seed guides pass runtime schema and citation-reference checks.
- GitHub remains six steps; Google / Gmail now has ten, within the twelve-step schema limit.
- The collection now has **52 authored steps and 29 source entries**; these are content counts, not completed actions or unique-source accuracy measurements.
- Only `content/seeds.json` and this correction note were changed for this task. The generated browser catalog must be refreshed by the coordinating build step.
- No accounts were accessed, no credentials were created, and no token exchange or provider submission was performed.

Schema tests establish structural integrity. The source review above supplies the factual support; it does not establish universal correctness or account-specific eligibility.
