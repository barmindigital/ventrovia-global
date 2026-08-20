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
  assert.match(source, /Request an Offer/);
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

test("services is a standalone international sourcing page", async () => {
  const source = await html("/services");
  assert.match(source, /Industrial sourcing services/i);
  assert.match(source, /Specification &amp; BOM requests/i);
  assert.match(source, /Request an Offer/i);
  assert.match(source, /"@type":"Service"/);
  assert.match(source, /"@type":"BreadcrumbList"/);
  assert.doesNotMatch(source, /authori[sz]ed distributor|guaranteed availability|own warehouse/i);
});

test("public navigation and primary CTA use the current services and offer policy", async () => {
  const [header, footer, cta, contactDock] = await Promise.all([
    readFile(new URL("../app/components/SiteHeader.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/SiteFooter.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/RequestCta.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ContactDock.tsx", import.meta.url), "utf8"),
  ]);
  const publicCtaSource = `${header}\n${footer}\n${cta}\n${contactDock}`;
  assert.match(header, /href: "\/services"/);
  assert.match(footer, /href="\/services"/);
  assert.doesNotMatch(publicCtaSource, /\/\#services|Request a Quote|Get a Quote/);
  assert.match(publicCtaSource, /Request an Offer/);
});

test("manufacturer schema is factual and excludes commerce schema", async () => {
  const source = await html("/manufacturers/bosch-rexroth");
  assert.match(source, /"@type":"Brand"/);
  assert.match(source, /"@type":"BreadcrumbList"/);
  assert.doesNotMatch(source, /"@type":"(?:Product|Offer|AggregateRating|Review)"/);
  assert.doesNotMatch(source, /authori[sz]ed dealer|official distributor/i);
});

test("sitemap contains only corporate and verified manufacturer URLs", async () => {
  const [source, manifest] = await Promise.all([
    html("/sitemap.xml"),
    readFile(new URL("../data/brand-operations/manifest.json", import.meta.url), "utf8").then(JSON.parse),
  ]);
  assert.equal(
    (source.match(/\/manufacturers\//g) ?? []).length,
    manifest.indexableManufacturerPages,
  );
  assert.equal((source.match(/\/catalog(?:\/|<)/g) ?? []).length, 0);
  assert.match(source, /https:\/\/ventroviaglobal\.com\/manufacturers/);
  assert.match(source, /https:\/\/ventroviaglobal\.com\/services/);
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

test("public responses define conservative baseline security headers", async () => {
  const config = await readFile(new URL("../next.config.ts", import.meta.url), "utf8");
  for (const header of [
    "Strict-Transport-Security",
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Permissions-Policy",
  ]) assert.match(config, new RegExp(header));
  assert.match(config, /strict-origin-when-cross-origin/);
  assert.match(config, /camera=\(\), microphone=\(\), geolocation=\(\)/);
});

test("RFQ attachment validation rejects disguised and excessive files", async () => {
  const send = async (files) => {
    const form = new FormData();
    form.set("name", "Procurement Manager");
    form.set("company", "Example Industrial");
    form.set("email", "buyer@example.com");
    form.set("consent", "yes");
    files.forEach((file) => form.append("file", file, file.name));
    return (await worker()).fetch(new Request("https://ventroviaglobal.com/api/request", {
      method: "POST",
      body: form,
    }), env, context);
  };

  const disguised = await send([new File(["not a pdf"], "../../unsafe.pdf", { type: "application/pdf" })]);
  assert.equal(disguised.status, 400);
  assert.match((await disguised.json()).message, /does not match its file type/i);

  const tooMany = await send(Array.from({ length: 6 }, (_, index) =>
    new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])], `file-${index}.pdf`, { type: "application/pdf" }),
  ));
  assert.equal(tooMany.status, 400);
  assert.match((await tooMany.json()).message, /up to 5 files/i);
});

test("interactive navigation and enquiry dialogs include keyboard safety", async () => {
  const [header, modal, browser, consent, layout, privacy] = await Promise.all([
    readFile(new URL("../app/components/SiteHeader.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/RequestModal.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ManufacturerBrowser.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/cookie-consent.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/privacy/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(header, /event\.key !== "Escape"/);
  assert.match(header, /!menu\.contains/);
  assert.match(modal, /event\.key !== "Tab"/);
  assert.match(modal, /openerRef\.current.*focus/);
  assert.match(browser, /No manufacturers found/);
  assert.match(browser, /filtered\.length === 1/);
  assert.doesNotMatch(consent, /industria-postavok/);
  assert.doesNotMatch(layout, /CookieBanner/);
  assert.match(privacy, /does not currently run optional analytics/);
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
