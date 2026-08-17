import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { brandLogoRegistry } from "../app/lib/brand-logos.ts";
import {
  manufacturerMatchesQuery,
  normalizeSearchText,
} from "../app/lib/manufacturer-identifiers.ts";
import { PRODUCT_CATALOG_PUBLIC_ENABLED } from "../app/lib/catalog-visibility.ts";

const loadJson = (path) => readFile(new URL(path, import.meta.url), "utf8").then(JSON.parse);

test("all manufacturers receive a deterministic conservative brand classification", async () => {
  const [manifest, health, sample] = await Promise.all([
    loadJson("../data/brand-knowledge/manifest.json"),
    loadJson("../data/brand-knowledge/brand-health.json"),
    loadJson("../data/brand-knowledge/deterministic-sample.json"),
  ]);
  assert.equal(manifest.manufacturerCount, 2806);
  assert.equal(health.length, 2806);
  assert.equal(sample.seed, "brand-sample-v2");
  assert.equal(sample.sample.length, 200);
  assert.equal(sample.coverage.BRAND_SAFE, manifest.indexableManufacturerPages);
  assert.equal(manifest.profileCount, 146);
  assert.equal(manifest.indexableManufacturerPages, 146);
  assert.equal(manifest.productCatalogPublic, false);
  assert.equal(manifest.productSitemapUrls, 0);
  assert.equal(PRODUCT_CATALOG_PUBLIC_ENABLED, false);
  assert.equal(health.filter(({ seoReadiness }) => seoReadiness === "BRAND_SAFE").length, manifest.profileCount);
  assert.ok(health.every(({ completenessScore }) => Number.isInteger(completenessScore) && completenessScore >= 0 && completenessScore <= 100));
  assert.equal(health.filter(({ qualityMetric }) => qualityMetric === "BRAND_COMPLETE").length, manifest.brandComplete);
  assert.ok(health.filter(({ seoReadiness }) => seoReadiness === "BRAND_WEAK").every(({ indexable }) => !indexable));
});

test("brand facts are source-backed, unique, and contain no fake dealer claim", async () => {
  const [facts, wave4Facts, audit] = await Promise.all([
    loadJson("../data/brand-knowledge/curated-brand-facts.json"),
    loadJson("../data/brand-knowledge/curated-brand-facts-wave-4.json"),
    loadJson("../data/brand-knowledge/content-audit.json"),
  ]);
  const profiles = [...facts.profiles, ...wave4Facts.profiles];
  const descriptions = new Set();
  for (const profile of profiles) {
    assert.ok(profile.sources.some(({ tier, status }) => ["A", "B"].includes(tier) && status === "AVAILABLE"));
    assert.ok(profile.officialWebsite.startsWith("https://"));
    assert.ok(profile.shortDescription.length >= 80);
    assert.ok(profile.fullDescription.join(" ").length >= 150);
    assert.equal(descriptions.has(profile.shortDescription), false);
    descriptions.add(profile.shortDescription);
  }
  assert.equal(audit.length, profiles.length);
  assert.ok(audit.every(({ prohibitedDealerClaim, outcome }) => !prohibitedDealerClaim && outcome === "PASS"));
});

test("Wave 2 official domains and factual content remain source-traceable", async () => {
  const [facts, similarity, wave] = await Promise.all([
    loadJson("../data/brand-knowledge/curated-brand-facts.json"),
    loadJson("../data/brand-knowledge/content-similarity-audit.json"),
    loadJson("../data/brand-knowledge/wave-2-progress.json"),
  ]);
  for (const profile of facts.profiles) {
    const domains = profile.officialDomains.map((domain) => domain.replace(/^www\./u, ""));
    assert.ok(profile.sources.some(({ tier, status, url }) => {
      const hostname = new URL(url).hostname.replace(/^www\./u, "");
      return ["A", "B"].includes(tier)
        && status === "AVAILABLE"
        && domains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
    }), `${profile.manufacturerId} must have an official-domain source`);
  }
  assert.equal(similarity.outcome, "PASS");
  assert.equal(similarity.findings.length, 0);
  assert.equal(wave.promotedToBrandSafe.length, 41);
  assert.equal(wave.retainedForReview.length, 4);
  assert.equal(wave.productCatalogChanged, false);
  assert.equal(wave.productSitemapUrls, 0);
});

test("Wave 3 completes the remaining priority cohort with professional factual SEO", async () => {
  const [wave, seoHealth, seoAudit, logoCoverage] = await Promise.all([
    loadJson("../data/brand-knowledge/wave-3-progress.json"),
    loadJson("../data/brand-knowledge/seo-health.json"),
    loadJson("../data/brand-knowledge/seo-audit.json"),
    loadJson("../data/brand-knowledge/logo-coverage-wave-3.json"),
  ]);
  assert.equal(wave.baselineBrandSafe, 72);
  assert.equal(wave.promoted, 30);
  assert.equal(wave.reviewCount, 1);
  assert.equal(wave.top100.remaining, 0);
  assert.equal(wave.productCatalogChanged, false);
  assert.equal(wave.productSitemapUrls, 0);
  assert.equal(seoHealth.indexable, 146);
  assert.equal(seoHealth.uniqueTitles, 146);
  assert.equal(seoHealth.uniqueMetaDescriptions, 146);
  assert.deepEqual(seoHealth.duplicateTitles, []);
  assert.deepEqual(seoHealth.duplicateDescriptions, []);
  assert.deepEqual(seoHealth.nearDuplicateContent, []);
  assert.equal(seoHealth.productSchemaPages, 0);
  assert.equal(seoHealth.outcome, "PASS");
  assert.equal(logoCoverage.wave3SafeWithLogo, 20);
  assert.equal(logoCoverage.rejectedWrongIdentity, 0);
  const safeSeo = seoAudit.filter(({ indexable }) => indexable);
  assert.ok(safeSeo.every(({ title, metaDescription, primaryIntent, productSchemaAllowed }) =>
    title.includes("—")
      && metaDescription.startsWith("Поставка оборудования")
      && primaryIntent.length > 10
      && productSchemaAllowed === false,
  ));
});

