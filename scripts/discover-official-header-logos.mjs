// Targeted official-logo discovery.
//
// The broad homepage sweep in discover-official-site-logos.mjs ranks every
// image on the page, so hero banners and parent-company marks dominate the
// result. A manufacturer's own mark is almost always reachable through one of
// four precise structural signals, so this pass looks only at those and keeps
// the evidence that justified each hit. Discovery still never publishes: every
// candidate stays subject to the same visual and identity review.
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const GAPS_PATH = path.join(ROOT, "brand-master/data/brand-logo-gaps.json");
const OUTPUT_DIR = path.join(ROOT, ".logo-work/header-logo");
const cliArguments = process.argv.slice(2).filter((a) => a !== "--");
const offset = Number(cliArguments[0] ?? 0);
const limit = Number(cliArguments[1] ?? 1000);
const concurrency = Math.min(Math.max(Number(cliArguments[2] ?? 10), 1), 16);

// Sites behind bot filters reject the audit agent string outright. A standard
// desktop agent is what their own CDN expects, and discovery stays read-only.
const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

const REJECT = /\b(favicon|apple-touch|loader|spinner|pixel|avatar|placeholder|banner|hero|slider|cookie|flag|badge|award|anniversary)\b/iu;

function decodeEntities(value = "") {
  return value
    .replaceAll("&amp;", "&").replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
}

