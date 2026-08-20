import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";

const args = process.argv.slice(2);
const valueFor = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
};
const base = new URL(valueFor("--base", "https://ventroviaglobal.com"));
const output = valueFor(
  "--output",
  "data/brand-operations/prelaunch-production-audit.json",
);
const concurrency = Number(valueFor("--concurrency", "8"));
const requestTimeoutMs = Number(valueFor("--timeout", "20000"));
const maximumPages = Number(valueFor("--max-pages", "5000"));

const oldIdentityPattern = /VENTORVIA|Индустрия Поставок|industriapostavok\.ru/iu;
const productSchemaPattern = /"@type"\s*:\s*"(?:Product|Offer|AggregateRating|Review)"/iu;
const russianPattern = /[А-Яа-яЁё]/u;
const htmlTypes = /text\/html|application\/xhtml\+xml/iu;
const assetExtensions = /\.(?:css|js|mjs|png|jpe?g|webp|gif|svg|ico|woff2?|ttf|otf)(?:\?|$)/iu;

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "iu"));
  return match?.[2] ?? "";
}

function tagFor(html, expression) {
  return html.match(expression)?.[0] ?? "";
}

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function normalizeInternal(value, pageUrl) {
  if (!value || /^(?:mailto|tel|javascript|data):/iu.test(value)) return null;
  try {
    const url = new URL(value, pageUrl);
    if (url.origin !== base.origin) return null;
    url.hash = "";
    if (url.pathname !== "/" && url.pathname.endsWith("/")) {
      url.pathname = url.pathname.replace(/\/+$/u, "");
    }
    return url.href;
  } catch {
    return null;
  }
}

async function fetchWithTimeout(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      "User-Agent": "VentroviaPrelaunchAudit/1.0 (+owner-authorized)",
      ...(options.headers ?? {}),
    },
    redirect: "follow",
    signal: AbortSignal.timeout(requestTimeoutMs),
  });
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

const startedAt = new Date().toISOString();
const started = performance.now();
const sitemapResponse = await fetchWithTimeout(new URL("/sitemap.xml", base));
if (!sitemapResponse.ok) throw new Error(`Sitemap returned ${sitemapResponse.status}`);
const sitemapXml = await sitemapResponse.text();
const sitemapUrls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/giu)]
  .map((match) => normalizeInternal(decodeXml(match[1]), base))
  .filter(Boolean);
const sitemapSet = new Set(sitemapUrls);
const manufacturerSitemapUrls = sitemapUrls.filter((url) =>
  new URL(url).pathname.startsWith("/manufacturers/"),
);

const queue = [...sitemapUrls];
const queued = new Set(queue);
const pages = [];
const assets = new Set();
const failures = [];
let queueCursor = 0;

