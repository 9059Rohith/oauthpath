import { z } from "zod";
import { findSeed } from "@/lib/guides";
import { research } from "@/lib/agent/research";
import { reserveGeneration, saveGuide } from "@/lib/store";
import { validatePublicUrl } from "@/lib/security/safe-fetch";
import { readBoundedBody } from "@/lib/security/request";
export const runtime = "nodejs";
export const maxDuration = 180;
const inputSchema = z.object({
  query: z
    .string()
    .trim()
    .min(2)
    .max(180)
    .refine(
      (s) => !/[\x00-\x1f<>]/.test(s),
      "Enter an app name or public website.",
    ),
  refresh: z.boolean().optional(),
});
export async function POST(request: Request) {
  if (
    request.headers.get("origin") &&
    request.headers.get("origin") !== new URL(request.url).origin
  )
    return Response.json(
      { error: "Cross-origin generation is not allowed." },
      { status: 403 },
    );
  let text: string;
  try {
    text = await readBoundedBody(request);
  } catch {
    return Response.json({ error: "Input is too large." }, { status: 413 });
  }
  let body;
  try {
    body = inputSchema.parse(JSON.parse(text));
    if (/^https?:|\.[a-z]{2,}(\/|$)/i.test(body.query))
      validatePublicUrl(
        body.query.startsWith("http") ? body.query : `https://${body.query}`,
      );
  } catch {
    return Response.json(
      {
        error:
          "Enter an app name or a public HTTPS website. Private network addresses are not supported.",
      },
      { status: 400 },
    );
  }
  const cached = findSeed(body.query);
  if (cached && !body.refresh)
    return Response.json({ slug: cached.slug, cached: true });
  try {
    await reserveGeneration(
      request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
        "local",
    );
  } catch (error) {
    const limited = error instanceof Error && error.message === "RATE_LIMITED";
    return Response.json(
      {
        error: limited
          ? "Research limit reached. Try again later; the library is always available."
          : "Research storage is temporarily unavailable. Please try again later.",
      },
      { status: limited ? 429 : 503, headers: { "Retry-After": "3600" } },
    );
  }
  const encoder = new TextEncoder();
  const abort = new AbortController();
  const timeout = setTimeout(() => abort.abort(), 150000);
  request.signal.addEventListener("abort", () => abort.abort(), { once: true });
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(
              `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
            ),
          );
        } catch {
          abort.abort();
        }
      };
      const heartbeat = setInterval(
        () => send("heartbeat", { at: Date.now() }),
        12000,
      );
      try {
        const guide = await research(
          body.query,
          (data) => send("progress", data),
          abort.signal,
        );
        abort.signal.throwIfAborted();
        send("progress", {
          stage: "save",
          message: "Saving a permanent, shareable guide.",
        });
        await saveGuide(guide);
        send("complete", { slug: guide.slug, mode: guide.generation?.mode });
      } catch (error) {
        const message = error instanceof Error ? error.message : "UNKNOWN";
        const safe =
          message === "NEED_WEBSITE"
            ? "We could not confidently identify this provider. Paste its official public website or OAuth documentation URL."
            : message === "NO_SOURCES"
              ? "No usable official OAuth sources were found. Try a direct provider documentation URL."
              : message === "SOURCE_UNAVAILABLE"
                ? "The provider’s public documentation did not respond. Try a direct documentation URL."
                : message === "CITATION_FAILED"
                  ? "The draft did not pass citation checks. No unverified guide was published. Please retry."
                  : abort.signal.aborted
                    ? "Research timed out. Try a direct OAuth documentation URL for a narrower scan."
                    : "Research could not finish. Try a direct documentation URL, or open an existing guide.";
        send("error", { message: safe });
      } finally {
        clearInterval(heartbeat);
        clearTimeout(timeout);
        try {
          controller.close();
        } catch {
          /* Client disconnected. */
        }
      }
    },
    cancel() {
      abort.abort();
      clearTimeout(timeout);
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