function attributes(tag) {
  const result = {};
  for (const match of tag.matchAll(/([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gu)) {
    result[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return result;
}

function resolveUrl(value, baseUrl) {
  if (!value || value.startsWith("data:")) return null;
  try { return new URL(value.trim(), baseUrl).toString(); } catch { return null; }
}

function srcsetUrl(value, baseUrl) {
  if (!value) return null;
  const entries = value.split(",").map((e) => e.trim().split(/\s+/u)[0]).filter(Boolean);
  return resolveUrl(entries.at(-1), baseUrl);
}

function imageUrl(attrs, baseUrl) {
  return (
    resolveUrl(attrs.src, baseUrl) ??
    srcsetUrl(attrs.srcset ?? attrs["data-srcset"], baseUrl) ??
    resolveUrl(attrs["data-src"] ?? attrs["data-lazy-src"] ?? attrs["data-original"], baseUrl)
  );
}

// Walks a JSON-LD graph for schema.org logo values.
function jsonLdLogos(value, found = []) {
  if (Array.isArray(value)) {
    for (const entry of value) jsonLdLogos(entry, found);
    return found;
  }
  if (!value || typeof value !== "object") return found;
  const logo = value.logo;
  if (typeof logo === "string") found.push(logo);
  else if (logo && typeof logo === "object") {
    if (typeof logo.url === "string") found.push(logo.url);
    if (typeof logo.contentUrl === "string") found.push(logo.contentUrl);
  }
  for (const nested of Object.values(value)) {
    if (nested && typeof nested === "object") jsonLdLogos(nested, found);
  }
  return found;
}

function headerRegion(html) {
  // The masthead is the only place a site reliably puts its own mark.
  const patterns = [
    /<header\b[\s\S]*?<\/header>/iu,
    /<div[^>]+(?:id|class)="[^"]*\b(?:header|masthead|navbar|topbar|site-head)\b[^"]*"[\s\S]{0,20000}?<\/div>/iu,
    /<nav\b[\s\S]*?<\/nav>/iu,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(html);
    if (match) return match[0];
  }
  return html.slice(0, 20000);
}

function extractCandidates(html, baseUrl) {
  const candidates = new Map();
  const add = (url, score, sourceType, evidence) => {
    if (!url || REJECT.test(url)) return;
    const existing = candidates.get(url);
    if (!existing || score > existing.score) {
      candidates.set(url, { url, score, sourceType, evidence: evidence.slice(0, 200) });
    }
  };

  // 1. schema.org Organization logo — the publisher's own declaration.
  for (const block of html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/giu,
  )) {
    try {
      for (const value of jsonLdLogos(JSON.parse(block[1].trim()))) {
        add(resolveUrl(value, baseUrl), 100, "JSON_LD_LOGO", "schema.org logo");
      }
    } catch { /* malformed JSON-LD is common and not worth failing on */ }
  }

  // 2. Vector site icon — when present it is the real mark, not a raster crop.
  for (const tag of html.matchAll(/<link\b[^>]*>/giu)) {
    const attrs = attributes(tag[0]);
    const rel = (attrs.rel ?? "").toLowerCase();
    if (!rel.includes("icon") || attrs.type !== "image/svg+xml") continue;
    add(resolveUrl(attrs.href, baseUrl), 70, "SVG_SITE_ICON", `link rel=${rel}`);
  }

  // 3. Masthead image that names itself a logo.
  const header = headerRegion(html);
  for (const tag of header.matchAll(/<img\b[^>]*>/giu)) {
    const attrs = attributes(tag[0]);
    const url = imageUrl(attrs, baseUrl);
    if (!url) continue;
    const signal = `${attrs.class ?? ""} ${attrs.id ?? ""} ${attrs.alt ?? ""} ${url}`;
    const named = /\blogo\b/iu.test(signal);
    add(url, named ? 90 : 55, "HEADER_IMAGE", `header img${named ? " named logo" : ""}`);
  }

  // 4. Inline <svg> in the masthead carrying a logo class or title.
  for (const tag of header.matchAll(/<svg\b[^>]*>/giu)) {
    const attrs = attributes(tag[0]);
    const signal = `${attrs.class ?? ""} ${attrs.id ?? ""}`;
    if (/\blogo\b/iu.test(signal)) {
      add(`${baseUrl}#inline-svg`, 40, "INLINE_SVG", "inline masthead svg (needs manual export)");
    }
  }

  return [...candidates.values()].sort((a, b) => b.score - a.score).slice(0, 6);
}

async function fetchPage(brand) {
  try {
    const response = await fetch(brand.officialWebsite, {
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
      headers: {
        "user-agent": userAgent,
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
      },
    });
    const contentType = response.headers.get("content-type") ?? "";
    if (!response.ok || !contentType.includes("text/html")) {
      return { brand, status: "HTTP_BLOCKED", httpStatus: response.status, finalUrl: response.url, candidates: [] };
    }
    const html = await response.text();
    const candidates = extractCandidates(html, response.url);
    return {
      brand,
      status: candidates.length ? "CANDIDATES_FOUND" : "NO_CANDIDATE",
      httpStatus: response.status,
      finalUrl: response.url,
      candidates,
    };
  } catch (error) {
    return {
      brand,
      status: error?.name === "TimeoutError" ? "TIMEOUT" : "FETCH_ERROR",
      error: error instanceof Error ? error.message : String(error),
      candidates: [],
    };
  }
}

async function pooledMap(items, workerCount, operation) {
  const results = new Array(items.length);
  let nextIndex = 0;
  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (nextIndex < items.length) {
        const index = nextIndex;
        nextIndex += 1;
        results[index] = await operation(items[index]);
      }
    }),
  );
  return results;
}

const gaps = JSON.parse(await fs.readFile(GAPS_PATH, "utf8"));
const selected = gaps.records.slice(offset, offset + limit);
const results = await pooledMap(selected, concurrency, fetchPage);
const summary = results.reduce((counts, item) => {
  counts[item.status] = (counts[item.status] ?? 0) + 1;
  return counts;
}, {});
await fs.mkdir(OUTPUT_DIR, { recursive: true });
const outputPath = path.join(
  OUTPUT_DIR,
  `header-logo-${String(offset).padStart(4, "0")}-${String(selected.length).padStart(4, "0")}.json`,
);
await fs.writeFile(
  outputPath,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      source: "OFFICIAL_MANUFACTURER_WEBSITE_MASTHEAD",
      policy: "DISCOVERY_ONLY_REQUIRES_IDENTITY_AND_VISUAL_REVIEW_BEFORE_IMPORT",
      offset, requested: selected.length, concurrency, summary, records: results,
    },
    null,
    2,
  )}\n`,
);
process.stdout.write(`${JSON.stringify({ outputPath, ...summary }, null, 2)}\n`);