test("Wave 4 promotes only source-backed brands and quarantines ambiguous identities", async () => {
  const [wave, waveFacts, health, visibility, categoryCandidates] = await Promise.all([
    loadJson("../data/brand-knowledge/wave-4-progress.json"),
    loadJson("../data/brand-knowledge/curated-brand-facts-wave-4.json"),
    loadJson("../data/brand-knowledge/brand-health.json"),
    loadJson("../data/brand-knowledge/manifest.json"),
    loadJson("../data/brand-knowledge/brand-category-candidates.json"),
  ]);
  assert.equal(wave.baselineBrandSafe, 102);
  assert.equal(wave.processed, waveFacts.profiles.length + waveFacts.blockedIdentities.length);
  assert.equal(wave.promoted, waveFacts.profiles.length);
  assert.equal(wave.reviewCount, 2);
  assert.equal(wave.productCatalogChanged, false);
  assert.equal(wave.productSitemapUrls, 0);
  assert.deepEqual(
    new Set(wave.retainedForReview.map(({ manufacturerId }) => manufacturerId)),
    new Set(["elko", "kohler-motors"]),
  );
  assert.ok(waveFacts.profiles.every((profile) =>
    profile.sources.some(({ tier, status, url }) =>
      tier === "A" && status === "AVAILABLE" && url.startsWith("https://"),
    ) && profile.productCategories.length > 0,
  ));
  assert.ok(health.filter(({ manufacturerId }) => wave.promotedToBrandSafe.includes(manufacturerId))
    .every(({ seoReadiness, indexable }) => seoReadiness === "BRAND_SAFE" && indexable));
  assert.equal(health.find(({ manufacturerId }) => manufacturerId === "elko").seoReadiness, "BRAND_REVIEW");
  assert.equal(health.find(({ manufacturerId }) => manufacturerId === "kohler-motors").seoReadiness, "BRAND_REVIEW");
  assert.equal(visibility.productSitemapUrls, 0);
  assert.equal(categoryCandidates.manufacturerCount, visibility.profileCount);
  assert.equal(categoryCandidates.publishedRoutes, 0);
  assert.ok(categoryCandidates.candidates.every(({ evidence, status }) =>
    evidence.length > 0 && status === "CANDIDATE_NOT_PUBLISHED",
  ));
});

test("logo identity is exact and every published asset has explicit reuse metadata", async () => {
  const [manifest, logoAudit] = await Promise.all([
    loadJson("../data/brand-knowledge/manifest.json"),
    loadJson("../data/brand-knowledge/logo-audit.json"),
  ]);
  const slugs = new Set();
  for (const logo of brandLogoRegistry) {
    assert.equal(slugs.has(logo.slug), false, `duplicate logo slug ${logo.slug}`);
    slugs.add(logo.slug);
    assert.ok(logo.sourcePage.startsWith("https://"));
    assert.ok(logo.originalFile.startsWith("https://"));
    assert.ok(logo.license.trim());
  }
  assert.equal(logoAudit.length, 524);
  assert.equal(manifest.logoPublishable, 524);
  assert.equal(manifest.logoRightsUnknown, 0);
  assert.ok(logoAudit.every(({ publicationStatus, checksum, width, height, scope }) =>
    publicationStatus === "PUBLISHABLE"
      && /^[a-f0-9]{64}$/u.test(checksum)
      && width > 0
      && height > 0
      && scope === "BRAND",
  ));
  assert.equal(slugs.has("elco-motors"), false);
  assert.equal(slugs.has("micro-detectors"), false);
});

test("alias and transliteration search find the canonical manufacturer safely", () => {
  const manufacturer = {
    aliases: ["Kübler", "Kuebler", "Kubler", "Кюблер"],
    country: "Германия",
  };
  for (const query of ["Kübler", "Kuebler", "Kubler", "Кюблер"]) {
    assert.equal(manufacturerMatchesQuery(manufacturer, query), true);
  }
  assert.equal(normalizeSearchText("Kübler"), normalizeSearchText("Kubler"));
  assert.equal(manufacturerMatchesQuery({ aliases: ["Bosch Rexroth", "Бош Рексрот"] }, "Бош Рексрот"), true);
});

test("public brand code never imports private health, evidence, or product datasets", async () => {
  const [browser, page, brandPage, sitemap, adminApi] = await Promise.all([
    readFile(new URL("../app/components/ManufacturerBrowser.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/manufacturers/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/manufacturers/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/catalog-quality/[dataset]/route.ts", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(browser, /brand-health|review-queue|productEvidence|catalog-trust/);
  assert.doesNotMatch(`${page}\n${brandPage}\n${sitemap}`, /brand-health\.json|review-queue\.json|catalog-runtime\/chunks/);
  assert.doesNotMatch(brandPage, /productsByManufacturerSlug|product-card|product count|ProductArt/);
  assert.match(adminApi, /isAdminAuthenticated/);
  assert.match(adminApi, /private, no-store/);
});
