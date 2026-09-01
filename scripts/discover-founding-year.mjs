// Founding-year discovery from company pages.
//
// foundedYear is empty for 1475 profiles, and manufacturers state it plainly
// on their own About or history page - "since 1889", "gegründet 1952", "dal
// 1974". This pass reads those pages and keeps the sentence that carried the
// year, so a reviewer sees the claim rather than a bare number.
//
// Nothing is published: the output is a review queue.
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const PROFILES_PATH = path.join(ROOT, "data/brand-knowledge-international/profiles.json");
const OUTPUT_DIR = path.join(ROOT, ".logo-work/founding-year");
const cliArguments = process.argv.slice(2).filter((a) => a !== "--");
const offset = Number(cliArguments[0] ?? 0);
const limit = Number(cliArguments[1] ?? 3000);
const concurrency = Math.min(Math.max(Number(cliArguments[2] ?? 8), 1), 12);

const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

const ABOUT_HINT =
  /(about[-_ ]?us|about|company|unternehmen|ueber[-_ ]?uns|über[-_ ]?uns|history|historie|geschichte|chi[-_ ]siamo|azienda|storia|qui[-_ ]sommes|entreprise|histoire|empresa|profile|philosophy|tradition)/iu;

const ABOUT_PATHS = [
  "/about", "/about-us", "/en/about", "/en/about-us", "/company", "/en/company",
  "/unternehmen", "/ueber-uns", "/history", "/en/history", "/geschichte",
  "/chi-siamo", "/azienda", "/storia", "/entreprise", "/empresa", "/profile",
];

// "Since" attaches to whatever follows it, which is often not the company:
// 3nine's "Since 2022" describes an ownership change, and ADDI-DATA's "Since
// 2013" a product milestone. Explicit founding wording is trusted on its own;
// a bare "since" is kept only when the sentence is about the company itself.
const FOUNDING_WORD = /\b(founded|established|est\.|founding|gegr[uü]ndet|gr[uü]ndung|fondata|fondazione|fond[eé]e?|fundada)\b/iu;
const NOT_FOUNDING_CONTEXT =
  /\b(ownership|owner|acquir|acquisition|shareholder|structure|range|series|product|generation|certified|iso|member of|part of|subsidiary|renamed|merger|joint venture)\b/iu;

const YEAR_PATTERNS = [
  /\b(?:since|est\.?|established|founded(?:\s+in)?|founding\s+year)\s+(1[6-9]\d{2}|20[0-2]\d)\b/giu,
  /\b(?:seit|gegr[uü]ndet(?:\s+im\s+Jahr)?|gr[uü]ndung(?:sjahr)?:?)\s+(1[6-9]\d{2}|20[0-2]\d)\b/giu,
  /\b(?:dal|fondata\s+nel|fondazione(?:\s+nel)?)\s+(1[6-9]\d{2}|20[0-2]\d)\b/giu,
  /\b(?:depuis|fond[eé]e?\s+en)\s+(1[6-9]\d{2}|20[0-2]\d)\b/giu,
  /\b(?:desde|fundada\s+en)\s+(1[6-9]\d{2}|20[0-2]\d)\b/giu,
  /\b(1[6-9]\d{2}|20[0-2]\d)\s*[-–]\s*(?:foundation|gr[uü]ndung|fondazione)\b/giu,
];

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/&nbsp;/giu, " ")
    .replace(/&amp;/giu, "&")
    .replace(/\s+/gu, " ");
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

function aboutLinks(html, baseUrl, domains) {
  const found = new Map();
  for (const tag of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]{0,120}?)<\/a>/giu)) {
    const href = tag[1];
    const label = tag[2].replace(/<[^>]+>/gu, " ").replace(/\s+/gu, " ").trim();
    if (!ABOUT_HINT.test(`${href} ${label}`)) continue;
    let url;
    try { url = new URL(href, baseUrl); } catch { continue; }
    if (!/^https?:$/u.test(url.protocol)) continue;
    const host = url.hostname.toLowerCase().replace(/^www\./u, "");
    if (!domains.some((d) => { const n = d.toLowerCase().replace(/^www\./u, ""); return host === n || host.endsWith(`.${n}`); })) continue;
    found.set(url.toString(), { url: url.toString(), label: label.slice(0, 60) });
  }
  return [...found.values()].slice(0, 3);
}

