import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const packageRoot = path.resolve(process.argv[2] ?? "brand-master");
const requireAssets = !process.argv.includes("--data-only");
const loadJson = (file) => readFile(path.join(packageRoot, file), "utf8").then(JSON.parse);
const [manifest, master, sources, aliases, taxonomy, contentQuality] = await Promise.all([
  loadJson("BRAND_MASTER_MANIFEST.json"),
  loadJson("data/brand-master.json"),
  loadJson("data/brand-sources.json"),
  loadJson("data/brand-slug-aliases.json"),
  loadJson("data/brand-category-taxonomy.json"),
  loadJson("data/brand-content-quality-audit.json"),
]);

assert.equal(master.totalBrands, 2806);
assert.equal(master.brands.length, 2806);
assert.equal(new Set(master.brands.map((brand) => brand.id)).size, 2806);
assert.equal(new Set(master.brands.map((brand) => brand.slug)).size, 2806);
assert.equal(manifest.counts.brandsTotal, 2806);
assert.equal(manifest.counts.brandSafe + manifest.counts.brandReview, 2806);
assert.equal(sources.sourceRecords.length, manifest.counts.sourceRecords);
assert.equal(aliases.records.length, 2806);
assert.ok(taxonomy.categories.length > 0);
assert.equal(contentQuality.siteSpecificPresentationOccurrences, 0);
assert.equal(contentQuality.shortDescriptions.exactDuplicateGroups.length, 0);
assert.equal(contentQuality.fullDescriptions.exactDuplicateGroups.length, 0);
assert.equal(contentQuality.shortDescriptions.systemicNearDuplicatePairs, 0);
assert.equal(contentQuality.fullDescriptions.systemicNearDuplicatePairs, 0);

const sourceIds = new Set(sources.sourceRecords.map((source) => source.sourceId));
assert.equal(sourceIds.size, sources.sourceRecords.length);
for (const brand of master.brands) {
  assert.equal(brand.id, brand.slug);
  assert.ok(brand.displayName);
  assert.ok(brand.lifecycleStatus);
  assert.ok(["BRAND_SAFE", "BRAND_REVIEW"].includes(brand.publicationStatus));
  for (const sourceId of brand.sourceRecordIds) assert.ok(sourceIds.has(sourceId));
  if (brand.publicationStatus === "BRAND_SAFE") {
    assert.equal(brand.identityStatus, "CONFIRMED");
    assert.ok(brand.officialDomain);
    assert.ok(brand.descriptions.en?.shortDescription);
    assert.ok(brand.descriptions.en?.fullDescription.length >= 2);
    assert.ok(brand.categories.length > 0);
    assert.ok(brand.seo?.titleCore);
  } else {
    assert.equal(brand.identityStatus, "REVIEW_REQUIRED");
    assert.equal(brand.descriptions.en, null);
    assert.equal(brand.logo, null);
  }
  if (brand.logo && requireAssets) await access(path.join(packageRoot, brand.logo.assetPath));
}

const serialized = JSON.stringify({ master, sources, aliases, taxonomy });
assert.doesNotMatch(serialized, /\/Users\/|Timeweb|\.openai\/hosting|Next\.js|Vinext|ventroviaglobal\.com/iu);
assert.doesNotMatch(serialized, /Ventrovia|Request an Offer|Request a Quote|our sourcing team/iu);
const presentationText = master.brands.map((brand) => JSON.stringify({ descriptions: brand.descriptions, seo: brand.seo })).join("\n");
assert.doesNotMatch(presentationText, /our company/iu);
assert.doesNotMatch(serialized, /"(?:password|api[_-]?key|private[_-]?key|session[_-]?secret)"\s*:/iu);

console.log(JSON.stringify({
  status: "PASS",
  packageRoot,
  brands: master.brands.length,
  brandSafe: manifest.counts.brandSafe,
  brandReview: manifest.counts.brandReview,
  logosValidated: master.brands.filter((brand) => brand.logo).length,
  assetFilesRequired: requireAssets,
  sourceRecords: sources.sourceRecords.length,
  frameworkDependencies: 0,
  siteBrandDependencies: 0,
  absolutePathDependencies: 0,
}, null, 2));
