// Official catalog discovery.
//
// officialCatalogs is the emptiest half of the documents score: 1292 of 2231
// profiles carry none. A catalogue, brochure or product datasheet published by
// the manufacturer on its own domain is Tier A evidence and is exactly what a
// procurement reader wants, so this pass looks for those links and verifies
// each one actually resolves.
//
// A link is only proposed when it sits on an official domain of that brand.
// Discovery never publishes: the output is a review queue.
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const PROFILES_PATH = path.join(ROOT, "data/brand-knowledge-international/profiles.json");
const OUTPUT_DIR = path.join(ROOT, ".logo-work/catalogs");

const cliArguments = process.argv.slice(2).filter((a) => a !== "--");
const offset = Number(cliArguments[0] ?? 0);
const limit = Number(cliArguments[1] ?? 3000);
const concurrency = Math.min(Math.max(Number(cliArguments[2] ?? 8), 1), 12);

const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

// Words a manufacturer uses for its own published literature, across the
// languages these sites are actually written in.
const CATALOG_HINT =
  /(catalog|catalogue|katalog|catalogo|cat[aá]logo|brochure|brosch[uü]re|prospekt|prospectus|depliant|d[eé]pliant|datasheet|data[-_ ]sheet|datenblatt|scheda[-_ ]tecnica|documentation|dokumentation|documentazione|literature|download|herunterladen|telechargement|t[eé]l[eé]chargement|product[-_ ]guide|technical[-_ ]data)/iu;

// Product literature only. Safety data sheets, certificates and conformity
// declarations are published in the same download area and match the same
// words, but a buyer looking for a catalogue is not served by an ISO
// certificate - Quincy returned safety data sheets and Affetti an ISO 9001
// scan before these were excluded.
const CATALOG_REJECT =
  /(driver|software|firmware|update|app[-_ ]?store|press[-_ ]?release|newsletter|cookie|privacy|career|job|font|logo[-_ ]?pack|safety[-_ ]?data|sds|msds|sicherheitsdatenblatt|certificat|certificato|zertifikat|iso[-_ ]?9001|iso[-_ ]?14001|declaration[-_ ]?of[-_ ]?conformity|konformit[aä]t|warrant|terms|agb|annual[-_ ]?report)/iu;

// A site search result is not a document the manufacturer published.
const SEARCH_URL = /[?&](q|s|search|N|query|keyword)=/iu;

function decodeEntities(value = "") {
  return value
    .replaceAll("&amp;", "&").replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
}

function officialHost(hostname, domains) {
  const host = hostname.toLowerCase().replace(/^www\./u, "");
  return domains.some((domain) => {
    const d = domain.toLowerCase().replace(/^www\./u, "");
    return host === d || host.endsWith(`.${d}`);
  });
}

