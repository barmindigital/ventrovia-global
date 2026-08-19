import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/site-brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/catalog",
        "/catalog/",
        "/data/catalog",
        "/data/catalog/",
        "/manufacturers/logos",
        "/admin",
        "/api/admin",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
