import { describe, expect, it } from "vitest";
import { readBoundedBody } from "../lib/security/request";
describe("bounded public input", () => {
  it("reads an ordinary JSON request", async () => {
    const request = new Request("https://oauthpath.dev/api/generate", {
      method: "POST",
      body: '{"query":"Linear"}',
    });
    expect(await readBoundedBody(request)).toBe('{"query":"Linear"}');
  });
  it("rejects a body over the byte budget without content-length", async () => {
    const request = new Request("https://oauthpath.dev/api/generate", {
      method: "POST",
      body: "a".repeat(1501),
    });
    await expect(readBoundedBody(request)).rejects.toThrow("INPUT_TOO_LARGE");
  });
  it("counts multibyte input in bytes, not JS characters", async () => {
    const request = new Request("https://oauthpath.dev/api/generate", {
      method: "POST",
      body: "あ".repeat(600),
    });
    await expect(readBoundedBody(request)).rejects.toThrow("INPUT_TOO_LARGE");
  });
  it("rejects an oversized declared payload before reading it", async () => {
    const request = new Request("https://oauthpath.dev/api/generate", {
      method: "POST",
      headers: { "content-length": "9000" },
      body: "{}",
    });
    await expect(readBoundedBody(request)).rejects.toThrow("INPUT_TOO_LARGE");
  });
});
