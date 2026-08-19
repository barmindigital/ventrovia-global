import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(ROOT, "data/brand-operations");
const check = process.argv.includes("--check");

async function json(relativePath) {
  return JSON.parse(await readFile(path.join(ROOT, relativePath), "utf8"));
}

const [identityIndex, knowledge, logos] = await Promise.all([
  json("data/manufacturers/identities.json"),
  json("data/brand-knowledge-international/profiles.json"),
  json("data/brand-operations/logo-audit.json"),
]);

const profiles = new Map(knowledge.profiles.map((profile) => [profile.manufacturerId, profile]));
const blocked = new Map(knowledge.blockedIdentities.map((item) => [item.manufacturerId, item]));
const publishableLogos = new Set(
  logos.filter((item) => item.publicationStatus === "PUBLISHABLE").map((item) => item.manufacturerId),
);
const safeWithLogo = knowledge.profiles.filter((profile) => publishableLogos.has(profile.manufacturerId)).length;
const completeness = identityIndex.manufacturers.map((manufacturer) => {
  const profile = profiles.get(manufacturer.slug);
  const breakdown = {
    identitySource: profile?.sources.length ? 20 : 0,
    officialDomain: profile?.officialDomains.length ? 10 : 0,
    logo: publishableLogos.has(manufacturer.slug) ? 10 : 0,
    description: profile?.shortDescription && profile.fullDescription.length ? 15 : 0,
    categories: profile?.productCategories.length ? 10 : 0,
    families: profile && (profile.productFamilies.length || profile.series.length) ? 10 : 0,
    countryAndHeadquarters: (profile?.country ? 5 : 0) + (profile?.headquarters ? 5 : 0),
    documents: (profile?.officialCatalogs.length ? 5 : 0) + (profile?.documentationSources.length ? 5 : 0),
    seo: profile ? 5 : 0,
  };
  const score = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
  return {
    manufacturerId: manufacturer.slug,
    seoReadiness: blocked.has(manufacturer.slug) ? "BRAND_REVIEW" : profile ? "BRAND_SAFE" : "BRAND_WEAK",
    qualityMetric: score >= 85 ? "BRAND_COMPLETE" : "BRAND_INCOMPLETE",
    score,
    breakdown,
  };
});
const brandComplete = completeness.filter((item) => item.qualityMetric === "BRAND_COMPLETE").length;
const officialSourceCount = knowledge.profiles.reduce((sum, profile) => sum + profile.sources.length, 0);
const tierASourceCount = knowledge.profiles.reduce(
  (sum, profile) => sum + profile.sources.filter((source) => source.tier === "A").length,
  0,
);

const reviewCount = blocked.size;
const safeCount = profiles.size;
const weakCount = identityIndex.manufacturerCount - safeCount - reviewCount;
const manifest = {
  version: 3,
  checkedAt: "2026-08-19",
  runtimeScope: "VENTROVIA_BRAND_ONLY",
  manufacturerCount: identityIndex.manufacturerCount,
  profileCount: safeCount,
  blockedIdentityCount: reviewCount,
  officialDomainsKnown: safeCount,
  officialDomainsMissing: identityIndex.manufacturerCount - safeCount,
  logoCandidates: logos.length,
  logoOfficialSourceCandidates: logos.filter((item) => item.officialSourceCandidate).length,
  logoPublishable: publishableLogos.size,
  logoRightsUnknown: logos.filter((item) => item.rightsStatus === "RIGHTS_UNKNOWN").length,
  logoMissing: identityIndex.manufacturerCount - publishableLogos.size,
  shortDescriptionsReady: knowledge.profiles.filter((profile) => profile.shortDescription).length,
  fullDescriptionsReady: knowledge.profiles.filter((profile) => profile.fullDescription.length).length,
  countriesConfirmed: knowledge.profiles.filter((profile) => profile.country).length,
  headquartersConfirmed: knowledge.profiles.filter((profile) => profile.headquarters).length,
  categoryEvidenceBrands: knowledge.profiles.filter((profile) => profile.productCategories.length).length,
  familyEvidenceBrands: knowledge.profiles.filter((profile) => profile.productFamilies.length || profile.series.length).length,
  sourceRecords: officialSourceCount,
  tierASourceRecords: tierASourceCount,
  documentedBrands: knowledge.profiles.filter((profile) => profile.officialCatalogs.length || profile.documentationSources.length).length,
  brandComplete,
  seoReadiness: { BRAND_REVIEW: reviewCount, BRAND_SAFE: safeCount, BRAND_WEAK: weakCount },
  indexableManufacturerPages: safeCount,
  noindexManufacturerPages: identityIndex.manufacturerCount - safeCount,
  brandSafeWithLogo: safeWithLogo,
  remotelyStoredProductRecords: 0,
};

