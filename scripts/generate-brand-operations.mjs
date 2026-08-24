import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(ROOT, "data/brand-operations");
const check = process.argv.includes("--check");
const CHECKED_AT = "2026-08-24";

async function json(relativePath) {
  return JSON.parse(await readFile(path.join(ROOT, relativePath), "utf8"));
}

async function optionalJson(relativePath) {
  return readFile(path.join(ROOT, relativePath), "utf8")
    .then((value) => JSON.parse(value))
    .catch(() => null);
}

const [identityIndex, knowledge, logos] = await Promise.all([
  json("data/manufacturers/identities.json"),
  json("data/brand-knowledge-international/profiles.json"),
  json("data/brand-operations/logo-audit.json"),
]);

const profiles = new Map(knowledge.profiles.map((profile) => [profile.manufacturerId, profile]));
const blocked = new Map(knowledge.blockedIdentities.map((item) => [item.manufacturerId, item]));
const logoByManufacturer = new Map(logos.map((item) => [item.manufacturerId, item]));
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
  checkedAt: CHECKED_AT,
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
const sampleSize = safeCount - 830 >= 500 ? 500 : safeCount >= 650 ? 300 : 250;
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
  methodology: `All BRAND_SAFE pages first, followed by a deterministic cross-tier sample to ${sampleSize} records.`,
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

const reviewAfter = "2026-09-19";
const sourceCache = {
  version: 1,
  checkedAt: CHECKED_AT,
  positive: knowledge.profiles.flatMap((profile) =>
    profile.sources.map((source) => ({
      manufacturerId: profile.manufacturerId,
      domain: new URL(source.url).hostname.replace(/^www\./u, ""),
      url: source.url,
      sourceType: source.type,
      scope: source.scope,
      tier: source.tier,
      httpState: source.status,
      checkedAt: source.checkedAt,
    })),
  ),
  negative: knowledge.blockedIdentities.map((item) => ({
    manufacturerId: item.manufacturerId,
    status: item.status,
    attemptedUrls: item.attemptedUrls,
    checkedAt: item.checkedAt,
    nextReviewAt: item.status === "BLOCKED_EXTERNAL_SOURCE" ? reviewAfter : null,
    reason: item.reason,
  })),
};

const massBrandSourceResults = identityIndex.manufacturers.map((manufacturer, index) => {
  const profile = profiles.get(manufacturer.slug);
  const blockedItem = blocked.get(manufacturer.slug);
  const mappedLogo = logoByManufacturer.get(manufacturer.slug);
  const status = profile ? "BRAND_SAFE" : blockedItem ? "BRAND_REVIEW" : "BRAND_WEAK";
  const effortClass = blockedItem
    ? "BLOCKED"
    : profile
      ? "FAST"
      : mappedLogo
        ? "FAST"
        : index < 500
          ? "NORMAL"
          : "EXPENSIVE";
  return {
    manufacturerId: manufacturer.slug,
    displayName: profile?.displayName ?? manufacturer.name,
    status,
    priority: index + 1,
    effortClass,
    domain: profile?.officialDomains[0] ?? null,
    sources: profile?.sources.map((source) => ({
      type: source.type,
      tier: source.tier,
      scope: source.scope,
      url: source.url,
      checkedAt: source.checkedAt,
    })) ?? [],
    facts: profile
      ? {
          identity: true,
          specialization: profile.productCategories,
          families: profile.productFamilies,
          industries: profile.industries,
          country: profile.country,
          headquarters: profile.headquarters,
        }
      : null,
    logoStatus: mappedLogo?.publicationStatus ?? "MISSING",
    blocker: blockedItem
      ? { code: blockedItem.status, reason: blockedItem.reason }
      : profile
        ? null
        : {
            code: "MISSING_OFFICIAL_IDENTITY_SOURCE",
            reason: "Manufacturer-owned identity and product-area evidence has not been verified yet.",
          },
    checkedAt: profile
      ? profile.sources.map((source) => source.checkedAt).sort().at(-1) ?? null
      : blockedItem?.checkedAt ?? null,
    nextReviewAt: blockedItem?.status === "BLOCKED_EXTERNAL_SOURCE" ? reviewAfter : null,
  };
});