function findYears(text) {
  const hits = [];
  for (const pattern of YEAR_PATTERNS) {
    for (const m of text.matchAll(pattern)) {
      const year = Number(m[1]);
      if (year < 1600 || year > 2026) continue;
      const at = m.index ?? 0;
      const context = text.slice(Math.max(0, at - 110), at + m[0].length + 110).trim();
      hits.push({
        year,
        phrase: m[0].trim(),
        context,
        explicit: FOUNDING_WORD.test(m[0]),
        contextConflicts: NOT_FOUNDING_CONTEXT.test(context),
      });
    }
  }
  return hits;
}

async function investigate(profile) {
  const domains = profile.officialDomains ?? [];
  const record = { slug: profile.manufacturerId, name: profile.displayName, reviewRequired: true, hits: [] };
  let home;
  try {
    home = await fetchHtml(profile.officialWebsite);
  } catch (error) {
    record.status = "HOME_UNREACHABLE";
    record.error = error instanceof Error ? error.message : String(error);
    return record;
  }
  const pages = [{ ...home, label: "homepage" }];
  for (const link of aboutLinks(home.html, home.finalUrl, domains)) {
    try { pages.push({ ...(await fetchHtml(link.url)), label: link.label || "about" }); } catch { /* gone */ }
  }
  if (pages.length === 1) {
    for (const guess of ABOUT_PATHS) {
      let url;
      try { url = new URL(guess, home.finalUrl).toString(); } catch { continue; }
      try {
        const page = await fetchHtml(url);
        const landed = new URL(page.finalUrl).pathname.toLowerCase();
        const keyword = guess.split("/").filter(Boolean).pop().slice(0, 5);
        if (!landed.includes(keyword) || /\b404\b|not[-_]?found/iu.test(landed)) continue;
        pages.push({ ...page, label: `direct ${guess}` });
        break;
      } catch { /* absent */ }
    }
  }
  for (const page of pages) {
    for (const hit of findYears(stripTags(page.html))) {
      record.hits.push({ ...hit, sourceUrl: page.finalUrl, pageLabel: page.label });
    }
  }
  // An explicit founding statement outranks everything; a bare "since" counts
  // only when nothing in its sentence points at ownership or a product line.
  const explicit = record.hits.filter((h) => h.explicit && !h.contextConflicts);
  const weak = record.hits.filter((h) => !h.explicit && !h.contextConflicts);
  const usable = explicit.length ? explicit : weak;
  const counts = new Map();
  for (const h of usable) counts.set(h.year, (counts.get(h.year) ?? 0) + 1);
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]);
  record.proposedYear = ranked.length ? ranked[0][0] : null;
  record.distinctYears = ranked.length;
  record.evidenceStrength = explicit.length ? "EXPLICIT_FOUNDING_WORDING" : usable.length ? "SINCE_WORDING_ONLY" : "NONE";
  record.status = !record.hits.length
    ? "NO_YEAR_FOUND"
    : !usable.length ? "ONLY_CONFLICTING_CONTEXT"
      : ranked.length > 1 ? "SEVERAL_YEARS_NEEDS_REVIEW" : "YEAR_STATED";
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
const pending = profiles.filter((p) => p.officialWebsite && !p.foundedYear).slice(offset, offset + limit);
const records = await pooledMap(pending, concurrency, investigate);
const summary = records.reduce((c, r) => { c[r.status] = (c[r.status] ?? 0) + 1; return c; }, {});
await fs.mkdir(OUTPUT_DIR, { recursive: true });
const outputPath = path.join(OUTPUT_DIR, `founding-year-${String(offset).padStart(4, "0")}-${String(pending.length).padStart(4, "0")}.json`);
await fs.writeFile(outputPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  source: "MANUFACTURER_OWNED_ABOUT_AND_HISTORY_PAGES",
  policy: "DISCOVERY_ONLY_REQUIRES_REVIEW_BEFORE_PUBLICATION",
  offset, requested: pending.length, summary, records,
}, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ outputPath, ...summary }, null, 2)}\n`);
