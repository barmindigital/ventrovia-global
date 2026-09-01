// Press-kit logo discovery.
//
// A press or media page exists precisely to hand out the manufacturer's own
// mark, usually in vector and usually with a stated permission, which makes it
// the best-quality logo source a brand offers. The masthead sweep never looked
// at those pages, so this pass reaches them - both by following links named
// for the press area and by requesting the conventional paths directly.
//
// Assets are accepted only from an official domain of that brand, and nothing
// is published: the output is a review queue.
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, ".logo-work/press-kit");
const cliArguments = process.argv.slice(2).filter((a) => a !== "--");
const offset = Number(cliArguments[0] ?? 0);
const limit = Number(cliArguments[1] ?? 3000);
const concurrency = Math.min(Math.max(Number(cliArguments[2] ?? 8), 1), 12);
const targetsPath = cliArguments[3];

const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

const PRESS_HINT =
  /(press|presse|media[-_ ]?kit|press[-_ ]?kit|pressekit|brand[-_ ]?asset|brand[-_ ]?portal|logo[-_ ]?download|download[-_ ]?logo|corporate[-_ ]?identity|bildmaterial|mediathek|media[-_ ]?centre|media[-_ ]?center|newsroom)/iu;

const PRESS_PATHS = [
  "/press", "/en/press", "/presse", "/press-kit", "/presskit", "/media-kit",
  "/media", "/en/media", "/mediathek", "/newsroom", "/en/newsroom",
  "/brand-assets", "/corporate-identity", "/press/media-kit", "/about/press",
  "/company/press", "/en/company/press", "/downloads/logos",
];

// A press page also carries product photography and staff portraits; only an
// asset that names itself a logo is the mark.
const LOGO_NAME = /\blogos?\b|\bwortmarke\b|\bbildmarke\b|\bsignet\b/iu;
const REJECT =
  /(favicon|apple-touch|sprite|placeholder|avatar|banner|hero|award|partner|customer|certificat|cookie|consent|clear\.gif|spacer|blank\.|we-are-here|payment|social)/iu;

function decodeEntities(value = "") {
  return value
    .replaceAll("&amp;", "&").replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
}

function officialHost(hostname, domains) {
  const host = hostname.toLowerCase().replace(/^www\./u, "");
  return domains.some((d) => {
    const n = d.toLowerCase().replace(/^www\./u, "");
    return host === n || host.endsWith(`.${n}`);
  });
}

async function fetchHtml(url) {
  const response = await fetch(url, {
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
    throw new Error(`${response.status} ${contentType.split(";")[0]}`);
  }
  return { html: (await response.text()).slice(0, 400000), finalUrl: response.url };
}

function pressLinks(html, baseUrl, domains) {
  const found = new Map();
  for (const tag of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]{0,140}?)<\/a>/giu)) {
    const href = decodeEntities(tag[1]);
    const label = decodeEntities(tag[2].replace(/<[^>]+>/gu, " ")).replace(/\s+/gu, " ").trim();
    if (!PRESS_HINT.test(`${href} ${label}`)) continue;
    let url;
    try { url = new URL(href, baseUrl); } catch { continue; }
    if (!/^https?:$/u.test(url.protocol)) continue;
    if (!officialHost(url.hostname, domains)) continue;
    found.set(url.toString(), { url: url.toString(), label: label.slice(0, 80) });
  }
  return [...found.values()].slice(0, 4);
}

