import type { MetadataRoute } from "next";
import { isBrandIndexable } from "./lib/brand-knowledge.server";
import { manufacturers } from "./lib/manufacturer-directory";
import { SITE_URL } from "./lib/site-brand";

// Timeweb preserves Next's route cache between application releases. Keep the
// readiness-driven sitemap dynamic so a newly published brand cohort cannot be
// hidden behind the previous deployment's cached XML.
export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/manufacturers`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    { url: `${SITE_URL}/services`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.7 },
    {
      url: `${SITE_URL}/contacts`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const manufacturerPages: MetadataRoute.Sitemap = manufacturers
    .filter((manufacturer) => isBrandIndexable(manufacturer.slug))
    .map((manufacturer) => ({
      url: `${SITE_URL}/manufacturers/${manufacturer.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    }));

  return [...staticPages, ...manufacturerPages];
}
