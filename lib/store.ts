import { get, put, list } from "@vercel/blob";
import { createHmac } from "node:crypto";
import { assertGuide, type Guide } from "./schema";

export async function saveGuide(guide: Guide) {
  const validated = assertGuide(guide);
  await put(`guides/${validated.slug}.json`, JSON.stringify(validated), {
    access: "private",
    addRandomSuffix: false,
    contentType: "application/json",
    allowOverwrite: false,
  });
}
export async function readGuide(slug: string): Promise<Guide | null> {
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) return null;
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID)
    return null;
  const result = await get(`guides/${slug}.json`, {
    access: "private",
    useCache: true,
  });
  if (!result || result.statusCode !== 200) return null;
  return assertGuide(await new Response(result.stream).json());
}
export async function reserveGeneration(ip: string) {
  const salt = process.env.BLOB_READ_WRITE_TOKEN;
  if (!salt) throw new Error("STORAGE_UNAVAILABLE");
  const day = new Date().toISOString().slice(0, 10);
  const hour = new Date().toISOString().slice(0, 13);
  const identity = createHmac("sha256", salt)
    .update(`${day}:${ip}`)
    .digest("hex")
    .slice(0, 24);
  // Immutable slot writes enforce cross-instance limits without an in-memory counter.
  async function claim(prefix: string, limit: number) {
    const existing = await list({ prefix, limit: 100 });
    const used = new Set(existing.blobs.map((b) => b.pathname));
    for (let slot = 0; slot < limit; slot++) {
      const pathname = `${prefix}${slot}.json`;
      if (used.has(pathname)) continue;
      try {
        await put(pathname, "{}", {
          access: "private",
          addRandomSuffix: false,
          allowOverwrite: false,
          contentType: "application/json",
        });
        return;
      } catch (error) {
        if (
          error instanceof Error &&
          /already exists|overwrite|precondition/i.test(error.message)
        )
          continue;
        throw error;
      }
    }
    throw new Error("RATE_LIMITED");
  }
  await claim(`limits/user/${hour}/${identity}/`, 5);
  await claim(`limits/global/${day}/`, 30);
}
