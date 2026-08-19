import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { access, readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const json = (path) => read(path).then(JSON.parse);

const [brand, operations, envExample, ignore, tracked, reachable] = await Promise.all([
  read("app/lib/site-brand.ts"),
  json("data/brand-operations/manifest.json"),
  read(".env.example"),
  read(".gitignore"),
  Promise.resolve(execFileSync("git", ["ls-files"], { encoding: "utf8" })),
  Promise.resolve(execFileSync("git", ["rev-list", "--objects", "main"], { encoding: "utf8" })),
]);

assert.match(brand, /canonicalBase: "https:\/\/ventroviaglobal\.com"/u);
assert.match(brand, /sales@ventroviaglobal\.com/u);
assert.match(brand, /\+971557254463/u);
assert.doesNotMatch(brand, /VENTORVIA|Индустрия Поставок/u);
assert.equal(operations.manufacturerCount, 2806);
assert.equal(operations.profileCount, 166);
assert.equal(operations.indexableManufacturerPages, 166);
assert.equal(operations.remotelyStoredProductRecords, 0);

for (const line of ["RESEND_API_KEY=", "ADMIN_PASSWORD=", "ADMIN_SESSION_SECRET=", "GITHUB_CONTENT_TOKEN="]) {
  assert.match(envExample, new RegExp(`^${line}$`, "mu"));
}

for (const guard of [
  "/data/catalog-*/",
  "/archives/russian-catalog/",
  "/app/catalog/",
  "/app/generated/private-catalog*.ts",
  "*russian-product-catalog-archive*.tar.gz",
]) assert.match(ignore, new RegExp(guard.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "u"));

const forbiddenPath = /(?:^|\s)(?:data\/catalog-|public\/data\/catalog|archives\/russian-catalog|app\/catalog\/|app\/generated\/(?:full|private)-catalog)/u;
assert.doesNotMatch(tracked, forbiddenPath);
assert.doesNotMatch(reachable, forbiddenPath);

for (const path of [
  "data/catalog-runtime",
  "data/catalog-trust",
  "data/catalog-evidence",
  "archives/russian-catalog",
  "app/catalog",
  "public/data/catalog",
]) await assert.rejects(access(new URL(`../${path}`, import.meta.url)));

console.log(JSON.stringify({
  status: "healthy",
  mode: operations.runtimeScope,
  manufacturerCount: operations.manufacturerCount,
  brandSafe: operations.seoReadiness.BRAND_SAFE,
  brandWeak: operations.seoReadiness.BRAND_WEAK,
  brandReview: operations.seoReadiness.BRAND_REVIEW,
  manufacturerSitemapUrls: operations.indexableManufacturerPages,
  productSitemapUrls: 0,
  remotelyStoredProductRecords: operations.remotelyStoredProductRecords,
  reachableForbiddenPaths: 0,
  productionMailConfiguredInRepository: false,
}, null, 2));
