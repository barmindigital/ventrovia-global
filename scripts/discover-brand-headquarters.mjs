// Headquarters and country discovery from manufacturer-owned imprint pages.
//
// Country and registered seat are the weakest fields in the public profiles.
// Both are stated by the manufacturer itself on its legal-notice or contact
// page, which is a Tier A source, so this pass locates that page and captures
// the address block verbatim together with the URL that carried it.
//
// It infers nothing it cannot show: every record keeps the raw snippet, and a
// country is reported only when the page says it or the registered postal
// format and domain agree. Nothing is written into a profile here - curated
// facts still go through review.
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const PROFILES_PATH = path.join(ROOT, "data/brand-knowledge-international/profiles.json");
const OUTPUT_DIR = path.join(ROOT, ".logo-work/headquarters");

const cliArguments = process.argv.slice(2).filter((a) => a !== "--");
const offset = Number(cliArguments[0] ?? 0);
const limit = Number(cliArguments[1] ?? 3000);
const concurrency = Math.min(Math.max(Number(cliArguments[2] ?? 8), 1), 12);

const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

// The legal-notice page is named differently per jurisdiction, and it is the
// one page that must carry a registered address.
const IMPRINT_HINT =
  /(impressum|imprint|legal[-_ ]?notice|mentions[-_ ]?legales|note[-_ ]?legali|aviso[-_ ]?legal|colofon|legal|kontakt|contact|contatti|contacto|about[-_ ]?us|company|unternehmen|chi[-_ ]siamo)/iu;

const COUNTRY_BY_TLD = {
  de: "Germany", it: "Italy", fr: "France", nl: "Netherlands", be: "Belgium",
  at: "Austria", ch: "Switzerland", se: "Sweden", no: "Norway", dk: "Denmark",
  fi: "Finland", es: "Spain", pt: "Portugal", pl: "Poland", cz: "Czechia",
  sk: "Slovakia", hu: "Hungary", si: "Slovenia", hr: "Croatia", ro: "Romania",
  bg: "Bulgaria", gr: "Greece", ie: "Ireland", uk: "United Kingdom",
  jp: "Japan", cn: "China", tw: "Taiwan", kr: "South Korea", in: "India",
  tr: "Turkey", il: "Israel", br: "Brazil", mx: "Mexico", ca: "Canada",
  au: "Australia", nz: "New Zealand", za: "South Africa", ru: "Russia",
  sg: "Singapore", lu: "Luxembourg", ee: "Estonia", lt: "Lithuania", lv: "Latvia",
};

const COUNTRY_NAMES = [
  ["Germany", /\b(germany|deutschland|allemagne)\b/iu],
  ["Italy", /\b(italy|italia|italien)\b/iu],
  ["France", /\b(france|frankreich)\b/iu],
  ["Netherlands", /\b(netherlands|nederland|holland)\b/iu],
  ["Belgium", /\b(belgium|belgi[eë]|belgique)\b/iu],
  ["Austria", /\b(austria|[oö]sterreich)\b/iu],
  ["Switzerland", /\b(switzerland|schweiz|suisse|svizzera)\b/iu],
  ["Sweden", /\b(sweden|sverige)\b/iu],
  ["Norway", /\b(norway|norge)\b/iu],
  ["Denmark", /\b(denmark|danmark)\b/iu],
  ["Finland", /\b(finland|suomi)\b/iu],
  ["Spain", /\b(spain|espa[nñ]a)\b/iu],
  ["Portugal", /\bportugal\b/iu],
  ["Poland", /\b(poland|polska)\b/iu],
  ["Czechia", /\b(czech republic|czechia|[cč]esk[aá])\b/iu],
  ["Slovakia", /\b(slovakia|slovensk[aá])\b/iu],
  ["Hungary", /\b(hungary|magyarorsz[aá]g)\b/iu],
  ["Slovenia", /\b(slovenia|slovenija)\b/iu],
  ["Croatia", /\b(croatia|hrvatska)\b/iu],
  ["Romania", /\brom[aâ]nia\b/iu],
  ["Turkey", /\b(turkey|t[uü]rkiye)\b/iu],
  ["United Kingdom", /\b(united kingdom|england|scotland|wales|great britain)\b/iu],
  ["Ireland", /\b(ireland|[eé]ire)\b/iu],
  ["United States", /\b(united states|u\.?s\.?a\.?)\b/iu],
  ["Canada", /\bcanada\b/iu],
  ["Japan", /\b(japan|nippon)\b/iu],
  ["China", /\b(china|p\.?r\.?c\.?)\b/iu],
  ["Taiwan", /\btaiwan\b/iu],
  ["South Korea", /\b(south korea|republic of korea)\b/iu],
  ["India", /\bindia\b/iu],
  ["Israel", /\bisrael\b/iu],
  ["Brazil", /\b(brazil|brasil)\b/iu],
  ["Mexico", /\b(mexico|m[eé]xico)\b/iu],
  ["Australia", /\baustralia\b/iu],
  ["Singapore", /\bsingapore\b/iu],
  ["Greece", /\b(greece|hellas)\b/iu],
];

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<br\s*\/?>/giu, "\n")
    .replace(/<\/(p|div|li|td|tr|address|h[1-6])>/giu, "\n")
    .replace(/<[^>]+>/gu, " ")
    .replace(/&nbsp;/giu, " ")
    .replace(/&amp;/giu, "&")
    .replace(/[ \t ]+/gu, " ")
    .replace(/\n{3,}/gu, "\n\n");
}

