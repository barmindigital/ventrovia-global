import type { MetadataRoute } from "next";
import { categories, manufacturers, products } from "./lib/catalog-data";
import { isProductIndexable } from "./lib/catalog-verification";
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

  const categoryPages: MetadataRoute.Sitemap = categories
    .filter((category) => category.count > 0)
    .map((category) => ({
      url: `${SITE_URL}/catalog/category/${category.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));

  const manufacturerPages: MetadataRoute.Sitemap = manufacturers
    .filter(
      (manufacturer) =>
        manufacturer.verificationStatus === "verified" &&
        manufacturer.count > 0,
    )
    .map((manufacturer) => ({
      url: `${SITE_URL}/manufacturers/${manufacturer.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const verifiedProductPages: MetadataRoute.Sitemap = products
    .filter(isProductIndexable)
    .map((product) => ({
      url: `${SITE_URL}/catalog/${product.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }));

  return [
    ...staticPages,
    ...categoryPages,
    ...manufacturerPages,
    ...verifiedProductPages,
  ];
}
