import { describe, expect, it } from "vitest";
import { isGuideSlug, ResearchStreamDecoder } from "../lib/agent/stream";
const encode = (value: string) => new TextEncoder().encode(value);
const frame = (event: string, data: unknown) =>
  `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

describe("bounded research event stream", () => {
  it("decodes fragmented UTF-8, CRLF frames and a successful completion", () => {
    const parser = new ResearchStreamDecoder();
    const bytes = encode(
      (
        frame("progress", {
          stage: "fetch",
          message: "Reading café docs",
          url: "https://docs.github.com/",
          status: 200,
        }) + frame("complete", { slug: "github", mode: "live" })
      ).replace(/\n/g, "\r\n"),
    );
    const events = Array.from(bytes).flatMap((byte) =>
      parser.push(new Uint8Array([byte])),
    );
    expect(events).toEqual([
      {
        type: "progress",
        data: {
          stage: "fetch",
          message: "Reading café docs",
          url: "https://docs.github.com/",
          status: 200,
        },
      },
      { type: "complete", slug: "github", mode: "live" },
    ]);
    expect(() => parser.finish()).not.toThrow();
  });
  it.each([
    "",
    frame("heartbeat", { at: 1 }),
    frame("progress", { stage: "discover", message: "Searching" }),
    'event: complete\ndata: {"slug":"github"}',
  ])("reports EOF without a complete or error event: %s", (content) => {
    const parser = new ResearchStreamDecoder();
    parser.push(encode(content));
    expect(() => parser.finish()).toThrow("ended before a guide was saved");
  });
  it.each(["error", "progress"])(
    "recognizes a first-event %s failure",
    (type) => {
      const parser = new ResearchStreamDecoder();
      expect(
        parser.push(
          encode(frame(type, { stage: "error", message: "No sources found." })),
        ),
      ).toEqual([{ type: "error", message: "No sources found." }]);
      expect(() => parser.finish()).not.toThrow();
    },
  );
  it.each([
    "javascript:alert(1)",
    "https://user:secret@example.com",
    "https://127.0.0.1",
    "not-a-url",
  ])("rejects unsafe activity links: %s", (url) => {
    const parser = new ResearchStreamDecoder();
    expect(() =>
      parser.push(
        encode(frame("progress", { stage: "fetch", message: "Reading", url })),
      ),
    ).toThrow("invalid");
  });
  it.each([
    "../admin",
    "javascript:alert(1)",
    "abc?x=1",
    "x".repeat(101),
    null,
    1,
  ])("rejects unsafe navigation slug: %s", (slug) => {
    expect(isGuideSlug(slug)).toBe(false);
    expect(() =>
      new ResearchStreamDecoder().push(encode(frame("complete", { slug }))),
    ).toThrow("invalid");
  });
  it("rejects malformed data and bounded-buffer overflow with useful messages", () => {
    expect(() =>
      new ResearchStreamDecoder().push(
        encode("event: progress\ndata: {broken}\n\n"),
      ),
    ).toThrow("Please try again");
    expect(() =>
      new ResearchStreamDecoder().push(encode("x".repeat(65537))),
    ).toThrow("invalid");
  });
  it("bounds the number of rendered activity events", () => {
    const parser = new ResearchStreamDecoder();
    const event = encode(
      frame("progress", { stage: "fetch", message: "Reading" }),
    );
    for (let index = 0; index < 100; index++) parser.push(event);
    expect(() => parser.push(event)).toThrow("invalid");
  });
  it("ignores heartbeat/comment frames and does not accept messages after completion", () => {
    const parser = new ResearchStreamDecoder();
    expect(
      parser.push(encode(": keepalive\n\n" + frame("heartbeat", {}))),
    ).toEqual([]);
    parser.push(encode(frame("complete", { slug: "github" })));
    expect(
      parser.push(
        encode(frame("progress", { stage: "error", message: "Late" })),
      ),
    ).toEqual([]);
  });
});