function imprintLinks(html, baseUrl) {
  const found = new Map();
  for (const tag of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]{0,120}?)<\/a>/giu)) {
    const href = tag[1];
    const label = stripTags(tag[2]).trim();
    if (!IMPRINT_HINT.test(href) && !IMPRINT_HINT.test(label)) continue;
    let url;
    try { url = new URL(href, baseUrl).toString(); } catch { continue; }
    if (!/^https?:/u.test(url)) continue;
    // A legal notice outranks a generic contact page when both exist.
    const rank = /(impressum|imprint|legal|mentions|note[-_ ]?legali|aviso)/iu.test(href + label) ? 2 : 1;
    const existing = found.get(url);
    if (!existing || rank > existing.rank) found.set(url, { url, label, rank });
  }
  return [...found.values()].sort((a, b) => b.rank - a.rank).slice(0, 3);
}

// An address block is the run of lines around a postal code that also names a
// street, so the snippet stays short enough for a human to judge at a glance.
const POSTAL = /(\b[A-Z]{1,2}-?\s?\d{4,6}\b|\b\d{5}(-\d{4})?\b|\b\d{4}\s?[A-Z]{2}\b|\b[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}\b)/u;
const STREET = /(stra[sß]e|str\.|weg|platz|allee|ring|via|viale|corso|piazza|rue|avenue|boulevard|street|road|lane|drive|st\.|rd\.|ave\.|calle|carrer|straat|laan|vej|gata|gatan|utca|ulica)/iu;

function addressBlocks(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const blocks = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (!POSTAL.test(lines[i])) continue;
    const from = Math.max(0, i - 3);
    const to = Math.min(lines.length, i + 3);
    const block = lines.slice(from, to).join("\n");
    if (!STREET.test(block)) continue;
    if (block.length > 400) continue;
    blocks.push(block);
    if (blocks.length >= 3) break;
  }
  return blocks;
}

// A registered address often omits the country because the reader is assumed
// to be local. The postal format still identifies it unambiguously.
const POSTAL_COUNTRY = [
  ["Germany", /\bD\s?-\s?\d{5}\b/u],
  ["Switzerland", /\bCH\s?-\s?\d{4}\b/u],
  ["Austria", /\bA\s?-\s?\d{4}\b/u],
  ["France", /\bF\s?-\s?\d{5}\b/u],
  ["Italy", /\bI\s?-\s?\d{5}\b/u],
  ["Belgium", /\bB\s?-\s?\d{4}\b/u],
  ["Netherlands", /\bNL\s?-\s?\d{4}\s?[A-Z]{2}\b/u],
  ["Spain", /\bE\s?-\s?\d{5}\b/u],
  ["Poland", /\bPL\s?-\s?\d{2}-\d{3}\b/u],
  ["Sweden", /\bS(E)?\s?-\s?\d{3}\s?\d{2}\b/u],
  ["Denmark", /\bDK\s?-\s?\d{4}\b/u],
  ["Czechia", /\bCZ\s?-\s?\d{3}\s?\d{2}\b/u],
];

function detectCountry(text) {
  for (const [name, pattern] of COUNTRY_NAMES) if (pattern.test(text)) return name;
  for (const [name, pattern] of POSTAL_COUNTRY) if (pattern.test(text)) return name;
  return null;
}

// An address only describes this manufacturer if the block names it. Where the
// profile's official website belongs to a parent, the legal notice states the
// parent's seat, which is a different company in a different country.
const GENERIC_TOKEN =
  /^(gmbh|mbh|ag|kg|kgaa|srl|spa|bv|nv|oy|ab|as|sa|sas|sarl|plc|ltd|limited|inc|llc|corp|corporation|co|company|group|holding|holdings|international|europe|deutschland|italia|france|systems|system|solutions|industries|industry|industrial|technologies|technology|technik|engineering|equipment|products|works|werke|pumps|pump|valves|valve|motors|motor)$/iu;

function brandTokens(name) {
  const all = name
    .normalize("NFKD").replace(/\p{Diacritic}/gu, "")
    .toLowerCase().split(/[^a-z0-9]+/u).filter(Boolean);
  const distinctive = all.filter((t) => t.length > 2 && !GENERIC_TOKEN.test(t));
  return distinctive.length ? distinctive : all.filter((t) => t.length > 2);
}

function blockNamesBrand(block, name) {
  const haystack = block
    .normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  return brandTokens(name).some((token) => haystack.includes(token));
}

