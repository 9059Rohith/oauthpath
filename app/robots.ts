import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/generate"] },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || "https://oauthpath.vercel.app"}/sitemap.xml`,
  };
}