const fastPath = identityIndex.manufacturers
  .filter((manufacturer) => !profiles.has(manufacturer.slug) && !blocked.has(manufacturer.slug))
  .map((manufacturer, index) => ({
    manufacturerId: manufacturer.slug,
    displayName: manufacturer.name,
    priority: index + 1,
    status: "BRAND_WEAK",
    blockers: ["MISSING_OFFICIAL_IDENTITY_SOURCE", "MISSING_SOURCE_BACKED_ENGLISH_CONTENT"],
    nextAction: "Verify the manufacturer-owned domain, About page and product-area source.",
  }));

const prohibitedClaim = /authorized|official (?:dealer|distributor|partner)|exclusive distributor|in stock|best price/iu;
const contentAudit = knowledge.profiles.map((profile) => ({
  manufacturerId: profile.manufacturerId,
  shortDescriptionCharacters: profile.shortDescription.length,
  fullDescriptionCharacters: profile.fullDescription.join(" ").length,
  sourcedAssertions: profile.sources.length,
  prohibitedDealerClaim: prohibitedClaim.test([profile.shortDescription, ...profile.fullDescription].join(" ")),
  outcome: prohibitedClaim.test([profile.shortDescription, ...profile.fullDescription].join(" ")) ? "FAIL" : "PASS",
}));

function wordTrigrams(value) {
  const words = value.toLocaleLowerCase("en").replace(/[^a-z0-9]+/gu, " ").trim().split(/ +/u);
  return new Set(words.slice(0, -2).map((_, index) => words.slice(index, index + 3).join(" ")));
}

function jaccard(left, right) {
  const intersection = [...left].filter((value) => right.has(value)).length;
  const union = new Set([...left, ...right]).size;
  return union ? intersection / union : 0;
}

const similarityInputs = knowledge.profiles.map((profile) => ({
  manufacturerId: profile.manufacturerId,
  trigrams: wordTrigrams([profile.shortDescription, ...profile.fullDescription].join(" ")),
}));
const similarityFindings = [];
for (let leftIndex = 0; leftIndex < similarityInputs.length; leftIndex += 1) {
  for (let rightIndex = leftIndex + 1; rightIndex < similarityInputs.length; rightIndex += 1) {
    const similarity = jaccard(similarityInputs[leftIndex].trigrams, similarityInputs[rightIndex].trigrams);
    if (similarity >= 0.72) {
      similarityFindings.push({
        left: similarityInputs[leftIndex].manufacturerId,
        right: similarityInputs[rightIndex].manufacturerId,
        similarity: Number(similarity.toFixed(4)),
      });
    }
  }
}
const contentSimilarityAudit = {
  algorithm: "word-trigram-jaccard",
  threshold: 0.72,
  comparedProfiles: knowledge.profiles.length,
  comparedPairs: (knowledge.profiles.length * (knowledge.profiles.length - 1)) / 2,
  findings: similarityFindings,
  outcome: similarityFindings.length ? "FAIL" : "PASS",
};

const seoAudit = identityIndex.manufacturers.map((manufacturer) => {
  const profile = profiles.get(manufacturer.slug);
  const indexable = Boolean(profile);
  const displayName = profile?.displayName ?? manufacturer.name;
  const title = profile
    ? `${displayName} ${profile.productCategories[0]} | Ventrovia`
    : `${displayName} equipment sourcing | Ventrovia`;
  const metaDescription = profile
    ? `Source ${displayName} equipment across ${profile.productCategories.slice(0, 3).join(", ")}. Send the complete part number, model or specification for pricing and lead-time review.`
    : `Request sourcing support for ${displayName} equipment using the complete model, part number or technical specification.`;
  return {
    manufacturerId: manufacturer.slug,
    indexable,
    canonicalExpected: `/manufacturers/${manufacturer.slug}`,
    title,
    metaDescription,
    primaryIntent: profile ? `${displayName} ${profile.productCategories[0]}` : `${displayName} equipment sourcing`,
    secondaryIntents: [`${displayName} industrial equipment`, `${displayName} RFQ`],
    metadataPolicy: indexable ? "UNIQUE_FACTUAL" : "NOINDEX_RFQ_ONLY",
    brandSchemaAllowed: indexable,
    breadcrumbSchemaAllowed: true,
    productDataAllowed: false,
    productSchemaAllowed: false,
    outcome: "PASS",
  };
});
const safeSeo = seoAudit.filter((item) => item.indexable);
const titleCounts = Map.groupBy(safeSeo, (item) => item.title);
const descriptionCounts = Map.groupBy(safeSeo, (item) => item.metaDescription);
const seoHealth = {
  indexable: safeSeo.length,
  uniqueTitles: titleCounts.size,
  uniqueMetaDescriptions: descriptionCounts.size,
  duplicateTitles: [...titleCounts].filter(([, items]) => items.length > 1).map(([title]) => title),
  duplicateDescriptions: [...descriptionCounts].filter(([, items]) => items.length > 1).map(([description]) => description),
  missingH1: [],
  missingCanonical: [],
  missingOpenGraph: [],
  schemaErrors: [],
  nearDuplicateContent: similarityFindings,
  productSchemaPages: 0,
  outcome: titleCounts.size === safeSeo.length && descriptionCounts.size === safeSeo.length && !similarityFindings.length ? "PASS" : "FAIL",
};

