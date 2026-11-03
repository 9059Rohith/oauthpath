import type { MetadataRoute } from "next";
import { guides } from "@/lib/guides";
export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL || "https://oauthpath.vercel.app";
  return [
    "",
    "/library",
    "/start",
    "/methodology",
    ...guides.map((g) => `/guide/${g.slug}`),
  ].map((path) => ({ url: `${base}${path}`, lastModified: "2026-11-03" }));
}
