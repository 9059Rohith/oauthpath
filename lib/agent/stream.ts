import { isPublicHttpsUrl } from "../schema";

export type ResearchProgress = {
  stage: "discover" | "fetch" | "synthesize" | "verify" | "save" | "done";
  message: string;
  url?: string;
  status?: number;
};
export type ResearchStreamEvent =
  | { type: "progress"; data: ResearchProgress }
  | {
      type: "complete";
      slug: string;
      mode?: "live" | "curated" | "document-scan";
    }
  | { type: "error"; message: string };

const INVALID =
  "The research response was incomplete or invalid. Please try again.";
const INTERRUPTED =
  "The research connection ended before a guide was saved. Please try again.";
const stages = new Set([
  "discover",
  "fetch",
  "synthesize",
  "verify",
  "save",
  "done",
]);
export function isGuideSlug(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9-]{1,100}$/.test(value);
}
function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function message(value: unknown): value is string {
  return (
    typeof value === "string" && value.trim().length > 0 && value.length <= 1200
  );
}

/** Incremental SSE decoding with bounded memory and validated UI-facing data. */
export class ResearchStreamDecoder {
  private decoder = new TextDecoder("utf-8", { fatal: true });
  private buffer = "";
  private bytes = 0;
  private events = 0;
  private terminal = false;

  push(chunk: Uint8Array): ResearchStreamEvent[] {
    if (this.terminal) return [];
    this.bytes += chunk.byteLength;
    if (this.bytes > 512 * 1024) throw new Error(INVALID);
    try {
      this.buffer += this.decoder.decode(chunk, { stream: true });
    } catch {
      throw new Error(INVALID);
    }
    if (this.buffer.length > 64 * 1024) throw new Error(INVALID);
    const result: ResearchStreamEvent[] = [];
    let boundary: RegExpExecArray | null;
    while ((boundary = /\r?\n\r?\n/.exec(this.buffer))) {
      const frame = this.buffer.slice(0, boundary.index);
      this.buffer = this.buffer.slice(boundary.index + boundary[0].length);
      const lines = frame.split(/\r?\n/);
      const type = lines
        .find((line) => line.startsWith("event:"))
        ?.slice(6)
        .trim();
      if (!type || type === "heartbeat") continue;
      if (++this.events > 100) throw new Error(INVALID);
      const raw = lines
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart())
        .join("\n");
      let data: unknown;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(INVALID);
      }
      if (!record(data)) throw new Error(INVALID);
      if (type === "error" || (type === "progress" && data.stage === "error")) {
        if (!message(data.message)) throw new Error(INVALID);
        result.push({ type: "error", message: data.message });
        this.terminal = true;
        break;
      }
      if (type === "complete") {
        if (
          !isGuideSlug(data.slug) ||
          (data.mode !== undefined &&
            !["live", "curated", "document-scan"].includes(String(data.mode)))
        )
          throw new Error(INVALID);
        result.push({
          type: "complete",
          slug: data.slug,
          mode: data.mode as "live" | "curated" | "document-scan" | undefined,
        });
        this.terminal = true;
        break;
      }
      if (
        type !== "progress" ||
        !stages.has(String(data.stage)) ||
        !message(data.message)
      )
        throw new Error(INVALID);
      if (
        data.url !== undefined &&
        (typeof data.url !== "string" ||
          data.url.length > 2048 ||
          !isPublicHttpsUrl(data.url))
      )
        throw new Error(INVALID);
      if (
        data.status !== undefined &&
        (typeof data.status !== "number" ||
          !Number.isInteger(data.status) ||
          data.status < 100 ||
          data.status > 599)
      )
        throw new Error(INVALID);
      result.push({
        type: "progress",
        data: {
          stage: data.stage as ResearchProgress["stage"],
          message: data.message,
          ...(data.url ? { url: data.url as string } : {}),
          ...(data.status ? { status: data.status as number } : {}),
        },
      });
    }
    return result;
  }

  finish(): void {
    if (!this.terminal) throw new Error(INTERRUPTED);
  }
}