async function fetchText(url) {
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
  return { html: (await response.text()).slice(0, 500000), finalUrl: response.url };
}

async function investigate(profile) {
  const record = {
    slug: profile.manufacturerId,
    name: profile.displayName,
    officialWebsite: profile.officialWebsite,
    knownCountry: profile.country ?? null,
    knownHeadquarters: profile.headquarters ?? null,
    reviewRequired: true,
    evidence: [],
  };
  let home;
  try {
    home = await fetchText(profile.officialWebsite);
  } catch (error) {
    record.status = "HOME_UNREACHABLE";
    record.error = error instanceof Error ? error.message : String(error);
    return record;
  }
  // A legal notice states the registered seat; a contact page often lists every
  // sales office worldwide, so its first address is not the headquarters.
  const pages = [{ url: home.finalUrl, html: home.html, label: "homepage", rank: 0 }];
  for (const link of imprintLinks(home.html, home.finalUrl)) {
    try {
      const page = await fetchText(link.url);
      pages.push({
        url: page.finalUrl, html: page.html,
        label: link.label || "legal page", rank: link.rank,
      });
    } catch { /* a missing legal page is itself unremarkable */ }
  }
  for (const page of pages) {
    const text = stripTags(page.html);
    for (const block of addressBlocks(text)) {
      record.evidence.push({
        sourceUrl: page.url,
        pageLabel: page.label,
        pageRank: page.rank,
        addressBlock: block,
        countryInBlock: detectCountry(block),
        namesBrand: blockNamesBrand(block, profile.displayName),
      });
    }
  }
  record.evidence.sort(
    (a, b) => Number(b.namesBrand) - Number(a.namesBrand) || b.pageRank - a.pageRank,
  );
  const tld = (() => {
    try { return new URL(home.finalUrl).hostname.split(".").pop().toLowerCase(); } catch { return null; }
  })();
  record.countryFromTld = COUNTRY_BY_TLD[tld] ?? null;
  const best =
    record.evidence.find((e) => e.countryInBlock && e.namesBrand) ??
    record.evidence.find((e) => e.countryInBlock) ??
    null;
  record.countryStatedOnPage = best?.countryInBlock ?? null;
  record.headquartersEvidence = best?.addressBlock ?? null;
  record.headquartersSourceUrl = best?.sourceUrl ?? null;
  const distinct = [...new Set(record.evidence.map((e) => e.countryInBlock).filter(Boolean))];
  record.countriesSeenOnPages = distinct;
  // Only a country the page states, or one the domain corroborates, is
  // proposed; a bare guess from the TLD stays visible but unconfirmed.
  if (record.countryStatedOnPage) {
    record.proposedCountry = record.countryStatedOnPage;
    if (!best.namesBrand) {
      record.confidence = "ADDRESS_DOES_NOT_NAME_THE_BRAND_LIKELY_PARENT";
    } else if (distinct.length > 1) {
      // A page naming several countries is a sales-office list, not a seat.
      record.confidence = "MULTIPLE_COUNTRIES_LISTED_NEEDS_MANUAL_PICK";
    } else if (record.countryFromTld && record.countryFromTld !== record.countryStatedOnPage) {
      record.confidence = "STATED_BUT_CONFLICTS_WITH_DOMAIN";
    } else {
      record.confidence = "STATED_ON_OFFICIAL_PAGE";
    }
  } else if (record.countryFromTld) {
    record.proposedCountry = record.countryFromTld;
    record.confidence = "DOMAIN_ONLY_NEEDS_CONFIRMATION";
  } else {
    record.proposedCountry = null;
    record.confidence = "NONE";
  }
  record.status = record.evidence.length ? "ADDRESS_FOUND" : "NO_ADDRESS_FOUND";
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
  .filter((p) => p.officialWebsite && (!p.headquarters || !p.country))
  .slice(offset, offset + limit);

const records = await pooledMap(pending, concurrency, investigate);
const summary = records.reduce((counts, r) => {
  counts[r.status] = (counts[r.status] ?? 0) + 1;
  return counts;
}, {});
const confidence = records.reduce((counts, r) => {
  counts[r.confidence ?? "NONE"] = (counts[r.confidence ?? "NONE"] ?? 0) + 1;
  return counts;
}, {});
await fs.mkdir(OUTPUT_DIR, { recursive: true });
const outputPath = path.join(
  OUTPUT_DIR,
  `headquarters-${String(offset).padStart(4, "0")}-${String(pending.length).padStart(4, "0")}.json`,
);
await fs.writeFile(
  outputPath,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      source: "MANUFACTURER_OWNED_LEGAL_NOTICE_AND_CONTACT_PAGES",
      policy: "DISCOVERY_ONLY_CURATED_FACTS_STILL_REQUIRE_REVIEW",
      offset, requested: pending.length, summary, confidence, records,
    },
    null,
    2,
  )}\n`,
);
process.stdout.write(`${JSON.stringify({ outputPath, ...summary, confidence }, null, 2)}\n`);