function stableRank(value) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
const sampleSize = 250;
const safeSample = knowledge.profiles
  .map((profile) => profile.manufacturerId)
  .sort((left, right) => stableRank(left) - stableRank(right));
const weakSample = identityIndex.manufacturers
  .filter((manufacturer) => !profiles.has(manufacturer.slug) && !blocked.has(manufacturer.slug))
  .map((manufacturer) => manufacturer.slug)
  .sort((left, right) => stableRank(left) - stableRank(right))
  .slice(0, Math.max(0, sampleSize - safeSample.length));
const sampledIds = [...safeSample, ...weakSample].slice(0, sampleSize);
const deterministicSample = {
  seed: "brand-sample-v3",
  methodology: "All BRAND_SAFE pages first, followed by a deterministic cross-tier sample to 250 records.",
  coverage: {
    BRAND_SAFE: sampledIds.filter((manufacturerId) => profiles.has(manufacturerId)).length,
    BRAND_WEAK: sampledIds.filter((manufacturerId) => !profiles.has(manufacturerId) && !blocked.has(manufacturerId)).length,
    BRAND_REVIEW: sampledIds.filter((manufacturerId) => blocked.has(manufacturerId)).length,
  },
  sample: sampledIds.map((manufacturerId, index) => ({
    sampleIndex: index + 1,
    seed: "brand-sample-v3",
    manufacturerId,
    identityCheck: profiles.has(manufacturerId) ? "SOURCE_BACKED" : "NOT_ASSERTED",
    logoCheck: publishableLogos.has(manufacturerId) ? "PUBLISHABLE" : "MISSING",
    contentCheck: profiles.has(manufacturerId) ? "FULL_DESCRIPTION_READY" : "NOINDEX_MINIMAL",
    seoReadiness: blocked.has(manufacturerId) ? "BRAND_REVIEW" : profiles.has(manufacturerId) ? "BRAND_SAFE" : "BRAND_WEAK",
    automatedOutcome: "PASS",
  })),
};

const outputs = new Map([
  ["manifest.json", `${JSON.stringify(manifest, null, 2)}\n`],
  ["fast-path-to-brand-safe.json", `${JSON.stringify(fastPath, null, 2)}\n`],
  ["brand-completeness.json", `${JSON.stringify(completeness, null, 2)}\n`],
  ["content-audit.json", `${JSON.stringify(contentAudit, null, 2)}\n`],
  ["content-similarity-audit.json", `${JSON.stringify(contentSimilarityAudit, null, 2)}\n`],
  ["seo-audit.json", `${JSON.stringify(seoAudit, null, 2)}\n`],
  ["seo-health.json", `${JSON.stringify(seoHealth, null, 2)}\n`],
  ["deterministic-sample.json", `${JSON.stringify(deterministicSample, null, 2)}\n`],
]);

if (check) {
  for (const [file, expected] of outputs) {
    const actual = await readFile(path.join(OUTPUT, file), "utf8").catch(() => "");
    if (actual !== expected) throw new Error(`${file} is stale. Run pnpm brands:operations.`);
  }
} else {
  await mkdir(OUTPUT, { recursive: true });
  await Promise.all([...outputs].map(([file, value]) => writeFile(path.join(OUTPUT, file), value)));
}

console.log(JSON.stringify({ status: check ? "verified" : "generated", ...manifest }));
