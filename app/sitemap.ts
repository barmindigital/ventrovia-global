import type { MetadataRoute } from "next";
import { categories, manufacturers, products } from "./lib/catalog-data";
import {
  isCatalogPimEntityIndexable,
  toCatalogPimCategory,
  toCatalogPimManufacturer,
  toCatalogPimProduct,
} from "./lib/catalog-pim";
import { SITE_URL } from "./lib/seo-content";
import {
  CATALOG_TRUST_ROLLOUT_PHASE,
  catalogTrustPilotProducts,
} from "./generated/catalog-trust-pilot";

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
    .filter((category) =>
      isCatalogPimEntityIndexable(toCatalogPimCategory(category)),
    )
    .map((category) => ({
      url: `${SITE_URL}/catalog/category/${category.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));

  const manufacturerPages: MetadataRoute.Sitemap = manufacturers
    .filter((manufacturer) =>
      isCatalogPimEntityIndexable(toCatalogPimManufacturer(manufacturer)),
    )
    .map((manufacturer) => ({
      url: `${SITE_URL}/manufacturers/${manufacturer.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const verifiedProductPages: MetadataRoute.Sitemap = products
    .filter((product) =>
      isCatalogPimEntityIndexable(toCatalogPimProduct(product)),
    )
    .map((product) => ({
      url: `${SITE_URL}/catalog/${product.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }));

  const structuralPilotPages: MetadataRoute.Sitemap =
    CATALOG_TRUST_ROLLOUT_PHASE === "pilot"
      ? catalogTrustPilotProducts.map(({ id }) => ({
          url: `${SITE_URL}/catalog/position/${id}`,
          changeFrequency: "monthly" as const,
          priority: 0.55,
        }))
      : [];

  return [
    ...staticPages,
    ...categoryPages,
    ...manufacturerPages,
    ...verifiedProductPages,
    ...structuralPilotPages,
  ];
}
