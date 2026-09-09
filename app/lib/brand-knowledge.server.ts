import "server-only";
import internationalKnowledge from "../../data/brand-knowledge-international/profiles.json";
import { canonicalManufacturerSlug } from "./international-manufacturer-identifiers";

export type BrandSource = {
  sourceId: string;
  tier: "A" | "B" | "C" | "D";
  type: string;
  scope: string;
  url: string;
  status: string;
  checkedAt: string;
};

export type BrandKnowledgeProfile = {
  manufacturerId: string;
  officialName: string;
  displayName: string;
  aliases: string[];
  formerNames: string[];
  officialWebsite: string;
  officialDomains: string[];
  country: string | null;
  headquarters: string | null;
  foundedYear: number | null;
  parentCompany: string | null;
  shortDescription: string;
  fullDescription: string[];
  productCategories: string[];
  productFamilies: string[];
  series: string[];
  industries: string[];
  officialCatalogs: string[];
  documentationSources: string[];
  sources: BrandSource[];
  contentLanguage: "en";
  enContentStatus: "EN_CONTENT_READY";
  enSeoStatus: "EN_SEO_READY";
};

export type BrandReadiness = "BRAND_SAFE" | "BRAND_WEAK" | "BRAND_REVIEW";

const profiles = new Map(
  (internationalKnowledge.profiles as BrandKnowledgeProfile[]).map(
    (profile) => [canonicalManufacturerSlug(profile.manufacturerId), profile],
  ),
);
const blocked = new Set(
  internationalKnowledge.blockedIdentities
    .map((entry) => canonicalManufacturerSlug(entry.manufacturerId)),
);

export function brandKnowledgeFor(slug: string) {
  return profiles.get(slug) ?? null;
}

export function brandReadinessFor(slug: string): BrandReadiness {
  if (blocked.has(slug)) return "BRAND_REVIEW";
  return profiles.has(slug) ? "BRAND_SAFE" : "BRAND_WEAK";
}

export function isBrandIndexable(slug: string) {
  return brandReadinessFor(slug) === "BRAND_SAFE";
}

export function brandDisplayName(slug: string, fallback: string) {
  return profiles.get(slug)?.displayName ?? fallback;
}

export function brandSeoTitle(slug: string, fallback: string) {
  const profile = profiles.get(slug);
  if (!profile) return `${fallback} equipment sourcing | Aihamyn Hampa Trading`;
  const primaryCategory = profile.productCategories[0];
  return `${profile.displayName} ${primaryCategory} | Aihamyn Hampa Trading`;
}

export function brandMetaDescription(slug: string, fallback: string) {
  const profile = profiles.get(slug);
  if (profile) {
    const areas = profile.productCategories.slice(0, 3).join(", ");
    return `Source ${profile.displayName} equipment across ${areas}. Send the complete part number, model or specification for pricing and lead-time review.`;
  }
  return `Request sourcing support for ${fallback} equipment using the complete model, part number or technical specification.`;
}

export const indexableBrandSlugs = Object.freeze([...profiles.keys()]);
