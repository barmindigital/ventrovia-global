import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { brandLogoRegistry } from "../app/lib/brand-logos.ts";
import {
  manufacturerMatchesQuery,
  normalizeSearchText,
} from "../app/lib/international-manufacturer-identifiers.ts";

const loadJson = (path) => readFile(new URL(path, import.meta.url), "utf8").then(JSON.parse);

test("manufacturer identity index is complete and independent", async () => {
  const [identities, manifest, knowledge] = await Promise.all([
    loadJson("../data/manufacturers/identities.json"),
    loadJson("../data/brand-operations/manifest.json"),
    loadJson("../data/brand-knowledge-international/profiles.json"),
  ]);
  assert.ok(identities.manufacturerCount >= 2700);
  assert.equal(identities.manufacturers.length, identities.manufacturerCount);
  assert.equal(manifest.runtimeScope, "VENTROVIA_BRAND_ONLY");
  assert.equal(manifest.remotelyStoredProductRecords, 0);
  assert.equal(manifest.profileCount, knowledge.profiles.length);
  assert.equal(manifest.indexableManufacturerPages, knowledge.profiles.length);
  assert.equal(knowledge.metrics.enContentReady, knowledge.profiles.length);
  assert.equal(new Set(identities.manufacturers.map(({ slug }) => slug)).size, identities.manufacturerCount);
});

test("international profiles remain source-backed and English", async () => {
  const knowledge = await loadJson("../data/brand-knowledge-international/profiles.json");
  const descriptions = new Set();
  for (const profile of knowledge.profiles) {
    assert.equal(profile.contentLanguage, "en");
    assert.equal(profile.enContentStatus, "EN_CONTENT_READY");
    assert.equal(profile.enSeoStatus, "EN_SEO_READY");
    const hasTierASource = profile.sources.some(({ tier, status, url }) =>
      tier === "A" && status === "AVAILABLE" && url.startsWith("https://"),
    );
    const hasOfficialCorporateEvidence = Boolean(profile.parentCompany)
      && profile.sources.some(({ tier, type, status, url }) =>
        tier === "B"
        && /PARENT|ACQUISITION|SUCCESSOR|RIGHTS_OWNER/u.test(type)
        && status === "AVAILABLE"
        && url.startsWith("https://"),
      );
    assert.ok(hasTierASource || hasOfficialCorporateEvidence);
    assert.ok(profile.productCategories.length > 0);
    assert.equal(descriptions.has(profile.shortDescription), false);
    descriptions.add(profile.shortDescription);
    assert.doesNotMatch(`${profile.shortDescription} ${profile.fullDescription.join(" ")}`, /[А-Яа-яЁё]|authori[sz]ed dealer|official distributor|in stock|best price/iu);
  }
});

test("logo mappings are explicit and publication metadata are conservative", async () => {
  const [manifest, logoAudit] = await Promise.all([
    loadJson("../data/brand-operations/manifest.json"),
    loadJson("../data/brand-operations/logo-audit.json"),
  ]);
  const slugs = new Set();
  for (const logo of brandLogoRegistry) {
    assert.equal(slugs.has(logo.slug), false, `duplicate logo slug ${logo.slug}`);
    slugs.add(logo.slug);
    assert.match(logo.sourcePage, /^https?:\/\//u);
    assert.match(logo.originalFile, /^https?:\/\//u);
    assert.ok(logo.license.trim());
  }
  assert.equal(logoAudit.length, brandLogoRegistry.length);
  assert.equal(manifest.logoPublishable, brandLogoRegistry.length);
  assert.equal(manifest.logoRightsUnknown, 0);
  assert.ok(logoAudit.every(({ publicationStatus, checksum, width, height, scope }) =>
    publicationStatus === "PUBLISHABLE" && /^[a-f0-9]{64}$/u.test(checksum) && width > 0 && height > 0 && scope === "BRAND",
  ));
});

test("alias and diacritic search resolve only manufacturer identities", () => {
  const manufacturer = { aliases: ["Kübler", "Kuebler", "Kubler"] };
  for (const query of manufacturer.aliases) assert.equal(manufacturerMatchesQuery(manufacturer, query), true);
  assert.equal(normalizeSearchText("Kübler"), normalizeSearchText("Kubler"));
});

test("public brand code imports no operational evidence or record datasets", async () => {
  const [browser, page, brandPage, sitemap, adminApi] = await Promise.all([
    readFile(new URL("../app/components/ManufacturerBrowser.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/manufacturers/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/manufacturers/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/brand-health/[dataset]/route.ts", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(browser, /brand-health|review-queue|catalog-runtime/);
  assert.doesNotMatch(`${page}\n${brandPage}\n${sitemap}`, /brand-operations|brand-sources|catalog-runtime|product-card|product count/);
  assert.match(adminApi, /isAdminAuthenticated/);
  assert.match(adminApi, /private, no-store/);
});

test("recoverable product stores are absent from the Ventrovia repository", async () => {
  for (const path of [
    "../data/catalog-runtime",
    "../data/catalog-trust",
    "../data/catalog-evidence",
    "../archives/russian-catalog",
    "../app/generated/full-catalog.ts",
    "../app/generated/private-catalog-chunks.ts",
  ]) await assert.rejects(access(new URL(path, import.meta.url)));
});

test("private catalogue paths are guarded from source control and deployment", async () => {
  const [ignore, envExample, packageSource, hosting] = await Promise.all([
    readFile(new URL("../.gitignore", import.meta.url), "utf8"),
    readFile(new URL("../.env.example", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    loadJson("../.openai/hosting.json"),
  ]);
  for (const guard of [
    "/data/catalog-*/",
    "/archives/russian-catalog/",
    "/app/catalog/",
    "*russian-product-catalog-archive*.tar.gz",
  ]) assert.match(ignore, new RegExp(guard.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "u"));
  for (const secret of ["RESEND_API_KEY", "ADMIN_PASSWORD", "ADMIN_SESSION_SECRET", "GITHUB_CONTENT_TOKEN"]) {
    assert.match(envExample, new RegExp(`^${secret}=$`, "mu"));
  }
  assert.match(packageSource, /audit:infrastructure/u);
  assert.equal(typeof hosting.project_id, "string");
  assert.equal(Object.keys(hosting).sort().join(","), "d1,project_id,r2");
});

test("legacy deployment variables cannot restore the retired Russian host", async () => {
  const [brandSource, requestSource] = await Promise.all([
    readFile(new URL("../app/lib/site-brand.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/request/route.ts", import.meta.url), "utf8"),
  ]);

  assert.match(brandSource, /export const SITE_URL = SITE_BRAND\.canonicalBase/);
  assert.match(requestSource, /VENTROVIA_EMAIL_PATTERN/);
  assert.match(requestSource, /siteContent\.contacts\.email/);
  assert.doesNotMatch(
    brandSource,
    /process\.env\.NEXT_PUBLIC_SITE_URL\s*\|\|/,
  );
});