function candidateLinks(html, baseUrl, domains) {
  const found = new Map();
  for (const tag of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]{0,160}?)<\/a>/giu)) {
    const rawHref = decodeEntities(tag[1]);
    const label = decodeEntities(tag[2].replace(/<[^>]+>/gu, " ")).replace(/\s+/gu, " ").trim();
    const signal = `${rawHref} ${label}`;
    if (!CATALOG_HINT.test(signal)) continue;
    if (CATALOG_REJECT.test(signal)) continue;
    let url;
    try { url = new URL(rawHref, baseUrl); } catch { continue; }
    if (!/^https?:$/u.test(url.protocol)) continue;
    if (!officialHost(url.hostname, domains)) continue;
    if (SEARCH_URL.test(url.search) || /\/search\b/iu.test(url.pathname)) continue;
    // An in-page anchor carries the right label but no document: Affetti's
    // "Scarica i cataloghi" resolved to the homepage plus a bare "#".
    url.hash = "";
    const href = url.toString().replace(/#$/u, "");
    let base;
    try { base = new URL(baseUrl); } catch { base = null; }
    if (base && url.pathname === base.pathname && !url.search) continue;
    if (url.pathname === "/" && !url.search) continue;
    // A PDF is the literature itself; a page merely links to it.
    const score = /\.pdf(?:[?#]|$)/iu.test(href) ? 2 : 1;
    const existing = found.get(href);
    if (!existing || score > existing.score) found.set(href, { url: href, label: label.slice(0, 120), score });
  }
  return [...found.values()].sort((a, b) => b.score - a.score).slice(0, 6);
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

// A proposed catalogue has to exist. Some sites answer HEAD with 405, so a
// ranged GET is the fallback rather than trusting the link text.
async function verify(url) {
  const attempt = async (method, headers) => {
    const response = await fetch(url, {
      method, redirect: "follow",
      signal: AbortSignal.timeout(20000),
      headers: { "user-agent": userAgent, ...headers },
    });
    return {
      ok: response.ok,
      httpStatus: response.status,
      contentType: (response.headers.get("content-type") ?? "").split(";")[0].trim(),
      contentLength: Number(response.headers.get("content-length") ?? 0) || null,
      finalUrl: response.url,
    };
  };
  try {
    const head = await attempt("HEAD", {});
    if (head.ok) return head;
    if (head.httpStatus !== 405 && head.httpStatus !== 403) return head;
  } catch { /* fall through to GET */ }
  try {
    return await attempt("GET", { range: "bytes=0-2048" });
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function investigate(profile) {
  const domains = profile.officialDomains ?? [];
  const record = {
    slug: profile.manufacturerId,
    name: profile.displayName,
    officialWebsite: profile.officialWebsite,
    reviewRequired: true,
    candidates: [],
  };
  let home;
  try {
    home = await fetchHtml(profile.officialWebsite);
  } catch (error) {
    record.status = "HOME_UNREACHABLE";
    record.error = error instanceof Error ? error.message : String(error);
    return record;
  }
  const links = candidateLinks(home.html, home.finalUrl, domains);
  for (const link of links.slice(0, 4)) {
    const check = await verify(link.url);
    record.candidates.push({
      url: link.url,
      label: link.label,
      isPdf: link.score === 2,
      verified: Boolean(check.ok),
      httpStatus: check.httpStatus ?? null,
      contentType: check.contentType ?? null,
      contentLength: check.contentLength ?? null,
    });
  }
  const live = record.candidates.filter((c) => c.verified);
  const pdf = live.filter((c) => /pdf/iu.test(c.contentType ?? "") || c.isPdf);
  record.status = pdf.length
    ? "PDF_CATALOG_FOUND"
    : live.length
      ? "CATALOG_PAGE_FOUND"
      : "NO_CATALOG_FOUND";
  record.proposed = (pdf[0] ?? live[0])?.url ?? null;
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

const profiles = JSON.parse(await fs.readFile(PROFILES_PATH, "utf8")).profiles;
const pending = profiles
  .filter((p) => p.officialWebsite && !(p.officialCatalogs ?? []).length)
  .slice(offset, offset + limit);

const records = await pooledMap(pending, concurrency, investigate);
const summary = records.reduce((counts, r) => {
  counts[r.status] = (counts[r.status] ?? 0) + 1;
  return counts;
}, {});
await fs.mkdir(OUTPUT_DIR, { recursive: true });
const outputPath = path.join(
  OUTPUT_DIR,
  `catalogs-${String(offset).padStart(4, "0")}-${String(pending.length).padStart(4, "0")}.json`,
);
await fs.writeFile(
  outputPath,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      source: "MANUFACTURER_OWNED_LITERATURE_LINKS",
      policy: "DISCOVERY_ONLY_REQUIRES_REVIEW_BEFORE_PUBLICATION",
      offset, requested: pending.length, summary, records,
    },
    null,
    2,
  )}\n`,
);
process.stdout.write(`${JSON.stringify({ outputPath, ...summary }, null, 2)}\n`);
