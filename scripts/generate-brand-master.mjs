import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(ROOT, "brand-master");
const DATA_OUTPUT = path.join(OUTPUT, "data");
const REPORT_OUTPUT = path.join(OUTPUT, "reports");
const check = process.argv.includes("--check");
const VERSION = "1.0.0";
const CREATED_AT = "2026-08-24T00:00:00.000Z";

async function json(relativePath) {
  return JSON.parse(await readFile(path.join(ROOT, relativePath), "utf8"));
}

function unique(values) {
  return [...new Set(values.filter((value) => value !== null && value !== undefined && value !== ""))];
}

function normalizeIdentity(value) {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("en")
    .replace(/[^a-z0-9]+/gu, "");
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("en")
    .replace(/&/gu, " and ")
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "");
}

function sentenceCase(value) {
  return value ? `${value[0].toLocaleUpperCase("en")}${value.slice(1)}` : value;
}

function list(values) {
  if (values.length === 0) return "industrial equipment";
  if (values.length === 1) return values[0];
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}

function stableSeed(value) {
  return [...value].reduce(
    (sum, character) => (sum * 33 + character.codePointAt(0)) >>> 0,
    5381,
  );
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function normalizedContent(value) {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("en")
    .replace(/[^a-z0-9]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function trigramSet(value) {
  const words = normalizedContent(value).split(" ").filter(Boolean);
  const trigrams = new Set();
  for (let index = 0; index + 2 < words.length; index += 1) {
    trigrams.add(words.slice(index, index + 3).join(" "));
  }
  return trigrams;
}

function jaccard(left, right) {
  const smaller = left.size <= right.size ? left : right;
  const larger = left.size <= right.size ? right : left;
  let intersection = 0;
  for (const value of smaller) {
    if (larger.has(value)) intersection += 1;
  }
  return intersection / (left.size + right.size - intersection || 1);
}

function contentSimilarityAudit(records, selector) {
  const entries = records.map((brand) => {
    const text = selector(brand);
    return {
      brandId: brand.id,
      normalized: normalizedContent(text),
      trigrams: trigramSet(text),
    };
  });
  const exactGroups = Object.values(Object.groupBy(entries, (entry) => entry.normalized))
    .filter((group) => group.length > 1)
    .map((group) => group.map((entry) => entry.brandId));
  const reviewPairs = [];
  let maximumSimilarity = 0;
  let maximumPair = null;
  let systemicNearDuplicatePairs = 0;
  for (let leftIndex = 0; leftIndex < entries.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < entries.length; rightIndex += 1) {
      const score = jaccard(entries[leftIndex].trigrams, entries[rightIndex].trigrams);
      if (score > maximumSimilarity) {
        maximumSimilarity = score;
        maximumPair = [entries[leftIndex].brandId, entries[rightIndex].brandId];
      }
      if (score >= 0.85) systemicNearDuplicatePairs += 1;
      if (score >= 0.75 && reviewPairs.length < 100) {
        reviewPairs.push({
          brandIds: [entries[leftIndex].brandId, entries[rightIndex].brandId],
          trigramJaccard: Number(score.toFixed(4)),
        });
      }
    }
  }
  return {
    records: entries.length,
    exactDuplicateGroups: exactGroups,
    systemicThreshold: 0.85,
    systemicNearDuplicatePairs,
    reviewThreshold: 0.75,
    reviewPairs,
    maximumSimilarity: Number(maximumSimilarity.toFixed(4)),
    maximumPair,
  };
}

function csvCell(value) {
  const text = value === null || value === undefined
    ? ""
    : Array.isArray(value)
      ? value.join(" | ")
      : String(value);
  return /[",\n\r]/u.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function checkedAtFor(profile) {
  return profile.sources.map((source) => source.checkedAt).filter(Boolean).sort().at(-1) ?? null;
}

function factualDescriptions(profile) {
  const categories = profile.productCategories.slice(0, 6);
  const families = unique([...profile.productFamilies, ...profile.series]).slice(0, 10);
  const industries = profile.industries.slice(0, 6);
  const variant = stableSeed(profile.manufacturerId) % 6;
  const categoryText = list(categories);
  const familyText = list(families);
  const industryText = list(industries);
  const locationFacts = [
    profile.country ? `The confirmed country record is ${profile.country}.` : null,
    profile.headquarters ? `The documented headquarters is ${profile.headquarters}.` : null,
    profile.foundedYear ? `Official company information dates its foundation to ${profile.foundedYear}.` : null,
    profile.parentCompany ? `The documented corporate parent is ${profile.parentCompany}.` : null,
  ].filter(Boolean);

  const shortLeads = [
    `Official ${profile.displayName} material documents a product scope covering ${categoryText}.`,
    `Manufacturer-owned sources identify ${profile.displayName} with ${categoryText}.`,
    `${profile.displayName} publishes official information for ${categoryText}.`,
    `The source-backed ${profile.displayName} portfolio covers ${categoryText}.`,
    `${profile.officialName} is documented in official material for ${categoryText}.`,
    `First-party sources establish ${profile.displayName} in ${categoryText}.`,
  ];
  const shortFacts = [
    families.length ? `Documented families and lines include ${familyText}.` : locationFacts[0],
    locationFacts[0] ?? (families.length ? `Named product lines include ${familyText}.` : null),
    families.length ? `The published range names ${familyText}.` : locationFacts[0],
    profile.parentCompany ? `Its documented corporate parent is ${profile.parentCompany}.` : locationFacts[0],
    families.length ? `Official product material names ${familyText}.` : locationFacts[0],
    profile.foundedYear ? `Official company information dates its foundation to ${profile.foundedYear}.` : locationFacts[0],
  ];
  const shortDescription = [shortLeads[variant], shortFacts[variant]].filter(Boolean).join(" ");

  const identityParagraphs = [
    `${profile.officialName} is represented by manufacturer-owned evidence for ${categoryText}.`,
    `The ${profile.displayName} identity and product scope are established through official company and product material covering ${categoryText}.`,
    `Official ${profile.displayName} sources document the manufacturer identity and its work in ${categoryText}.`,
    `${profile.displayName} is documented through first-party sources that describe ${categoryText}.`,
    `Manufacturer-owned material confirms ${profile.officialName} and a portfolio centred on ${categoryText}.`,
    `The confirmed ${profile.displayName} record is based on official sources for ${categoryText}.`,
  ];
  const familyParagraphs = [
    `Named product families, ranges and series include ${familyText}. These names describe the published portfolio; model-level characteristics remain subject to the applicable manufacturer document.`,
    `The documented product structure includes ${familyText}. Family membership alone does not establish a model's configuration, compatibility or current production status.`,
    `Official product material names ${familyText}. Technical characteristics should be checked against the document for the exact model or series.`,
    `Published families and lines include ${familyText}. They provide portfolio context without replacing model-specific technical documentation.`,
    `The official range identifies ${familyText}. Exact variants, options and operating limits remain model-specific.`,
    `${profile.displayName} publishes information for ${familyText}. These names are retained as source-backed family data rather than as model-level specifications.`,
  ];
  const industryParagraphs = [
    `Official material associates the range with ${industryText}.`,
    `Documented application contexts include ${industryText}.`,
    `The source-backed industry scope covers ${industryText}.`,
    `Published applications span ${industryText}.`,
    `The confirmed market and application context includes ${industryText}.`,
    `${profile.displayName} materials reference ${industryText}.`,
  ];
  const fallbackParagraph = `The available official sources confirm the categories shown in this record. Exact technical characteristics and model status remain subject to the relevant manufacturer documentation.`;
  const fullDescription = [
    `${identityParagraphs[variant]} ${locationFacts.join(" ")}`.trim(),
    families.length ? familyParagraphs[(variant + 2) % familyParagraphs.length] : fallbackParagraph,
    industries.length ? industryParagraphs[(variant + 4) % industryParagraphs.length] : null,
  ].filter(Boolean);

  return { shortDescription, fullDescription };
}

function blockerCode(item) {
  return item.status ?? item.reason ?? "OTHER_REVIEW_REQUIRED";
}

function blockerCategory(item) {
  const value = `${item.status ?? ""} ${item.reason ?? ""} ${item.detail ?? ""}`.toLocaleUpperCase("en");
  if (/DUPLICATE|OVERLAP|CANONICAL CANDIDATE/u.test(value)) return "POSSIBLE_DUPLICATE";
  if (/ACQUIR|LEGACY|FORMER|PRODUCT LINE|PRODUCT_BRAND|CORPORATE_SPLIT/u.test(value)) return "ACQUISITION_OR_LEGACY";
  if (/403|429|EXTERNAL_SOURCE|INSECURE|BLOCKED SOURCE|NETWORK/u.test(value)) return "SOURCE_ACCESS_BLOCKED";
  if (/NON.?MANUFACTURER|NOT_A_MANUFACTURER|NOT MANUFACTURER|IDENTITY_SCOPE/u.test(value)) return "NOT_MANUFACTURER_OR_SCOPE_MISMATCH";
  if (/INSUFFICIENT.*PRODUCT|PRODUCT.*INSUFFICIENT/u.test(value)) return "INSUFFICIENT_PRODUCT_SCOPE";
  if (/NO_AUTHORITATIVE|INSUFFICIENT.*SOURCE|OWNERSHIP_SOURCE|OFFICIAL.*EVIDENCE/u.test(value)) return "OFFICIAL_SOURCE_NOT_ESTABLISHED";
  if (/AMBIGUOUS|MULTIPLE|UNRESOLVED/u.test(value)) return "AMBIGUOUS_IDENTITY";
  return "OTHER";
}

function portableReviewText(value) {
  if (!value) return null;
  return value
    .replaceAll("Ventrovia", "the Brand Master")
    .replaceAll("current industrial Brand Knowledge taxonomy", "target industrial-equipment scope");
}

const categoryAliases = {
  "pumps and pumping systems": ["pumps", "pumping equipment", "pumping systems"],
  "industrial automation and control": ["industrial automation", "automation and control", "control systems"],
  "industrial sensors": ["sensors", "industrial sensing"],
  "electric motors": ["motors", "industrial electric motors"],
  "industrial valves and flow control": ["valves", "flow control", "industrial valves"],
  "drive and motion-control systems": ["drives", "motion control", "drive systems"],
  "hydraulic equipment": ["hydraulics", "hydraulic systems"],
  "pneumatic equipment": ["pneumatics", "pneumatic systems"],
  "measurement and instrumentation": ["instrumentation", "measurement equipment", "process instrumentation"],
  "filtration and water systems": ["filtration", "water systems", "water treatment equipment"],
};

const [identities, knowledge, logos, completeness, semanticMap] = await Promise.all([
  json("data/manufacturers/identities.json"),
  json("data/brand-knowledge-international/profiles.json"),
  json("data/brand-operations/logo-audit.json"),
  json("data/brand-operations/brand-completeness.json"),
  json("data/brand-operations/international-brand-semantic-map.json"),
]);

const profileById = new Map(knowledge.profiles.map((profile) => [profile.manufacturerId, profile]));
const blockedById = new Map(knowledge.blockedIdentities.map((item) => [item.manufacturerId, item]));
const completenessById = new Map(completeness.map((item) => [item.manufacturerId, item]));
const semanticById = new Map(semanticMap.map((item) => [item.manufacturerId, item]));
const safeIds = new Set(knowledge.profiles.map((profile) => profile.manufacturerId));
const logoById = new Map(
  logos
    .filter((logo) => logo.publicationStatus === "PUBLISHABLE" && safeIds.has(logo.manufacturerId))
    .map((logo) => [logo.manufacturerId, logo]),
);

const sourceRecords = knowledge.profiles
  .flatMap((profile) => profile.sources.map((source) => ({
    sourceId: source.sourceId,
    brandId: profile.manufacturerId,
    url: source.url,
    domain: new URL(source.url).hostname.replace(/^www\./u, ""),
    sourceType: source.type,
    tier: source.tier,
    scope: source.scope,
    checkedAt: source.checkedAt,
    status: source.status,
    contentChecksum: null,
  })))
  .sort((left, right) => left.brandId.localeCompare(right.brandId, "en") || left.sourceId.localeCompare(right.sourceId, "en"));

const canonicalSlugs = new Set(identities.manufacturers.map((manufacturer) => manufacturer.slug));
const aliasSlugOwners = new Map();
for (const manufacturer of identities.manufacturers) {
  const profile = profileById.get(manufacturer.slug);
  for (const alias of unique([...manufacturer.aliases, ...(profile?.aliases ?? []), ...(profile?.formerNames ?? [])])) {
    const aliasSlug = slugify(alias);
    if (!aliasSlug || aliasSlug === manufacturer.slug) continue;
    aliasSlugOwners.set(aliasSlug, unique([...(aliasSlugOwners.get(aliasSlug) ?? []), manufacturer.slug]));
  }
}

const slugAliases = identities.manufacturers.map((manufacturer) => {
  const profile = profileById.get(manufacturer.slug);
  const nameAliases = unique([manufacturer.name, ...manufacturer.aliases, ...(profile?.aliases ?? []), ...(profile?.formerNames ?? [])]);
  const candidates = unique(nameAliases.map(slugify).filter((value) => value && value !== manufacturer.slug));
  const safeAliasSlugs = candidates.filter((aliasSlug) => {
    const owners = aliasSlugOwners.get(aliasSlug) ?? [];
    return owners.length === 1 && owners[0] === manufacturer.slug && !canonicalSlugs.has(aliasSlug);
  });
  const blockedAliasSlugs = candidates
    .filter((aliasSlug) => !safeAliasSlugs.includes(aliasSlug))
    .map((aliasSlug) => ({
      aliasSlug,
      reason: canonicalSlugs.has(aliasSlug) ? "COLLIDES_WITH_CANONICAL_SLUG" : "MULTIPLE_IDENTITY_OWNERS",
      owners: aliasSlugOwners.get(aliasSlug) ?? [],
    }));
  return { brandId: manufacturer.slug, canonicalSlug: manufacturer.slug, nameAliases, safeAliasSlugs, blockedAliasSlugs };
});

const brands = identities.manufacturers.map((manufacturer) => {
  const profile = profileById.get(manufacturer.slug);
  const blocked = blockedById.get(manufacturer.slug);
  const logo = logoById.get(manufacturer.slug);
  const quality = completenessById.get(manufacturer.slug);
  if (!profile) {
    return {
      id: manufacturer.slug,
      canonicalName: manufacturer.name,
      displayName: manufacturer.name,
      slug: manufacturer.slug,
      aliases: manufacturer.aliases,
      formerNames: [],
      identityStatus: "REVIEW_REQUIRED",
      lifecycleStatus: "UNKNOWN",
      publicationStatus: "BRAND_REVIEW",
      officialDomain: null,
      officialWebsite: null,
      country: null,
      headquarters: null,
      foundedYear: null,
      parentCompany: null,
      descriptions: { en: null },
      categories: [],
      productGroups: [],
      families: [],
      series: [],
      industries: [],
      documents: [],
      logo: null,
      sourceRecordIds: [],
      checkedAt: blocked?.checkedAt ?? null,
      contentStatus: "NOT_READY",
      seoStatus: "NOT_READY",
      seo: null,
      reviewStatus: {
        state: "REQUIRES_REVIEW",
        blockerCode: blockerCode(blocked ?? {}),
        blockerCategory: blockerCategory(blocked ?? {}),
        reason: portableReviewText(blocked?.reason),
        detail: portableReviewText(blocked?.detail),
        attemptedUrls: blocked?.attemptedUrls ?? [],
      },
      completeness: {
        score: quality?.score ?? 0,
        indicator: quality?.qualityMetric ?? "BRAND_INCOMPLETE",
        verificationIndependent: true,
        breakdown: quality?.breakdown ?? {},
      },
      notes: "No canonical manufacturer identity is asserted until the review blocker is resolved.",
    };
  }

  const descriptions = factualDescriptions(profile);
  const categorySources = profile.sources.map((source) => source.sourceId);
  const categories = profile.productCategories.map((label) => ({
    id: slugify(label),
    label,
    evidenceStatus: "SOURCE_BACKED",
    evidenceScope: "PROFILE_LEVEL",
    sourceRecordIds: categorySources,
  }));
  const documents = unique([
    ...profile.officialCatalogs.map((url) => JSON.stringify({ type: "OFFICIAL_CATALOG", url })),
    ...profile.documentationSources.map((url) => JSON.stringify({ type: "OFFICIAL_DOCUMENTATION", url })),
  ]).map(JSON.parse);
  const semantic = semanticById.get(manufacturer.slug);
  const logoExtension = logo ? path.extname(logo.localAsset) : null;
  return {
    id: manufacturer.slug,
    canonicalName: profile.officialName,
    displayName: profile.displayName,
    slug: manufacturer.slug,
    aliases: unique([...manufacturer.aliases, ...profile.aliases]),
    formerNames: profile.formerNames,
    identityStatus: "CONFIRMED",
    lifecycleStatus: profile.statusModifier ?? "CURRENT",
    publicationStatus: "BRAND_SAFE",
    officialDomain: profile.officialDomains[0] ?? null,
    officialWebsite: profile.officialWebsite,
    country: profile.country,
    headquarters: profile.headquarters,
    foundedYear: profile.foundedYear,
    parentCompany: profile.parentCompany,
    descriptions: {
      en: {
        shortDescription: descriptions.shortDescription,
        fullDescription: descriptions.fullDescription,
        language: "en",
        status: "READY",
        presentationCopyIncluded: false,
      },
    },
    categories,
    productGroups: profile.productCategories,
    families: profile.productFamilies,
    series: profile.series,
    industries: profile.industries,
    documents,
    logo: logo ? {
      status: "PUBLISHABLE",
      assetPath: `brand-assets/logos/${manufacturer.slug}${logoExtension}`,
      sourceUrl: logo.sourcePage,
      originalUrl: logo.originalUrl,
      sourceType: logo.officialSourceCandidate ? "OFFICIAL_MANUFACTURER_ASSET" : "RIGHTS_CLEARED_EXTERNAL_SOURCE",
      retrievedAt: logo.checkedAt,
      checksum: logo.checksum,
      fileType: logo.format,
      dimensions: { width: logo.width, height: logo.height },
      license: logo.license,
      rightsStatus: logo.rightsStatus,
      publicationStatus: logo.publicationStatus,
      presentationBackground: logo.presentationBackground ?? "light",
    } : null,
    sourceRecordIds: profile.sources.map((source) => source.sourceId),
    checkedAt: checkedAtFor(profile),
    contentStatus: "EN_CONTENT_READY",
    seoStatus: "SEO_CORE_READY",
    seo: {
      titleCore: `${profile.displayName} ${sentenceCase(profile.productCategories[0])}`,
      siteSuffix: null,
      metaFactual: `${profile.displayName} manufacturer profile covering ${list(profile.productCategories.slice(0, 3))}, based on official company and product sources.`,
      siteSpecificCta: null,
      primaryIntent: semantic?.primarySeoIntent ?? `${profile.displayName} ${profile.productCategories[0]}`,
      secondaryIntents: unique([
        `${profile.displayName} industrial equipment`,
        `${profile.displayName} sourcing`,
        ...profile.productCategories.slice(1, 3).map((category) => `${profile.displayName} ${category}`),
      ]),
      titlePolicy: "APPEND_NEW_SITE_SUFFIX_AT_RENDER_TIME",
    },
    reviewStatus: { state: "RESOLVED", blockerCode: null, blockerCategory: null, reason: null, detail: null, attemptedUrls: [] },
    completeness: {
      score: quality?.score ?? 0,
      indicator: quality?.qualityMetric ?? "BRAND_INCOMPLETE",
      verificationIndependent: true,
      breakdown: quality?.breakdown ?? {},
    },
    notes: null,
  };
});

const taxonomyMap = new Map();
for (const brand of brands) {
  for (const category of brand.categories) {
    const current = taxonomyMap.get(category.id) ?? { id: category.id, label: category.label, aliases: categoryAliases[category.label] ?? [], brandIds: [] };
    current.brandIds.push(brand.id);
    taxonomyMap.set(category.id, current);
  }
}
const categoryTaxonomy = [...taxonomyMap.values()]
  .map((category) => ({ ...category, brandCount: category.brandIds.length, brandIds: category.brandIds.sort() }))
  .sort((left, right) => right.brandCount - left.brandCount || left.label.localeCompare(right.label, "en"));

const identityGroups = new Map();
for (const manufacturer of identities.manufacturers) {
  for (const value of unique([manufacturer.name, ...manufacturer.aliases])) {
    const normalized = normalizeIdentity(value);
    if (!normalized) continue;
    const group = identityGroups.get(normalized) ?? [];
    group.push({ brandId: manufacturer.slug, matchedValue: value, valueType: value === manufacturer.name ? "NAME" : "ALIAS" });
    identityGroups.set(normalized, group);
  }
}
const normalizedIdentityCollisions = [...identityGroups]
  .map(([normalizedValue, matches]) => ({ normalizedValue, matches, brandIds: unique(matches.map((match) => match.brandId)) }))
  .filter((item) => item.brandIds.length > 1)
  .map((item) => ({ ...item, recommendation: "MANUAL_REVIEW_DO_NOT_AUTO_MERGE" }))
  .sort((left, right) => left.normalizedValue.localeCompare(right.normalizedValue, "en"));
const reviewDuplicateCandidates = knowledge.blockedIdentities
  .filter((item) => blockerCategory(item) === "POSSIBLE_DUPLICATE")
  .map((item) => ({
    brandId: item.manufacturerId,
    blockerCode: blockerCode(item),
    reason: portableReviewText(item.reason ?? item.detail),
    attemptedUrls: item.attemptedUrls ?? [],
    recommendation: "MANUAL_REVIEW_DO_NOT_AUTO_MERGE",
  }));
const relationshipCandidates = [
  ...knowledge.profiles
    .filter((profile) => profile.parentCompany || profile.formerNames.length)
    .map((profile) => ({ brandId: profile.manufacturerId, parentCompany: profile.parentCompany, formerNames: profile.formerNames, status: "CONFIRMED_PROFILE_RELATIONSHIP" })),
  ...knowledge.blockedIdentities
    .filter((item) => blockerCategory(item) === "ACQUISITION_OR_LEGACY")
    .map((item) => ({ brandId: item.manufacturerId, parentCompany: null, formerNames: [], status: "REVIEW_REQUIRED", reason: portableReviewText(item.reason ?? item.detail) })),
];
const duplicateReport = {
  version: VERSION,
  generatedAt: CREATED_AT,
  policy: "CANDIDATES_ONLY_NO_AUTOMATIC_MERGES",
  normalizedIdentityCollisions,
  reviewDuplicateCandidates,
  relationshipCandidates,
};

const reviewQueue = brands
  .filter((brand) => brand.publicationStatus === "BRAND_REVIEW")
  .map((brand) => ({
    brandId: brand.id,
    displayName: brand.displayName,
    aliases: brand.aliases,
    ...brand.reviewStatus,
    effortClass: brand.reviewStatus.blockerCategory === "AMBIGUOUS_IDENTITY" ? "EXPENSIVE" : brand.reviewStatus.blockerCategory === "SOURCE_ACCESS_BLOCKED" ? "NORMAL" : "NORMAL",
  }));
const blockerCounts = Object.entries(Object.groupBy(reviewQueue, (item) => item.blockerCategory))
  .map(([blockerCategory, items]) => ({ blockerCategory, count: items.length, share: Number((items.length / reviewQueue.length).toFixed(4)) }))
  .sort((left, right) => right.count - left.count || left.blockerCategory.localeCompare(right.blockerCategory));
const fastReviewCandidates = reviewQueue
  .filter((item) => ["OFFICIAL_SOURCE_NOT_ESTABLISHED", "SOURCE_ACCESS_BLOCKED", "INSUFFICIENT_PRODUCT_SCOPE"].includes(item.blockerCategory))
  .filter((item) => item.displayName.length >= 4 && item.displayName.length <= 48)
  .slice(0, 50);

const completenessRecords = brands.map((brand) => ({
  brandId: brand.id,
  identityStatus: brand.identityStatus,
  publicationStatus: brand.publicationStatus,
  score: brand.completeness.score,
  indicator: brand.completeness.indicator,
  verificationIndependent: true,
  fields: {
    identity: brand.identityStatus === "CONFIRMED",
    source: brand.sourceRecordIds.length > 0,
    description: Boolean(brand.descriptions.en),
    category: brand.categories.length > 0,
    families: brand.families.length + brand.series.length > 0,
    country: Boolean(brand.country),
    headquarters: Boolean(brand.headquarters),
    logo: Boolean(brand.logo),
    documents: brand.documents.length > 0,
  },
}));

const logoGaps = brands
  .filter((brand) => brand.publicationStatus === "BRAND_SAFE" && !brand.logo)
  .map((brand) => ({
    brandId: brand.id,
    displayName: brand.displayName,
    officialWebsite: brand.officialWebsite,
    officialDomain: brand.officialDomain,
    priority: brand.completeness.score >= 75 ? "HIGH" : brand.completeness.score >= 60 ? "NORMAL" : "ENRICHMENT",
    allowedDiscoveryOrder: ["EXISTING_VERIFIED_MAPPING", "OFFICIAL_WEBSITE", "OFFICIAL_MEDIA_KIT", "OFFICIAL_CORPORATE_ASSETS", "OFFICIAL_DOCUMENTATION"],
  }));

const semanticExport = brands
  .filter((brand) => brand.seo)
  .map((brand) => ({
    brandId: brand.id,
    displayName: brand.displayName,
    primaryCategory: brand.categories[0]?.label ?? null,
    secondaryCategories: brand.categories.slice(1).map((category) => category.label),
    families: unique([...brand.families, ...brand.series]),
    primaryIntent: brand.seo.primaryIntent,
    secondaryIntents: brand.seo.secondaryIntents,
    titleCore: brand.seo.titleCore,
    metaFactual: brand.seo.metaFactual,
    evidenceCoverage: {
      sourceRecords: brand.sourceRecordIds.length,
      categories: brand.categories.length,
      families: brand.families.length + brand.series.length,
    },
  }));

const brandMaster = {
  schemaVersion: VERSION,
  generatedAt: CREATED_AT,
  language: "en",
  framework: null,
  siteBrand: null,
  sourceScope: "INDEPENDENT_MANUFACTURER_BRAND_KNOWLEDGE",
  totalBrands: brands.length,
  brands,
};
const sourceRegistry = { schemaVersion: VERSION, generatedAt: CREATED_AT, totalSourceRecords: sourceRecords.length, sourceRecords };
const aliasesExport = { schemaVersion: VERSION, generatedAt: CREATED_AT, records: slugAliases };
const taxonomyExport = { schemaVersion: VERSION, generatedAt: CREATED_AT, evidencePolicy: "PROFILE_LEVEL_SOURCE_RELATIONSHIPS", categories: categoryTaxonomy };
const reviewExport = { schemaVersion: VERSION, generatedAt: CREATED_AT, totalReview: reviewQueue.length, blockerCounts, fastReviewCandidates, records: reviewQueue };
const completenessExport = { schemaVersion: VERSION, generatedAt: CREATED_AT, totalBrands: completenessRecords.length, records: completenessRecords };
const logoGapExport = { schemaVersion: VERSION, generatedAt: CREATED_AT, safeTotal: knowledge.profiles.length, safeWithLogo: logoById.size, safeWithoutLogo: logoGaps.length, excludedNonSafeLogoMappings: logos.filter((logo) => !safeIds.has(logo.manufacturerId)).length, records: logoGaps };
const duplicateExport = duplicateReport;
const seoExport = { schemaVersion: VERSION, generatedAt: CREATED_AT, records: semanticExport };
const safeBrands = brands.filter((brand) => brand.publicationStatus === "BRAND_SAFE");
const contentQualityExport = {
  schemaVersion: VERSION,
  generatedAt: CREATED_AT,
  methodology: "NORMALIZED_WORD_TRIGRAM_JACCARD",
  policy: "SYSTEMIC_NEAR_DUPLICATE_THRESHOLD_0.85_REVIEW_BAND_0.75",
  shortDescriptions: contentSimilarityAudit(
    safeBrands,
    (brand) => brand.descriptions.en.shortDescription,
  ),
  fullDescriptions: contentSimilarityAudit(
    safeBrands,
    (brand) => brand.descriptions.en.fullDescription.join(" "),
  ),
  siteSpecificPresentationOccurrences: 0,
};

const csvHeaders = [
  "id", "canonicalName", "displayName", "slug", "aliases", "identityStatus", "lifecycleStatus", "publicationStatus",
  "officialDomain", "officialWebsite", "country", "headquarters", "foundedYear", "parentCompany",
  "shortDescriptionEn", "categories", "families", "series", "industries", "logoAssetPath",
  "sourceRecordIds", "checkedAt", "contentStatus", "seoStatus", "seoTitleCore", "seoMetaFactual",
  "reviewBlockerCode", "reviewBlockerCategory", "completenessScore",
];
const csvRows = brands.map((brand) => [
  brand.id, brand.canonicalName, brand.displayName, brand.slug, brand.aliases, brand.identityStatus, brand.lifecycleStatus, brand.publicationStatus,
  brand.officialDomain, brand.officialWebsite, brand.country, brand.headquarters, brand.foundedYear, brand.parentCompany,
  brand.descriptions.en?.shortDescription ?? null, brand.categories.map((item) => item.label), brand.families, brand.series,
  brand.industries, brand.logo?.assetPath ?? null, brand.sourceRecordIds, brand.checkedAt, brand.contentStatus, brand.seoStatus,
  brand.seo?.titleCore ?? null, brand.seo?.metaFactual ?? null, brand.reviewStatus.blockerCode,
  brand.reviewStatus.blockerCategory, brand.completeness.score,
]);
const csv = `\uFEFF${csvHeaders.map(csvCell).join(",")}\n${csvRows.map((row) => row.map(csvCell).join(",")).join("\n")}\n`;

const outputs = new Map([
  ["data/brand-master.json", `${JSON.stringify(brandMaster, null, 2)}\n`],
  ["data/brand-master.csv", csv],
  ["data/brand-sources.json", `${JSON.stringify(sourceRegistry, null, 2)}\n`],
  ["data/brand-slug-aliases.json", `${JSON.stringify(aliasesExport, null, 2)}\n`],
  ["data/brand-category-taxonomy.json", `${JSON.stringify(taxonomyExport, null, 2)}\n`],
  ["data/brand-review-queue.json", `${JSON.stringify(reviewExport, null, 2)}\n`],
  ["data/brand-completeness.json", `${JSON.stringify(completenessExport, null, 2)}\n`],
  ["data/brand-logo-gaps.json", `${JSON.stringify(logoGapExport, null, 2)}\n`],
  ["data/brand-duplicate-candidates.json", `${JSON.stringify(duplicateExport, null, 2)}\n`],
  ["data/brand-seo-semantic-map.json", `${JSON.stringify(seoExport, null, 2)}\n`],
  ["data/brand-content-quality-audit.json", `${JSON.stringify(contentQualityExport, null, 2)}\n`],
]);

function unresolvedMarkdown() {
  const rows = blockerCounts.map((item) => `| ${item.blockerCategory} | ${item.count} | ${(item.share * 100).toFixed(1)}% |`).join("\n");
  const fast = fastReviewCandidates.map((item) => `- ${item.displayName} (\`${item.brandId}\`) — ${item.blockerCategory}`).join("\n");
  return `# Brand unresolved identities\n\nGenerated: ${CREATED_AT}\n\nThis report classifies all ${reviewQueue.length} unresolved records. REVIEW is an explicit data-quality state; it is not converted to SAFE without authoritative identity and product-scope evidence.\n\n## Pareto by blocker\n\n| Blocker category | Records | Share |\n| --- | ---: | ---: |\n${rows}\n\n## Bounded-research queue\n\nThe following ${fastReviewCandidates.length} records are the first retry cohort because their blocker may be resolved through a bounded official-source pass. They remain REVIEW until that pass succeeds.\n\n${fast}\n\nThe complete queue, reason codes, attempted URLs and effort classification are stored in \`data/brand-review-queue.json\`.\n`;
}

function duplicateMarkdown() {
  const collisions = normalizedIdentityCollisions.map((item) => `- \`${item.normalizedValue}\`: ${item.brandIds.join(", ")}`).join("\n") || "- None detected.";
  const candidates = reviewDuplicateCandidates.map((item) => `- \`${item.brandId}\` — ${item.blockerCode}`).join("\n") || "- None detected.";
  return `# Brand duplicate review\n\nGenerated: ${CREATED_AT}\n\nNo merge is performed automatically. Normalized matches can represent spelling variants, acquired brands, product lines or distinct companies.\n\n## Cross-identity normalized collisions\n\n${collisions}\n\n## Existing duplicate/canonical review candidates\n\n${candidates}\n\nDetailed matched values and relationship candidates are stored in \`data/brand-duplicate-candidates.json\`.\n`;
}

function logoMarkdown() {
  const priorities = Object.entries(Object.groupBy(logoGaps, (item) => item.priority)).map(([key, items]) => `- ${key}: ${items.length}`).join("\n");
  const top = logoGaps.slice(0, 100).map((item) => `- ${item.displayName} (\`${item.brandId}\`) — ${item.officialDomain ?? "no confirmed domain"}`).join("\n");
  return `# Brand logo gaps\n\nGenerated: ${CREATED_AT}\n\n- SAFE brands: ${knowledge.profiles.length}\n- SAFE with publishable identity-matched logo: ${logoById.size}\n- SAFE without logo: ${logoGaps.length}\n- Registry mappings excluded because identity is not SAFE: ${logos.filter((logo) => !safeIds.has(logo.manufacturerId)).length}\n\n## Priority distribution\n\n${priorities}\n\n## First 100 gaps\n\n${top}\n\nThe full machine-readable queue is \`data/brand-logo-gaps.json\`. A missing logo never lowers identity verification, and a logo is never assigned through fuzzy matching alone.\n`;
}

function completenessMarkdown() {
  const safe = brands.filter((brand) => brand.publicationStatus === "BRAND_SAFE");
  const fieldCounts = Object.keys(completenessRecords[0].fields).map((field) => ({ field, count: completenessRecords.filter((record) => record.fields[field]).length }));
  const rows = fieldCounts.map((item) => `| ${item.field} | ${item.count} | ${(item.count / brands.length * 100).toFixed(1)}% |`).join("\n");
  return `# Brand Master completeness\n\nGenerated: ${CREATED_AT}\n\nCompleteness is an inventory indicator, not a truth score. A complete record can still require future revalidation; an unresolved record is not promoted merely because many fields are populated.\n\n- Total identities: ${brands.length}\n- BRAND_SAFE: ${safe.length}\n- BRAND_REVIEW: ${reviewQueue.length}\n- BRAND_COMPLETE: ${brands.filter((brand) => brand.completeness.indicator === "BRAND_COMPLETE").length}\n- SAFE with logo: ${logoById.size}\n- Sources: ${sourceRecords.length}\n\n| Field | Records | Coverage |\n| --- | ---: | ---: |\n${rows}\n\nPer-brand results are stored in \`data/brand-completeness.json\`.\n`;
}

function contentPortabilityMarkdown() {
  const short = contentQualityExport.shortDescriptions;
  const full = contentQualityExport.fullDescriptions;
  return `# Brand content portability audit\n\nGenerated: ${CREATED_AT}\n\n- SAFE descriptions checked: ${safeBrands.length}\n- Site-specific presentation occurrences: 0\n- Exact duplicate short-description groups: ${short.exactDuplicateGroups.length}\n- Exact duplicate full-description groups: ${full.exactDuplicateGroups.length}\n- Systemic near-duplicate short-description pairs at or above ${short.systemicThreshold}: ${short.systemicNearDuplicatePairs}\n- Systemic near-duplicate full-description pairs at or above ${full.systemicThreshold}: ${full.systemicNearDuplicatePairs}\n- Maximum short-description trigram similarity: ${short.maximumSimilarity}\n- Maximum full-description trigram similarity: ${full.maximumSimilarity}\n\nThe audit uses normalized word-trigram Jaccard similarity. Pairs at or above 0.75 are retained for editorial review; 0.85 is the release threshold for a systemic near-duplicate finding. Brand names and verified facts remain part of the compared text.\n`;
}

outputs.set("reports/BRAND_UNRESOLVED_IDENTITIES.md", unresolvedMarkdown());
outputs.set("reports/BRAND_DUPLICATE_REVIEW.md", duplicateMarkdown());
outputs.set("reports/BRAND_LOGO_GAPS.md", logoMarkdown());
outputs.set("reports/BRAND_MASTER_COMPLETENESS.md", completenessMarkdown());
outputs.set("reports/BRAND_CONTENT_PORTABILITY_AUDIT.md", contentPortabilityMarkdown());

const siteSpecificPattern = /Ventrovia|Request an Offer|Request a Quote|our sourcing team|our company/iu;
const presentationPayload = brands
  .map((brand) => JSON.stringify({ descriptions: brand.descriptions, seo: brand.seo }))
  .join("\n");
if (siteSpecificPattern.test(presentationPayload)) {
  throw new Error("Portable Brand Master contains site-specific presentation copy.");
}
if (brands.length !== identities.manufacturerCount || brands.length !== 2806) {
  throw new Error(`Brand Master count mismatch: ${brands.length}`);
}
if (new Set(brands.map((brand) => brand.id)).size !== brands.length) {
  throw new Error("Brand Master contains duplicate stable IDs.");
}
if (new Set(brands.map((brand) => brand.slug)).size !== brands.length) {
  throw new Error("Brand Master contains duplicate slugs.");
}
if (reviewQueue.length + knowledge.profiles.length !== brands.length) {
  throw new Error("SAFE and REVIEW states do not cover every identity.");
}

const fileRecords = [...outputs].map(([file, value]) => ({
  path: file,
  size: Buffer.byteLength(value),
  sha256: sha256(value),
  role: file.startsWith("data/") ? "DATA" : "REPORT",
}));
for (const [packagePath, sourcePath, role] of [
  ["README.md", path.join(OUTPUT, "README.md"), "DOCUMENTATION"],
  ["docs/BRAND_MASTER_SCHEMA.md", path.join(OUTPUT, "docs/BRAND_MASTER_SCHEMA.md"), "DOCUMENTATION"],
  ["docs/BRAND_MASTER_MIGRATION_GUIDE.md", path.join(OUTPUT, "docs/BRAND_MASTER_MIGRATION_GUIDE.md"), "DOCUMENTATION"],
  ["tests/portable-test.mjs", path.join(ROOT, "scripts/test-brand-master-portability.mjs"), "PORTABILITY_TEST"],
]) {
  const value = await readFile(sourcePath);
  fileRecords.push({ path: packagePath, size: value.byteLength, sha256: sha256(value), role });
}
for (const [brandId, logo] of logoById) {
  const sourceFile = path.join(ROOT, "public", logo.localAsset.replace(/^\//u, ""));
  const asset = await readFile(sourceFile);
  const relativePath = `brand-assets/logos/${brandId}${path.extname(logo.localAsset)}`;
  fileRecords.push({ path: relativePath, size: asset.byteLength, sha256: sha256(asset), role: "BRAND_LOGO" });
}
fileRecords.sort((left, right) => left.path.localeCompare(right.path, "en"));
const manifest = {
  schemaVersion: VERSION,
  exportVersion: `industrial-brand-master-${VERSION}`,
  createdAt: CREATED_AT,
  sourceCommit: process.env.BRAND_MASTER_SOURCE_COMMIT ?? "2a6ef0a92c9025b3a973bb8adcad1a8d224448e2",
  scope: "PORTABLE_FRAMEWORK_NEUTRAL_BRAND_KNOWLEDGE",
  counts: {
    brandsTotal: brands.length,
    brandSafe: knowledge.profiles.length,
    brandReview: reviewQueue.length,
    brandComplete: brands.filter((brand) => brand.completeness.indicator === "BRAND_COMPLETE").length,
    safeWithLogo: logoById.size,
    safeWithoutLogo: logoGaps.length,
    countries: brands.filter((brand) => brand.country).length,
    headquarters: brands.filter((brand) => brand.headquarters).length,
    familyEvidence: brands.filter((brand) => brand.families.length || brand.series.length).length,
    sourceRecords: sourceRecords.length,
    categories: categoryTaxonomy.length,
  },
  policies: {
    stableIdsPreserved: true,
    stableSlugsPreserved: true,
    frameworkDependency: null,
    siteBrandDependency: null,
    domainDependency: null,
    credentialsIncluded: false,
    reviewRecordsAssertCanonicalIdentity: false,
    logosRestrictedToSafeIdentityMatches: true,
    presentationCopySeparated: true,
    systemicContentNearDuplicates: contentQualityExport.shortDescriptions.systemicNearDuplicatePairs
      + contentQualityExport.fullDescriptions.systemicNearDuplicatePairs,
  },
  files: fileRecords,
};
const manifestOutput = `${JSON.stringify(manifest, null, 2)}\n`;

if (check) {
  for (const [file, expected] of outputs) {
    const actual = await readFile(path.join(OUTPUT, file), "utf8").catch(() => "");
    if (actual !== expected) throw new Error(`${file} is stale. Run pnpm brands:master.`);
  }
  const actualManifest = await readFile(path.join(OUTPUT, "BRAND_MASTER_MANIFEST.json"), "utf8").catch(() => "");
  if (actualManifest !== manifestOutput) throw new Error("BRAND_MASTER_MANIFEST.json is stale. Run pnpm brands:master.");
} else {
  await rm(DATA_OUTPUT, { recursive: true, force: true });
  await rm(REPORT_OUTPUT, { recursive: true, force: true });
  await mkdir(DATA_OUTPUT, { recursive: true });
  await mkdir(REPORT_OUTPUT, { recursive: true });
  await Promise.all([...outputs].map(async ([file, value]) => {
    const target = path.join(OUTPUT, file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, value);
  }));
  await writeFile(path.join(OUTPUT, "BRAND_MASTER_MANIFEST.json"), manifestOutput);
}

console.log(JSON.stringify({
  status: check ? "verified" : "generated",
  output: path.relative(ROOT, OUTPUT),
  ...manifest.counts,
  normalizedDuplicateGroups: normalizedIdentityCollisions.length,
  reviewDuplicateCandidates: reviewDuplicateCandidates.length,
  siteSpecificPresentationOccurrences: 0,
}, null, 2));
