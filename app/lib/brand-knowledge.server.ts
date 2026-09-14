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

// Catalogue and documentation entries are rendered as outbound links, so only
// absolute web addresses are kept; a bare catalogue title would become a 404.
const isWebAddress = (value: string) => /^https?:\/\//iu.test(value);

const profiles = new Map(
  (internationalKnowledge.profiles as BrandKnowledgeProfile[]).map(
    (profile) => [
      canonicalManufacturerSlug(profile.manufacturerId),
      {
        ...profile,
        officialCatalogs: profile.officialCatalogs.filter(isWebAddress),
        documentationSources: profile.documentationSources.filter(isWebAddress),
      },
    ],
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

const SEO_TITLE_LIMIT = 60;
const SEO_DESCRIPTION_LIMIT = 160;

// Search results cut titles near 60 characters and descriptions near 160, so the
// brand suffix and the number of product areas shrink until the text fits.
export function brandSeoTitle(slug: string, fallback: string) {
  const profile = profiles.get(slug);
  const subject = profile ? `${profile.displayName} ${profile.productCategories[0]}` : `${fallback} equipment sourcing`;
  return [`${subject} | Aihamyn Hampa Trading`, `${subject} | Aihamyn`].find((title) => title.length <= SEO_TITLE_LIMIT) ?? subject;
}

export function brandMetaDescription(slug: string, fallback: string) {
  const profile = profiles.get(slug);
  if (!profile) {
    return `Request sourcing support for ${fallback} equipment using the complete model, part number or technical specification.`;
  }
  const candidates = [3, 2, 1].flatMap((count) => {
    const areas = profile.productCategories.slice(0, count).join(", ");
    return [
      `Source ${profile.displayName} equipment across ${areas}. Send the part number, model or specification for pricing and lead time.`,
      `Source ${profile.displayName} ${areas}. Send the part number or model for pricing and lead time.`,
    ];
  });
  return candidates.find((description) => description.length <= SEO_DESCRIPTION_LIMIT) ?? candidates.at(-1)!;
}

export const indexableBrandSlugs = Object.freeze([...profiles.keys()]);