// Both a downloadable file and an <img> on the page can be the mark; a vector
// download outranks a raster preview.
function logoAssets(html, baseUrl, domains) {
  const out = new Map();
  const add = (raw, label, score) => {
    if (!raw) return;
    let url;
    try { url = new URL(decodeEntities(raw), baseUrl); } catch { return; }
    if (!/^https?:$/u.test(url.protocol)) return;
    if (!officialHost(url.hostname, domains)) return;
    const href = url.toString();
    if (REJECT.test(href)) return;
    const existing = out.get(href);
    if (!existing || score > existing.score) out.set(href, { url: href, label: label.slice(0, 90), score });
  };
  for (const tag of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]{0,140}?)<\/a>/giu)) {
    const href = tag[1];
    const label = decodeEntities(tag[2].replace(/<[^>]+>/gu, " ")).replace(/\s+/gu, " ").trim();
    const signal = `${href} ${label}`;
    if (!LOGO_NAME.test(signal)) continue;
    if (/\.(svg|eps|ai)(?:[?#]|$)/iu.test(href)) add(href, label, 4);
    else if (/\.(png|webp|jpe?g)(?:[?#]|$)/iu.test(href)) add(href, label, 3);
    else if (/\.zip(?:[?#]|$)/iu.test(href)) add(href, label, 1);
  }
  for (const tag of html.matchAll(/<img\b[^>]*>/giu)) {
    const src = /(?:data-src|src)=["']([^"']+)["']/iu.exec(tag[0])?.[1];
    const alt = /alt=["']([^"']*)["']/iu.exec(tag[0])?.[1] ?? "";
    const cls = /class=["']([^"']*)["']/iu.exec(tag[0])?.[1] ?? "";
    if (!LOGO_NAME.test(`${src ?? ""} ${alt} ${cls}`)) continue;
    add(src, alt, /\.svg(?:[?#]|$)/iu.test(src ?? "") ? 4 : 2);
  }
  return [...out.values()].sort((a, b) => b.score - a.score).slice(0, 6);
}

async function investigate(brand) {
  const domains = brand.officialDomains?.length ? brand.officialDomains : [brand.officialDomain].filter(Boolean);
  const record = { slug: brand.brandId, name: brand.displayName, reviewRequired: true, pressPages: [], candidates: [] };
  let home;
  try {
    home = await fetchHtml(brand.officialWebsite);
  } catch (error) {
    record.status = "HOME_UNREACHABLE";
    record.error = error instanceof Error ? error.message : String(error);
    return record;
  }
  const pages = [];
  for (const link of pressLinks(home.html, home.finalUrl, domains)) {
    try {
      const page = await fetchHtml(link.url);
      pages.push({ ...page, label: link.label });
    } catch { /* linked press page may be gone */ }
  }
  if (!pages.length) {
    for (const guess of PRESS_PATHS) {
      let url;
      try { url = new URL(guess, home.finalUrl).toString(); } catch { continue; }
      try {
        const page = await fetchHtml(url);
        // An unknown path is often answered with the homepage and a 200, so
        // the destination has to still look like the page requested.
        const landed = new URL(page.finalUrl).pathname.toLowerCase();
        const keyword = guess.split("/").filter(Boolean).pop().slice(0, 5);
        if (!landed.includes(keyword) || /\b404\b|not[-_]?found/iu.test(landed)) continue;
        pages.push({ ...page, label: `direct ${guess}` });
        break;
      } catch { /* path absent */ }
    }
  }
  for (const page of pages) {
    record.pressPages.push({ url: page.finalUrl, label: page.label });
    for (const asset of logoAssets(page.html, page.finalUrl, domains)) {
      record.candidates.push({ ...asset, foundOn: page.finalUrl });
    }
  }
  record.candidates = record.candidates
    .sort((a, b) => b.score - a.score)
    .filter((c, i, all) => all.findIndex((o) => o.url === c.url) === i)
    .slice(0, 6);
  record.status = record.candidates.length
    ? "LOGO_ASSET_FOUND"
    : record.pressPages.length ? "PRESS_PAGE_NO_ASSET" : "NO_PRESS_PAGE";
  return record;
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

const targets = JSON.parse(await fs.readFile(targetsPath, "utf8")).records.slice(offset, offset + limit);
const records = await pooledMap(targets, concurrency, investigate);
const summary = records.reduce((counts, r) => {
  counts[r.status] = (counts[r.status] ?? 0) + 1;
  return counts;
}, {});
await fs.mkdir(OUTPUT_DIR, { recursive: true });
const outputPath = path.join(OUTPUT_DIR, `press-kit-${String(offset).padStart(4, "0")}-${String(targets.length).padStart(4, "0")}.json`);
await fs.writeFile(outputPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  source: "MANUFACTURER_OWNED_PRESS_AND_MEDIA_PAGES",
  policy: "DISCOVERY_ONLY_REQUIRES_VISUAL_AND_IDENTITY_REVIEW",
  offset, requested: targets.length, summary, records,
}, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ outputPath, ...summary }, null, 2)}\n`);
