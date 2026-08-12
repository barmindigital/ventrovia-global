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
  assert.equal(sample.seed, "brand-sample-v1");
  assert.equal(sample.sample.length, 100);
  assert.equal(manifest.profileCount, 31);
  assert.equal(manifest.indexableManufacturerPages, 31);
  assert.equal(manifest.productCatalogPublic, false);
  assert.equal(manifest.productSitemapUrls, 0);
  assert.equal(PRODUCT_CATALOG_PUBLIC_ENABLED, false);
  assert.equal(health.filter(({ seoReadiness }) => seoReadiness === "BRAND_SAFE").length, 31);
  assert.ok(health.filter(({ seoReadiness }) => seoReadiness === "BRAND_WEAK").every(({ indexable }) => !indexable));
});

test("brand facts are source-backed, unique, and contain no fake dealer claim", async () => {
  const [facts, audit] = await Promise.all([
    loadJson("../data/brand-knowledge/curated-brand-facts.json"),
    loadJson("../data/brand-knowledge/content-audit.json"),
  ]);
  const descriptions = new Set();
  for (const profile of facts.profiles) {
    assert.ok(profile.sources.some(({ tier, status }) => ["A", "B"].includes(tier) && status === "AVAILABLE"));
    assert.ok(profile.officialWebsite.startsWith("https://"));
    assert.ok(profile.shortDescription.length >= 80);
    assert.ok(profile.fullDescription.join(" ").length >= 150);
    assert.equal(descriptions.has(profile.shortDescription), false);
    descriptions.add(profile.shortDescription);
  }
  assert.equal(audit.length, 31);
  assert.ok(audit.every(({ prohibitedDealerClaim, outcome }) => !prohibitedDealerClaim && outcome === "PASS"));
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
