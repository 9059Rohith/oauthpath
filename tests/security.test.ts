import { EventEmitter } from "node:events";
import { Readable } from "node:stream";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ lookup: vi.fn(), request: vi.fn() }));
vi.mock("node:dns/promises", () => ({ lookup: mocks.lookup }));
vi.mock("node:https", () => ({ request: mocks.request }));

import {
  isPublicAddress,
  safeFetch,
  validatePublicUrl,
} from "../lib/security/safe-fetch";

function respond(
  body = "Official OAuth documentation",
  status = 200,
  headers: Record<string, string> = {},
) {
  mocks.request.mockImplementationOnce((_url, _options, callback) => {
    const req = new EventEmitter() as EventEmitter & { end: () => void };
    req.end = () => {
      const res = Readable.from([Buffer.from(body)]) as Readable & {
        statusCode: number;
        headers: Record<string, string>;
      };
      res.statusCode = status;
      res.headers = { "content-type": "text/html; charset=utf-8", ...headers };
      callback(res);
    };
    return req;
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.lookup.mockResolvedValue([{ address: "93.184.216.34", family: 4 }]);
});

describe("public URL boundary", () => {
  it.each([
    "http://github.com",
    "file:///etc/passwd",
    "https://127.0.0.1",
    "https://2130706433",
    "https://0x7f000001",
    "https://[::1]",
    "https://[::ffff:127.0.0.1]",
    "https://169.254.169.254/latest/meta-data",
    "https://0.0.0.0",
    "https://localhost.localdomain",
    "https://internal",
    "https://service.local",
    "https://api.internal",
    "https://admin.home.arpa",
    "https://username:password@github.com",
    "https://user@127.0.0.1@evil.com",
    "https://github.com:8443",
    "https://github.com\r\nHost: localhost",
    "https://github.com\\@localhost",
    "https://private.test",
    "https://_service.github.com",
    "https://api..github.com",
  ])("rejects unsafe input %s", (url) => {
    expect(() => validatePublicUrl(url)).toThrow();
  });

  it("normalizes the hostname, removes fragments, and accepts the default HTTPS port", () => {
    expect(
      validatePublicUrl("https://GitHub.COM.:443/docs?mode=oauth#fragment")
        .href,
    ).toBe("https://github.com/docs?mode=oauth");
  });
  it("converts a Unicode hostname to its ASCII representation", () => {
    expect(validatePublicUrl("https://bücher.de/docs").hostname).toBe(
      "xn--bcher-kva.de",
    );
  });
  it("bounds URL length", () => {
    expect(() =>
      validatePublicUrl(`https://github.com/${"a".repeat(2048)}`),
    ).toThrow();
  });
});

describe("IP classification", () => {
  it.each([
    "127.0.0.1",
    "0.0.0.0",
    "10.2.3.4",
    "172.16.2.3",
    "192.168.1.1",
    "169.254.169.254",
    "100.64.0.1",
    "192.0.0.9",
    "192.0.2.1",
    "198.51.100.1",
    "203.0.113.1",
    "224.0.0.1",
    "240.0.0.1",
    "::",
    "::1",
    "fc00::1",
    "fe80::1",
    "ff02::1",
    "2001:db8::1",
    "::ffff:127.0.0.1",
    "::ffff:8.8.8.8",
    "not-an-ip",
  ])("rejects non-public or transition address %s", (ip) => {
    expect(isPublicAddress(ip)).toBe(false);
  });
  it.each(["8.8.8.8", "1.1.1.1", "93.184.216.34", "2606:4700:4700::1111"])(
    "accepts public address %s",
    (ip) => {
      expect(isPublicAddress(ip)).toBe(true);
    },
  );
});

describe("DNS-pinned HTTPS fetch", () => {
  it("pins the checked IP while preserving the original TLS hostname", async () => {
    respond();
    const page = await safeFetch("https://docs.github.com/oauth");
    expect(page.status).toBe(200);
    expect(page.text).toContain("Official OAuth");
    expect(mocks.lookup).toHaveBeenCalledTimes(1);
    const options = mocks.request.mock.calls[0]?.[1];
    expect(options.servername).toBe("docs.github.com");
    expect(options.agent).toBe(false);
    const callback = vi.fn();
    options.lookup("docs.github.com", {}, callback);
    expect(callback).toHaveBeenCalledWith(null, "93.184.216.34", 4);
    options.lookup("docs.github.com", { all: true }, callback);
    expect(callback).toHaveBeenLastCalledWith(null, [
      { address: "93.184.216.34", family: 4 },
    ]);
    expect(mocks.lookup).toHaveBeenCalledTimes(1);
  });
  it("rejects a DNS response mixing public and private addresses before connecting", async () => {
    mocks.lookup.mockResolvedValue([
      { address: "8.8.8.8", family: 4 },
      { address: "10.0.0.1", family: 4 },
    ]);
    await expect(safeFetch("https://docs.github.com")).rejects.toThrow(
      "public addresses",
    );
    expect(mocks.request).not.toHaveBeenCalled();
  });
  it("validates the address of every redirect destination", async () => {
    respond("", 302, { location: "https://redirect.attacker.com/docs" });
    mocks.lookup
      .mockResolvedValueOnce([{ address: "8.8.8.8", family: 4 }])
      .mockResolvedValueOnce([{ address: "169.254.169.254", family: 4 }]);
    await expect(safeFetch("https://docs.github.com")).rejects.toThrow(
      "public addresses",
    );
    expect(mocks.request).toHaveBeenCalledTimes(1);
  });
  it("rejects redirects to an IP literal without making a second request", async () => {
    respond("", 302, { location: "https://127.0.0.1/private" });
    await expect(safeFetch("https://docs.github.com")).rejects.toThrow();
    expect(mocks.request).toHaveBeenCalledTimes(1);
  });
  it("caps redirect chains", async () => {
    for (let i = 0; i < 4; i++) respond("", 302, { location: `/page-${i}` });
    await expect(safeFetch("https://docs.github.com")).rejects.toThrow(
      "too many",
    );
    expect(mocks.request).toHaveBeenCalledTimes(4);
  });
  it("blocks compressed responses and binary content", async () => {
    respond("compressed", 200, { "content-encoding": "gzip" });
    await expect(safeFetch("https://docs.github.com")).rejects.toThrow(
      "format",
    );
    respond("binary", 200, { "content-type": "application/octet-stream" });
    await expect(safeFetch("https://docs.github.com")).rejects.toThrow(
      "format",
    );
  });
  it("caps a chunked response without trusting Content-Length", async () => {
    respond("x".repeat(751 * 1024));
    await expect(safeFetch("https://docs.github.com")).rejects.toThrow(
      "size limit",
    );
  });
  it("applies a deadline to DNS lookup", async () => {
    mocks.lookup.mockReturnValue(new Promise(() => undefined));
    await expect(
      safeFetch("https://docs.github.com", { timeoutMs: 10 }),
    ).rejects.toThrow("timed out");
    expect(mocks.request).not.toHaveBeenCalled();
  });
  it("honors an already cancelled operation", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      safeFetch("https://docs.github.com", { signal: controller.signal }),
    ).rejects.toThrow("cancelled");
    expect(mocks.request).not.toHaveBeenCalled();
  });
});
