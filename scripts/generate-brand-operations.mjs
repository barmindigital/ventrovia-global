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

const [identityIndex, knowledge, logos, completeness] = await Promise.all([
  json("data/manufacturers/identities.json"),
  json("data/brand-knowledge-international/profiles.json"),
  json("data/brand-operations/logo-audit.json"),
  json("data/brand-operations/brand-completeness.json"),
]);

const profiles = new Map(knowledge.profiles.map((profile) => [profile.manufacturerId, profile]));
const blocked = new Map(knowledge.blockedIdentities.map((item) => [item.manufacturerId, item]));
const publishableLogos = new Set(
  logos.filter((item) => item.publicationStatus === "PUBLISHABLE").map((item) => item.manufacturerId),
);
const safeWithLogo = knowledge.profiles.filter((profile) => publishableLogos.has(profile.manufacturerId)).length;
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

const outputs = new Map([
  ["manifest.json", `${JSON.stringify(manifest, null, 2)}\n`],
  ["fast-path-to-brand-safe.json", `${JSON.stringify(fastPath, null, 2)}\n`],
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
