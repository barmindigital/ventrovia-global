import type { MetadataRoute } from "next";
import { manufacturers, products } from "./lib/catalog-data";
import { SITE_URL } from "./lib/seo-content";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/catalog`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/manufacturers`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contacts`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const manufacturerPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/manufacturers/abb`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...manufacturers
      .filter(
        (manufacturer) =>
          manufacturer.slug !== "abb" && manufacturer.count > 0,
      )
      .map((manufacturer) => ({
        url: `${SITE_URL}/manufacturers/${manufacturer.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
  ];

  const verifiedProductPages: MetadataRoute.Sitemap = products
    .filter((product) => product.completeness >= 65)
    .map((product) => ({
      url: `${SITE_URL}/catalog/${product.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }));

  return [...staticPages, ...manufacturerPages, ...verifiedProductPages];
}
