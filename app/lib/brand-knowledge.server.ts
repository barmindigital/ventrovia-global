import "server-only";
import facts from "../../data/brand-knowledge/curated-brand-facts.json";

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
};

export type BrandReadiness = "BRAND_SAFE" | "BRAND_WEAK" | "BRAND_REVIEW";

const profiles = new Map(
  (facts.profiles as BrandKnowledgeProfile[]).map((profile) => [
    profile.manufacturerId,
    profile,
  ]),
);
const blocked = new Set(facts.blockedIdentities.map((entry) => entry.manufacturerId));

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
  const name = brandDisplayName(slug, fallback);
  return profiles.has(slug)
    ? `${name} — оборудование и подбор`
    : `${name}: подбор по модели`;
}

export function brandMetaDescription(slug: string, fallback: string) {
  const profile = profiles.get(slug);
  if (profile) {
    const areas = profile.productCategories.slice(0, 3).join(", ").toLocaleLowerCase("ru");
    return `${profile.displayName}: ${areas}. Подбор оборудования по модели, артикулу или спецификации; цена и срок поставки — по запросу.`;
  }
  return `${fallback}: подбор продукции по полной модели, артикулу, маркировке или спецификации. Данные проверяются перед подготовкой предложения.`;
}

export const indexableBrandSlugs = Object.freeze([...profiles.keys()]);
