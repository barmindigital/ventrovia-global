import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function worker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  return (await import(workerUrl.href)).default;
}

const context = { waitUntil() {}, passThroughOnException() {} };
const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };

async function render(pathname = "/") {
  return (await worker()).fetch(new Request(`https://ventroviaglobal.com${pathname}`, { headers: { accept: "text/html" } }), env, context);
}

async function html(pathname = "/") {
  const response = await render(pathname);
  assert.equal(response.status, 200);
  return response.text();
}

test("homepage is the English Ventrovia international site", async () => {
  const source = await html();
  assert.match(source, /lang="en"/);
  assert.match(source, /VENTROVIA/);
  assert.match(source, /Industrial equipment[\s\S]{0,100}sourcing worldwide/i);
  assert.match(source, /Request a Quote/);
  assert.match(source, /Dubai, UAE/);
  assert.doesNotMatch(source, /Индустрия Поставок|industriapostavok|VENTORVIA|href="\/catalog"/i);
});

test("brand assets and central contact configuration stay in sync", async () => {
  const [brand, header, footer] = await Promise.all([
    readFile(new URL("../app/lib/site-brand.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/SiteHeader.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/SiteFooter.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(brand, /name: "Ventrovia"/);
  assert.match(brand, /tagline: "GLOBAL INDUSTRIAL TRADE"/);
  assert.match(brand, /sales@ventroviaglobal\.com/);
  assert.match(brand, /\+971557254463/);
  assert.match(`${header}\n${footer}`, /SITE_BRAND/);
  const assets = await readdir(new URL("../public/brand", import.meta.url));
  assert.ok(assets.includes("ventrovia-horizontal-tagline-dark.svg"));
  for (const file of assets) assert.doesNotMatch(await readFile(new URL(`../public/brand/${file}`, import.meta.url), "utf8"), /VENTORVIA/);
});

test("manufacturer directory and source-backed pages remain public", async () => {
  const directory = await html("/manufacturers");
  assert.match(directory, /Industrial manufacturers/i);
  assert.match(directory, /Search by manufacturer or alias/i);
  for (const slug of ["bosch-rexroth", "ifm-electronic", "marelli-motori", "hydac", "abb"]) {
    const source = await html(`/manufacturers/${slug}`);
    assert.match(source, /Manufacturer knowledge base/i);
    assert.match(source, /Official source confirmed/i);
    assert.match(source, /Request for quotation/i);
    assert.doesNotMatch(source, /product-card|\/catalog\?|SKU list/i);
  }
});

test("manufacturer schema is factual and excludes commerce schema", async () => {
  const source = await html("/manufacturers/bosch-rexroth");
  assert.match(source, /"@type":"Brand"/);
  assert.match(source, /"@type":"BreadcrumbList"/);
  assert.doesNotMatch(source, /"@type":"(?:Product|Offer|AggregateRating|Review)"/);
  assert.doesNotMatch(source, /authori[sz]ed dealer|official distributor/i);
});

test("sitemap contains only corporate and verified manufacturer URLs", async () => {
  const source = await html("/sitemap.xml");
  assert.equal((source.match(/\/manufacturers\//g) ?? []).length, 166);
  assert.equal((source.match(/\/catalog(?:\/|<)/g) ?? []).length, 0);
  assert.match(source, /https:\/\/ventroviaglobal\.com\/manufacturers/);
});

test("all product, category, payload and product-admin routes are absent", async () => {
  for (const path of [
    "/catalog",
    "/catalog/category/example",
    "/catalog/example-item",
    "/data/catalog/manifest.json",
    "/api/products",
    "/admin/catalog-health",
    "/admin/catalog-review",
  ]) assert.equal((await render(path)).status, 404, path);
  await assert.rejects(access(new URL("../public/data/catalog", import.meta.url)));
  await assert.rejects(access(new URL("../public/images/products", import.meta.url)));
});

test("brand administration is authenticated and server-only", async () => {
  assert.match(await html("/admin"), /Loading administration/);
  assert.match(await html("/admin/brand-health"), /Loading…/);
  const response = await render("/api/admin/brand-health/brand-health-manifest");
  assert.equal(response.status, 401);
  assert.match(response.headers.get("cache-control") ?? "", /private, no-store/);
});

test("RFQ endpoint fails visibly until mail infrastructure is configured", async () => {
  const response = await (await worker()).fetch(new Request("https://ventroviaglobal.com/api/request", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Procurement Manager", company: "Example Industrial", email: "buyer@example.com", product: "Model requested by buyer", consent: "yes", requestType: "supply", requestSource: "contacts_page" }),
  }), env, context);
  assert.equal(response.status, 503);
  assert.equal((await response.json()).fallback, true);
});

test("mailbox access remains separate from the domain cutover gate", async () => {
  const [cutover, email, handoff] = await Promise.all([
    readFile(new URL("../VENTROVIA_INFRASTRUCTURE_CUTOVER.md", import.meta.url), "utf8"),
    readFile(new URL("../VENTROVIA_EMAIL_SETUP.md", import.meta.url), "utf8"),
    readFile(new URL("../INDUSTRIAPOSTAVOK_DOMAIN_HANDOFF.md", import.meta.url), "utf8"),
  ]);
  assert.match(email, /MAILBOX_ACCESS_UNAVAILABLE/);
  assert.match(email, /does not block the website/i);
  assert.match(cutover, /EMAIL_PRODUCTION = BLOCKED_MAILBOX_ACCESS/);
  assert.match(cutover, /SAFE_FAILURE/);
  assert.match(handoff, /Email delivery is a separate blocker/);
});

test("www uses a permanent host-only redirect to the canonical apex", async () => {
  const config = await readFile(new URL("../next.config.ts", import.meta.url), "utf8");
  assert.match(config, /www\.ventroviaglobal\.com/);
  assert.match(config, /https:\/\/ventroviaglobal\.com\/:path\*/);
  assert.match(config, /permanent: true/);
  assert.doesNotMatch(config, /www\.industriapostavok\.ru/);
});

test("not-found response is English and noindex", async () => {
  const response = await render("/missing-ventrovia-page");
  assert.equal(response.status, 404);
  const source = await response.text();
  assert.match(source, /Page not found/i);
  assert.match(source, /noindex/i);
});

test("project identity and social preview are release-ready", async () => {
  const [packageSource, layout] = await Promise.all([
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    access(new URL("../public/og.png", import.meta.url)),
  ]);
  assert.match(packageSource, /"name": "ventrovia-global"/);
  assert.match(layout, /Organization/);
  assert.match(layout, /areaServed: "Worldwide"/);
  assert.match(layout, /addressCountry: "AE"/);
});
