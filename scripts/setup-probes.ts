import { load } from "cheerio";
import { z } from "zod";
import { safeFetch } from "../lib/security/safe-fetch";

// Read-only, anonymous setup-entry probes. No cookies, credentials, POSTs, or
// authorization requests are sent. Run with: node --import tsx scripts/setup-probes.ts
const targets = [
  {
    provider: "GitHub",
    url: "https://github.com/settings/applications/new",
    kind: "setup-entry",
  },
  { provider: "Slack", url: "https://api.slack.com/apps", kind: "setup-entry" },
  {
    provider: "Google",
    url: "https://console.cloud.google.com/apis/credentials/oauthclient",
    kind: "setup-entry",
  },
  {
    provider: "Google OIDC",
    url: "https://accounts.google.com/.well-known/openid-configuration",
    kind: "documented-discovery",
  },
] as const;

const discoverySchema = z.object({
  issuer: z.url(),
  authorization_endpoint: z.url(),
  token_endpoint: z.url(),
  jwks_uri: z.url(),
  revocation_endpoint: z.url().optional(),
  code_challenge_methods_supported: z.array(z.string()).optional(),
});

async function probe(target: (typeof targets)[number]) {
  const startedAt = new Date().toISOString();
  try {
    const page = await safeFetch(target.url, { timeoutMs: 15_000 });
    if (target.kind === "documented-discovery") {
      const metadata = discoverySchema.parse(JSON.parse(page.text) as unknown);
      return {
        provider: target.provider,
        kind: target.kind,
        requestedUrl: target.url,
        startedAt,
        finishedAt: new Date().toISOString(),
        finalUrl: page.url,
        httpStatus: page.status,
        latencyMs: page.latencyMs,
        outcome: "discovery-metadata-retrieved",
        metadata,
        boundary:
          "Metadata retrieval only; no client registration, consent, token exchange, or production approval tested.",
      };
    }
    const $ = load(page.text);
    $("script, style, noscript, template").remove();
    const title = $("title").text().replace(/\s+/gu, " ").trim().slice(0, 180);
    const body = $("body").text().replace(/\s+/gu, " ").trim();
    const loginIndicators = [
      ...new Set(
        body.match(
          /.{0,45}(?:sign in|log in|login|required to sign|create an account).{0,65}/giu,
        ) ?? [],
      ),
    ].slice(0, 3);
    const loginUrl = /\/(?:login|signin|ServiceLogin)(?:[/?#]|$)/iu.test(
      page.url,
    );
    return {
      provider: target.provider,
      kind: target.kind,
      requestedUrl: target.url,
      startedAt,
      finishedAt: new Date().toISOString(),
      finalUrl: page.url,
      httpStatus: page.status,
      latencyMs: page.latencyMs,
      title,
      loginIndicators,
      outcome:
        page.status >= 400
          ? "http-error"
          : loginUrl
            ? "redirected-to-sign-in"
            : loginIndicators.length
              ? "page-contains-sign-in-prompt"
              : "public-page-retrieved",
      boundary:
        "Anonymous page retrieval only; no logged-in form interaction, account ownership, credentials, installation, or approval tested.",
    };
  } catch (error) {
    return {
      provider: target.provider,
      kind: target.kind,
      requestedUrl: target.url,
      startedAt,
      finishedAt: new Date().toISOString(),
      finalUrl: null,
      httpStatus: null,
      outcome: "fetch-or-validation-failed",
      error: error instanceof Error ? error.message : "Unknown fetch failure",
      boundary:
        "No final HTTP response available through safeFetch; this is not evidence of a login wall or unsupported OAuth.",
    };
  }
}

async function main() {
  const results = await Promise.all(targets.map(probe));
  console.log(
    JSON.stringify({ mode: "anonymous-read-only", results }, null, 2),
  );
}

void main();