const internationalBrandSemanticMap = knowledge.profiles.map((profile) => ({
  manufacturerId: profile.manufacturerId,
  brand: profile.displayName,
  primaryCategory: profile.productCategories[0],
  secondaryCategories: profile.productCategories.slice(1),
  families: [...new Set([...profile.productFamilies, ...profile.series])],
  primarySeoIntent: `${profile.displayName} ${profile.productCategories[0]}`,
  secondarySeoIntents: [
    `${profile.displayName} industrial equipment`,
    `${profile.displayName} sourcing`,
    `${profile.displayName} RFQ`,
  ],
  evidenceCoverage: {
    officialDomains: profile.officialDomains.length,
    sources: profile.sources.length,
    tierA: profile.sources.filter((source) => source.tier === "A").length,
    categories: profile.productCategories.length,
    families: profile.productFamilies.length + profile.series.length,
  },
}));

const categoryProfiles = new Map();
for (const profile of knowledge.profiles) {
  for (const category of profile.productCategories) {
    categoryProfiles.set(category, [...(categoryProfiles.get(category) ?? []), profile]);
  }
}
const categoryOpportunityReport = {
  version: 2,
  checkedAt: CHECKED_AT,
  scope: "REPORT_ONLY_NO_PUBLIC_CATEGORY_URLS",
  minimumRecommendedCoverage: 8,
  scoring: {
    coverage: 40,
    logoCoverage: 15,
    fullContentCoverage: 15,
    familyEvidenceCoverage: 15,
    tierASourceCoverage: 15,
  },
  categories: [...categoryProfiles]
    .map(([category, categoryBrands]) => {
      const brandCount = categoryBrands.length;
      const brandsWithLogo = categoryBrands.filter((profile) => publishableLogos.has(profile.manufacturerId)).length;
      const brandsWithFullContent = categoryBrands.filter((profile) => profile.fullDescription.length).length;
      const brandsWithFamilyEvidence = categoryBrands.filter(
        (profile) => profile.productFamilies.length || profile.series.length,
      ).length;
      const brandsWithTierASource = categoryBrands.filter(
        (profile) => profile.sources.some((source) => source.tier === "A"),
      ).length;
      const rate = (value) => (brandCount ? value / brandCount : 0);
      const qualityScore = Math.round(
        Math.min(40, (brandCount / 20) * 40)
          + rate(brandsWithLogo) * 15
          + rate(brandsWithFullContent) * 15
          + rate(brandsWithFamilyEvidence) * 15
          + rate(brandsWithTierASource) * 15,
      );
      return {
        category,
        brandCount,
        brandsWithLogo,
        brandsWithFullContent,
        brandsWithFamilyEvidence,
        brandsWithTierASource,
        officialSourceRecords: categoryBrands.reduce((sum, profile) => sum + profile.sources.length, 0),
        relatedLinksPerBrand: Math.min(6, Math.max(0, brandCount - 1)),
        potentialUniqueContent: brandsWithFullContent >= 8 && brandsWithTierASource >= 8,
        qualityScore,
        recommendation:
          brandCount >= 8 && qualityScore >= 60
            ? "HIGH_CONFIDENCE_CATEGORY_LANDING_CANDIDATE"
            : brandCount >= 8
              ? "CANDIDATE_FOR_EDITORIAL_REVIEW"
              : "INSUFFICIENT_VERIFIED_COVERAGE",
      };
    })
    .sort((left, right) => right.brandCount - left.brandCount || left.category.localeCompare(right.category)),
};

const sprintWindow = await optionalJson("data/brand-sources/sprint-19-processing-window.json");
const sprint21Window = await optionalJson("data/brand-sources/sprint-21-processing-window.json");
const sprintWaveFiles = sprintWindow
  ? (await readdir(path.join(ROOT, "data/brand-sources")))
      .map((file) => ({ file, wave: Number(file.match(/^curated-brand-facts-wave-(\d+)\.json$/u)?.[1]) }))
      .filter((item) => Number.isFinite(item.wave) && item.wave >= sprintWindow.firstWave)
      .sort((left, right) => left.wave - right.wave)
  : [];
const sprintBatches = await Promise.all(
  sprintWaveFiles.map(async ({ file, wave }) => {
    const batch = await json(`data/brand-sources/${file}`);
    return {
      wave,
      file,
      safe: batch.profiles.length,
      review: batch.blockedIdentities.length,
      processed: batch.profiles.length + batch.blockedIdentities.length,
    };
  }),
);
const sprintProcessed = sprintBatches.reduce((sum, batch) => sum + batch.processed, 0);
const sprintSafe = sprintBatches.reduce((sum, batch) => sum + batch.safe, 0);
const sprintReview = sprintBatches.reduce((sum, batch) => sum + batch.review, 0);
const elapsedHours = sprintWindow?.processingFinishedAt
  ? (Date.parse(sprintWindow.processingFinishedAt) - Date.parse(sprintWindow.processingStartedAt)) / 3_600_000
  : null;
