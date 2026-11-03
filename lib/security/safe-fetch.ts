import { lookup } from "node:dns/promises";
import { request } from "node:https";
import ipaddr from "ipaddr.js";

const MAX_BYTES = 750 * 1024;
const MAX_REDIRECTS = 3;
const FORBIDDEN_SUFFIXES = [
  "localhost",
  "localdomain",
  "local",
  "internal",
  "intranet",
  "lan",
  "home",
  "home.arpa",
  "onion",
  "invalid",
  "test",
  "example",
];
const REDIRECT_CODES = new Set([301, 302, 303, 307, 308]);

export interface SafePage {
  url: string;
  status: number;
  text: string;
  latencyMs: number;
}

export class UnsafeUrlError extends Error {
  constructor(
    message = "Use a public HTTPS website without credentials or custom ports.",
  ) {
    super(message);
    this.name = "UnsafeUrlError";
  }
}

/** Parse once, normalize IDNs, and reject destinations outside the public-web boundary. */
export function validatePublicUrl(input: string): URL {
  if (input.length > 2048 || /[\u0000-\u0020\u007f\\]/u.test(input)) {
    throw new UnsafeUrlError();
  }
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new UnsafeUrlError();
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    (url.port && url.port !== "443")
  ) {
    throw new UnsafeUrlError();
  }
  const hostname = url.hostname.toLowerCase().replace(/\.$/u, "");
  if (
    !hostname.includes(".") ||
    hostname.length > 253 ||
    hostname.includes(":") ||
    ipaddr.isValid(hostname) ||
    FORBIDDEN_SUFFIXES.some(
      (suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`),
    ) ||
    hostname
      .split(".")
      .some((label) => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/u.test(label))
  ) {
    throw new UnsafeUrlError();
  }
  url.hostname = hostname;
  url.hash = "";
  return url;
}

/** Only ordinary globally routable unicast addresses may be used for a connection. */
export function isPublicAddress(address: string): boolean {
  try {
    const parsed = ipaddr.parse(address);
    if (parsed.range() !== "unicast") return false;
    // Reject IETF special-purpose IPv4 space conservatively, including globally
    // reachable exceptions that are not useful as provider documentation hosts.
    const bytes = parsed.toByteArray();
    if (
      parsed.kind() === "ipv4" &&
      bytes[0] === 192 &&
      bytes[1] === 0 &&
      bytes[2] === 0
    )
      return false;
    return true;
  } catch {
    return false;
  }
}

function withinDeadline<T>(
  promise: Promise<T>,
  signal: AbortSignal,
): Promise<T> {
  if (signal.aborted)
    return Promise.reject(
      new Error("Research request was cancelled or timed out."),
    );
  return new Promise<T>((resolve, reject) => {
    const abort = () =>
      reject(new Error("Research request was cancelled or timed out."));
    signal.addEventListener("abort", abort, { once: true });
    promise
      .then(resolve, reject)
      .finally(() => signal.removeEventListener("abort", abort));
  });
}

type FetchResponse = { status: number; text: string; redirect?: string };

async function fetchOne(url: URL, signal: AbortSignal): Promise<FetchResponse> {
  const addresses = await withinDeadline(
    lookup(url.hostname, { all: true, verbatim: true }),
    signal,
  );
  const chosen = addresses[0];
  // Reject mixed public/private answers rather than choosing the convenient answer.
  if (!chosen || addresses.some(({ address }) => !isPublicAddress(address))) {
    throw new UnsafeUrlError(
      "The website does not resolve exclusively to public addresses.",
    );
  }
  return new Promise<FetchResponse>((resolve, reject) => {
    const req = request(
      url,
      {
        method: "GET",
        signal,
        agent: false,
        servername: url.hostname,
        family: chosen.family,
        // DNS is never consulted again for this connection: preserve hostname/SNI
        // for certificate validation while connecting only to the validated address.
        lookup: (_hostname, options, callback) => {
          if (options.all) callback(null, [chosen]);
          else callback(null, chosen.address, chosen.family);
        },
        headers: {
          "User-Agent": "OAuthPath/1.0 (public documentation research)",
          Accept:
            "text/html, text/plain, text/markdown, application/json, application/xhtml+xml",
          "Accept-Encoding": "identity",
        },
      },
      (res) => {
        const status = res.statusCode ?? 0;
        const location = res.headers.location;
        if (REDIRECT_CODES.has(status) && location) {
          res.destroy();
          resolve({ status, text: "", redirect: location });
          return;
        }
        const type =
          (res.headers["content-type"] ?? "")
            .split(";")[0]
            ?.trim()
            .toLowerCase() ?? "";
        const allowed =
          [
            "text/html",
            "text/plain",
            "text/markdown",
            "application/json",
            "application/xhtml+xml",
          ].includes(type) || /^application\/[a-z0-9.+-]+\+json$/u.test(type);
        const encoding = res.headers["content-encoding"];
        if (!allowed || (encoding && encoding !== "identity")) {
          res.destroy();
          reject(
            new Error("The website returned an unsupported document format."),
          );
          return;
        }
        if (Number(res.headers["content-length"] ?? 0) > MAX_BYTES) {
          res.destroy();
          reject(new Error("The document exceeds the research size limit."));
          return;
        }
        let size = 0;
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > MAX_BYTES) {
            res.destroy();
            reject(new Error("The document exceeds the research size limit."));
          } else {
            chunks.push(chunk);
          }
        });
        res.on("end", () =>
          resolve({ status, text: Buffer.concat(chunks).toString("utf8") }),
        );
        res.on("error", reject);
        res.on("aborted", () =>
          reject(
            new Error("The website closed the document before it completed."),
          ),
        );
      },
    );
    req.on("error", reject);
    req.end();
  });
}

/** Fetch a bounded public document; one deadline covers DNS, redirects, and the body. */
export async function safeFetch(
  raw: string,
  options: { signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<SafePage> {
  const started = Date.now();
  const controller = new AbortController();
  const timeoutMs = Math.min(15_000, Math.max(1, options.timeoutMs ?? 10_000));
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const cancel = () => controller.abort();
  options.signal?.addEventListener("abort", cancel, { once: true });
  if (options.signal?.aborted) controller.abort();
  try {
    let url = validatePublicUrl(raw);
    for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
      const response = await fetchOne(url, controller.signal);
      if (!response.redirect) {
        return {
          url: url.toString(),
          status: response.status,
          text: response.text,
          latencyMs: Date.now() - started,
        };
      }
      if (redirects === MAX_REDIRECTS)
        throw new Error("The website redirected too many times.");
      // Relative and cross-domain redirects have exactly the same validation path.
      url = validatePublicUrl(new URL(response.redirect, url).toString());
    }
    throw new Error("Unable to fetch the website.");
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", cancel);
  }
}