async function crawlWorker() {
  while (queueCursor < queue.length) {
    const url = queue[queueCursor++];
    if (pages.length >= maximumPages) return;
    const pageStarted = performance.now();
    try {
      const response = await fetchWithTimeout(url, {
        headers: { accept: "text/html,application/xhtml+xml" },
      });
      const contentType = response.headers.get("content-type") ?? "";
      const body = htmlTypes.test(contentType) ? await response.text() : "";
      const canonicalTag = tagFor(body, /<link\b[^>]*\brel=["'][^"']*canonical[^"']*["'][^>]*>/iu);
      const metaTag = tagFor(body, /<meta\b[^>]*\bname=["']description["'][^>]*>/iu)
        || tagFor(body, /<meta\b[^>]*\bcontent=["'][^"']*["'][^>]*\bname=["']description["'][^>]*>/iu);
      const title = body.match(/<title>([\s\S]*?)<\/title>/iu)?.[1]?.trim() ?? "";
      const h1s = [...body.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/giu)]
        .map((match) => match[1].replace(/<[^>]+>/gu, " ").replace(/\s+/gu, " ").trim());
      const hrefTags = [...body.matchAll(/<a\b[^>]*\bhref=(["'])(.*?)\1[^>]*>/giu)];
      const internalLinks = [];
      const invalidHrefs = [];
      const unsafeExternalLinks = [];
      for (const match of hrefTags) {
        const tag = match[0];
        const href = match[2];
        const internal = normalizeInternal(href, url);
        if (internal) {
          internalLinks.push(internal);
          if (!queued.has(internal) && !assetExtensions.test(new URL(internal).pathname)) {
            queued.add(internal);
            queue.push(internal);
          }
          continue;
        }
        if (/^https?:/iu.test(href)) {
          try {
            const external = new URL(href, url);
            if (external.origin !== base.origin) {
              const target = attribute(tag, "target");
              const rel = attribute(tag, "rel");
              if (target !== "_blank" || !/\bnoreferrer\b/iu.test(rel)) {
                unsafeExternalLinks.push({ href, target, rel });
              }
            }
          } catch {
            invalidHrefs.push(href);
          }
        } else if (!/^(?:#|mailto:|tel:)/iu.test(href)) {
          invalidHrefs.push(href);
        }
      }

      for (const match of body.matchAll(/<(?:img|script|link)\b[^>]*(?:src|href)=(["'])(.*?)\1[^>]*>/giu)) {
        const candidate = normalizeInternal(match[2], url);
        if (candidate && assetExtensions.test(new URL(candidate).pathname)) assets.add(candidate);
      }

      pages.push({
        url,
        status: response.status,
        finalUrl: response.url,
        contentType,
        bytes: Buffer.byteLength(body),
        durationMs: Math.round(performance.now() - pageStarted),
        inSitemap: sitemapSet.has(url),
        canonical: attribute(canonicalTag, "href"),
        title,
        metaDescription: attribute(metaTag, "content"),
        htmlLanguage: attribute(tagFor(body, /<html\b[^>]*>/iu), "lang"),
        h1Count: h1s.length,
        emptyH1Count: h1s.filter((value) => !value).length,
        noindex: /<meta\b[^>]*\bname=["']robots["'][^>]*\bcontent=["'][^"']*noindex/iu.test(body),
        oldIdentity: oldIdentityPattern.test(body),
        russianCharacters: russianPattern.test(body),
        mixedContent:
          /<(?:img|script|iframe|source|video|audio)\b[^>]*\bsrc=["']http:\/\//iu.test(body)
          || /<link\b[^>]*\bhref=["']http:\/\//iu.test(body),
        productSchema: productSchemaPattern.test(body),
        invalidHrefs,
        unsafeExternalLinks,
        internalLinks: [...new Set(internalLinks)],
      });
    } catch (error) {
      failures.push({ url, error: String(error?.message ?? error) });
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, crawlWorker));

const assetResults = await mapLimit([...assets], concurrency, async (url) => {
  try {
    const response = await fetchWithTimeout(url);
    await response.body?.cancel();
    return {
      url,
      status: response.status,
      finalUrl: response.url,
      contentType: response.headers.get("content-type") ?? "",
    };
  } catch (error) {
    return { url, status: 0, error: String(error?.message ?? error) };
  }
});

const indexablePages = pages.filter(({ inSitemap }) => inSitemap);
const duplicateValues = (values) => {
  const counts = new Map();
  for (const value of values.filter(Boolean)) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts].filter(([, count]) => count > 1).map(([value, count]) => ({ value, count }));
};
const pageIssues = pages.filter((page) =>
  page.status !== 200
  || page.invalidHrefs.length
  || page.unsafeExternalLinks.length
  || page.oldIdentity
  || page.mixedContent
  || page.productSchema,
);
const indexableIssues = indexablePages.filter((page) =>
  !page.title
  || !page.metaDescription
  || page.htmlLanguage !== "en"
  || page.h1Count !== 1
  || page.emptyH1Count
  || page.noindex
  || normalizeInternal(page.canonical, page.url) !== page.url,
);
const assetIssues = assetResults.filter(({ status }) => status < 200 || status >= 400);
const titleDuplicates = duplicateValues(indexablePages.map(({ title }) => title));
const metaDuplicates = duplicateValues(indexablePages.map(({ metaDescription }) => metaDescription));
const productLikeSitemapUrls = sitemapUrls.filter((url) => /\/(?:catalog|products?|sku)(?:\/|$)/iu.test(new URL(url).pathname));

const report = {
  audit: "VENTROVIA_FULL_INTERNATIONAL_PRELAUNCH",
  baseUrl: base.origin,
  startedAt,
  finishedAt: new Date().toISOString(),
  durationMs: Math.round(performance.now() - started),
  settings: { concurrency, requestTimeoutMs, maximumPages },
  summary: {
    sitemapUrls: sitemapUrls.length,
    manufacturerSitemapUrls: manufacturerSitemapUrls.length,
    productSitemapUrls: productLikeSitemapUrls.length,
    crawledPages: pages.length,
    queuedPages: queue.length,
    fetchFailures: failures.length,
    pageIssues: pageIssues.length,
    indexableIssues: indexableIssues.length,
    titleDuplicates: titleDuplicates.length,
    metaDuplicates: metaDuplicates.length,
    productSchemaPages: pages.filter(({ productSchema }) => productSchema).length,
    oldIdentityPages: pages.filter(({ oldIdentity }) => oldIdentity).length,
    mixedContentPages: pages.filter(({ mixedContent }) => mixedContent).length,
    russianCharacterIndexablePages: indexablePages.filter(({ russianCharacters }) => russianCharacters).length,
    internalAssets: assets.size,
    brokenAssets: assetIssues.length,
  },
  gates: {
    sitemapMatchesExpectedBrandSurface: manufacturerSitemapUrls.length === 816,
    productSitemapZero: productLikeSitemapUrls.length === 0,
    allInternalPagesReachable: failures.length === 0 && pages.every(({ status }) => status === 200),
    indexableMetadata: indexableIssues.length === 0,
    uniqueTitles: titleDuplicates.length === 0,
    uniqueMetaDescriptions: metaDuplicates.length === 0,
    noProductSchema: pages.every(({ productSchema }) => !productSchema),
    noOldIdentity: pages.every(({ oldIdentity }) => !oldIdentity),
    noMixedContent: pages.every(({ mixedContent }) => !mixedContent),
    externalLinkSafety: pages.every(({ unsafeExternalLinks }) => unsafeExternalLinks.length === 0),
    assetsReachable: assetIssues.length === 0,
  },
  failures,
  pageIssues,
  indexableIssues,
  titleDuplicates,
  metaDuplicates,
  assetIssues,
  performance: {
    totalHtmlBytes: pages.reduce((total, { bytes }) => total + bytes, 0),
    medianPageMs: pages.length
      ? pages.map(({ durationMs }) => durationMs).sort((a, b) => a - b)[Math.floor(pages.length / 2)]
      : 0,
    p95PageMs: pages.length
      ? pages.map(({ durationMs }) => durationMs).sort((a, b) => a - b)[Math.floor(pages.length * 0.95)]
      : 0,
  },
};

await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ output, ...report.summary, gates: report.gates }, null, 2));
if (Object.values(report.gates).some((value) => !value)) process.exitCode = 1;