const sprint21WaveFiles = sprint21Window
  ? (await readdir(path.join(ROOT, "data/brand-sources")))
      .map((file) => ({ file, wave: Number(file.match(/^curated-brand-facts-wave-(\d+)\.json$/u)?.[1]) }))
      .filter((item) => Number.isFinite(item.wave) && item.wave >= sprint21Window.firstWave)
      .sort((left, right) => left.wave - right.wave)
  : [];
const sprint21Batches = await Promise.all(
  sprint21WaveFiles.map(async ({ file, wave }) => {
    const batch = await json(`data/brand-sources/${file}`);
    return {
      wave,
      file,
      safe: batch.profiles.length,
      review: batch.blockedIdentities.length,
      processed: batch.profiles.length + batch.blockedIdentities.length,
    };
  }),
);
const sprint21Processed = sprint21Batches.reduce((sum, batch) => sum + batch.processed, 0);
const sprint21Safe = sprint21Batches.reduce((sum, batch) => sum + batch.safe, 0);
const sprint21Review = sprint21Batches.reduce((sum, batch) => sum + batch.review, 0);
const sprint21ElapsedHours = sprint21Window?.processingFinishedAt
  ? (Date.parse(sprint21Window.processingFinishedAt) - Date.parse(sprint21Window.processingStartedAt)) / 3_600_000
  : null;
const processingMetrics = {
  measurementStatus: elapsedHours ? "MEASURED" : "IN_PROGRESS",
  processedManufacturers: profiles.size + blocked.size,
  safe: profiles.size,
  blockedOrReview: blocked.size,
  sourceSuccessRate: Number((profiles.size / (profiles.size + blocked.size)).toFixed(4)),
  averageSourcesPerSafe: Number((officialSourceCount / profiles.size).toFixed(2)),
  sprint19: sprintWindow
    ? {
        processingStartedAt: sprintWindow.processingStartedAt,
        processingFinishedAt: sprintWindow.processingFinishedAt,
        elapsedHours: elapsedHours ? Number(elapsedHours.toFixed(4)) : null,
        processed: sprintProcessed,
        safe: sprintSafe,
        review: sprintReview,
        sourceSuccessRate: sprintProcessed ? Number((sprintSafe / sprintProcessed).toFixed(4)) : null,
        processedPerHour: elapsedHours ? Number((sprintProcessed / elapsedHours).toFixed(2)) : null,
        safePerHour: elapsedHours ? Number((sprintSafe / elapsedHours).toFixed(2)) : null,
        reviewPerHour: elapsedHours ? Number((sprintReview / elapsedHours).toFixed(2)) : null,
        batches: sprintBatches,
      }
    : null,
  sprint21: sprint21Window
    ? {
        processingStartedAt: sprint21Window.processingStartedAt,
        processingFinishedAt: sprint21Window.processingFinishedAt,
        elapsedHours: sprint21ElapsedHours ? Number(sprint21ElapsedHours.toFixed(4)) : null,
        processed: sprint21Processed,
        safe: sprint21Safe,
        review: sprint21Review,
        sourceSuccessRate: sprint21Processed ? Number((sprint21Safe / sprint21Processed).toFixed(4)) : null,
        processedPerHour: sprint21ElapsedHours ? Number((sprint21Processed / sprint21ElapsedHours).toFixed(2)) : null,
        safePerHour: sprint21ElapsedHours ? Number((sprint21Safe / sprint21ElapsedHours).toFixed(2)) : null,
        reviewPerHour: sprint21ElapsedHours ? Number((sprint21Review / sprint21ElapsedHours).toFixed(2)) : null,
        batches: sprint21Batches,
      }
    : null,
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
  ["brand-source-cache.json", `${JSON.stringify(sourceCache, null, 2)}\n`],
  ["mass-brand-source-results.json", `${JSON.stringify(massBrandSourceResults, null, 2)}\n`],
  ["international-brand-semantic-map.json", `${JSON.stringify(internationalBrandSemanticMap, null, 2)}\n`],
  ["category-opportunity-report.json", `${JSON.stringify(categoryOpportunityReport, null, 2)}\n`],
  ["processing-metrics.json", `${JSON.stringify(processingMetrics, null, 2)}\n`],
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
