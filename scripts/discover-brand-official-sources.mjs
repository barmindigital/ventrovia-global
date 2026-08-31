// Official-source discovery for manufacturer records that have no reviewed
// profile yet.
//
// Every record in the input already carries a documented review blocker, so
// this pass does not re-litigate identity. It gathers evidence: an independent
// index entry that proposes an official website, plus a live read of every
// candidate host. Discovery never promotes a profile — governance requires a
// reviewed Tier A/B source and a confirmed identity, and a similarly named
// domain is explicitly not enough. The output is a review queue.
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const MASTER_PATH = path.join(ROOT, "brand-master/data/brand-master.json");
const PROFILES_PATH = path.join(ROOT, "data/brand-knowledge-international/profiles.json");
const OUTPUT_DIR = path.join(ROOT, ".logo-work/source-discovery");

const cliArguments = process.argv.slice(2).filter((a) => a !== "--");
const offset = Number(cliArguments[0] ?? 0);
const limit = Number(cliArguments[1] ?? 1000);
const onlyCodes = (cliArguments[2] ?? "").split(",").filter(Boolean);
// Path to a discriminator file kept OUTSIDE the repository. The owner's legacy
// catalog may direct research but never proves a public brand fact, so hints
// only reorder candidates and are never written into a profile.
const hintsPath = cliArguments[3] ?? null;

// Wikimedia asks automated clients to identify themselves and the project.
const indexAgent =
  "VentroviaBrandSourceDiscovery/1.0 (manufacturer identity research; https://ventroviaglobal.com)";
// Manufacturer sites routinely reject unfamiliar agents at the CDN.
const siteAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

const PARKED = /(domain (?:is |may be )?for sale|buy this domain|parked (?:free )?(?:at|by|domain)|this domain is available|under construction|coming soon|sedoparking|afternic|dan\.com|hugedomains|godaddy\.com\/domainsearch|website is temporarily unavailable|account suspended|default web site page|apache2 (?:ubuntu |debian )?default page)/iu;

// Domain brokers serve a real HTML page with the brand name in the title, which
// is exactly the shape a naive identity check mistakes for the manufacturer.
const BROKER = /\b(for sale|is available for purchase|saw\.com|hugedomains|dan\.com|sedo|afternic|namecheap market|buydomains|domain broker|make an offer)\b/iu;

const COMPANY_HINT =
  /\b(company|manufacturer|manufacturing|corporation|enterprise|business|brand|group|gmbh|s\.p\.a|srl|s\.r\.l|ltd|inc|kg|ag|bv|oy|ab|sa|producer|engineering|industries|industrial|machine|equipment|pump|valve|motor|bearing|sensor|automation)\b/iu;

// A generic record like "CHAMPION" is only resolvable against the product
// domain it was catalogued under. These map the legacy taxonomy onto words a
// manufacturer actually uses about itself in English.
//
// "Оборудование и запчасти" is deliberately absent: it expands to equipment /
// components, which appear on essentially every industrial site and therefore
// discriminate nothing. Treating it as a match manufactured false confirmations.
const CATEGORY_KEYWORDS = {
  "Гидравлическое оборудование": ["hydraulic", "hydraulics", "hydraulik", "idraulic"],
  "Промышленные насосы": ["pump", "pumps", "pumpen", "pompe", "bomba"],
  "Электродвигатели и принадлежности": ["electric motor", "motors", "elektromotor", "motori"],
  "Датчики и измерительные линейки": ["sensor", "sensors", "measurement", "encoder", "transducer"],
  "Промышленные станки и комплектующие": ["machine tool", "machining", "lathe", "milling", "werkzeugmaschine"],
  "Запорная арматура": ["valve", "valves", "ventil", "valvole", "armaturen"],
  "Фильтры и фильтрующие установки": ["filter", "filters", "filtration", "filtre"],
  "Генераторы электрического тока": ["generator", "generators", "genset", "alternator"],
  "Автоматика и электронные компоненты": ["automation", "electronic", "controller", "plc"],
  "Редукторы промышленные": ["gearbox", "gear unit", "reducer", "getriebe", "riduttori"],

  "Компрессоры, турбины промышленные": ["compressor", "compressors", "turbine", "kompressor"],
  "Пневматическое оборудование": ["pneumatic", "pneumatics", "compressed air", "pneumatik"],
  "Электроприводы двигателя": ["drive", "inverter", "frequency converter", "servo"],
  "Направляющие и системы линейного перемещения": ["linear", "guideway", "linear motion", "rail"],
  "Кабели промышленные": ["cable", "cables", "kabel", "wire"],
  "Домкраты, приводы винтовые": ["screw jack", "actuator", "jack", "spindelhubgetriebe"],
  "Соединительные муфты вала": ["coupling", "couplings", "kupplung", "giunti"],
  "Водоподготовка": ["water treatment", "water", "wasseraufbereitung"],
  "Шпиндели": ["spindle", "spindles", "spindel"],
  "Подъемно-транспортное оборудование": ["hoist", "crane", "lifting", "conveyor"],
  "Лазеры промышленные": ["laser", "lasers"],
  "Ремни и ленты": ["belt", "belts", "riemen"],
  "Столы координатные и поворотные": ["rotary table", "positioning table", "index table"],
  "Лабораторное оборудование": ["laboratory", "lab", "analytical"],
  "Медицинское оборудование": ["medical", "clinical"],
};

// Wikidata writes nationality as an adjective far more often than a country
// name, so both spellings have to be recognised.
const COUNTRY_WORDS = {
  "Германия": ["german", "germany"], "Италия": ["italian", "italy"],
  "США": ["american", "united states", "u.s."], "Великобритания": ["british", "united kingdom", "england", "uk"],
  "Швейцария": ["swiss", "switzerland"], "Франция": ["french", "france"],
  "Япония": ["japanese", "japan"], "Бельгия": ["belgian", "belgium"],
  "Нидерланды": ["dutch", "netherlands"], "Австрия": ["austrian", "austria"],
  "Швеция": ["swedish", "sweden"], "Испания": ["spanish", "spain"],
  "Чехия": ["czech"], "Дания": ["danish", "denmark"], "Финляндия": ["finnish", "finland"],
  "Польша": ["polish", "poland"], "Китай": ["chinese", "china"], "Индия": ["indian", "india"],
  "Турция": ["turkish", "turkey"], "Южная Корея": ["korean", "korea"],
  "Сингапур": ["singapore"], "Норвегия": ["norwegian", "norway"],
  "Канада": ["canadian", "canada"], "Тайвань": ["taiwan", "taiwanese"],
  "Словения": ["slovenian", "slovenia"], "Венгрия": ["hungarian", "hungary"],
  "Португалия": ["portuguese", "portugal"], "Израиль": ["israeli", "israel"],
  "Бразилия": ["brazilian", "brazil"], "Австралия": ["australian", "australia"],
  "Россия": ["russian", "russia"], "Румыния": ["romanian", "romania"],
  "Словакия": ["slovak", "slovakia"], "Хорватия": ["croatian", "croatia"],
  "Ирландия": ["irish", "ireland"], "Греция": ["greek", "greece"],
  "Мексика": ["mexican", "mexico"], "Люксембург": ["luxembourg"],
};

// A manufacturer usually keeps its home ccTLD even when the English pages omit
// any nationality wording, so the TLD is a second chance before penalising.
const COUNTRY_TLD = {
  "Германия": [".de"], "Италия": [".it"], "США": [".com", ".us"],
  "Великобритания": [".uk"], "Швейцария": [".ch"], "Франция": [".fr"],
  "Япония": [".jp"], "Бельгия": [".be"], "Нидерланды": [".nl"],
  "Австрия": [".at"], "Швеция": [".se"], "Испания": [".es"],
  "Чехия": [".cz"], "Дания": [".dk"], "Финляндия": [".fi"],
  "Польша": [".pl"], "Китай": [".cn"], "Индия": [".in"],
  "Турция": [".tr"], "Южная Корея": [".kr"], "Сингапур": [".sg"],
  "Норвегия": [".no"], "Канада": [".ca"], "Тайвань": [".tw"],
  "Словения": [".si"], "Венгрия": [".hu"], "Португалия": [".pt"],
  "Израиль": [".il"], "Бразилия": [".br"], "Австралия": [".au"],
  "Россия": [".ru"], "Румыния": [".ro"], "Словакия": [".sk"],
  "Хорватия": [".hr"], "Ирландия": [".ie"], "Греция": [".gr"],
  "Мексика": [".mx"], "Люксембург": [".lu"],
};

function hintTerms(hint) {
  if (!hint) return { keywords: [], countryWords: [] };
  const keywords = [
    ...new Set(
      (hint.categories ?? [])
        .flatMap((c) => CATEGORY_KEYWORDS[c.category] ?? [])
        .map((k) => k.toLowerCase()),
    ),
  ];
  return { keywords, countryWords: COUNTRY_WORDS[hint.country] ?? [] };
}

function textOf(html, pattern) {
  const match = pattern.exec(html);
  return match ? match[1].replace(/\s+/gu, " ").trim() : null;
}

function metaContent(html, property) {
  const pattern = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`,
    "iu",
  );
  const alternate = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`,
    "iu",
  );
  return textOf(html, pattern) ?? textOf(html, alternate);
}

function organizationNames(html, found = []) {
  for (const block of html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/giu,
  )) {
    try {
      const walk = (value) => {
        if (Array.isArray(value)) return value.forEach(walk);
        if (!value || typeof value !== "object") return;
        const type = String(value["@type"] ?? "");
        if (/Organization|Corporation|LocalBusiness|Brand/iu.test(type)) {
          for (const key of ["name", "legalName", "alternateName"]) {
            if (typeof value[key] === "string") found.push(value[key]);
          }
        }
        Object.values(value).forEach((nested) => {
          if (nested && typeof nested === "object") walk(nested);
        });
      };
      walk(JSON.parse(block[1].trim()));
    } catch { /* malformed JSON-LD is common */ }
  }
  return [...new Set(found)];
}

// Legal forms and industry nouns are shared by thousands of manufacturers, so
// they cannot carry identity weight. What discriminates a record is the token
// left once they are removed.
const GENERIC_TOKEN =
  /^(gmbh|mbh|ag|kg|kgaa|srl|spa|spa?s|bv|nv|oy|ab|as|sa|sas|sarl|plc|ltd|limited|inc|llc|corp|corporation|co|company|group|holding|holdings|international|europe|deutschland|italia|france|espana|usa|america|and|the|von|der|di|de|el|la|systems|system|solutions|instruments|instrument|industries|industry|industrial|technologies|technology|technik|engineering|equipment|products|works|werke|fabrik|manufacturing|machinery|machines|machine|motors|motor|pumps|pump|pompe|pumpen|valves|valve|armaturen|controls|control|electric|electrical|electronics|electronic|elettronica|automation|sensors|sensor|hydraulic|hydraulics|hydraulik|pneumatic|pneumatics|bearings|bearing|gear|gears|seals|sealing|filter|filters|filtration|compressors|compressor|drives|drive|energy|power|service|services)$/iu;

function tokens(value = "") {
  return value
    .normalize("NFKD").replace(/\p{Diacritic}/gu, "")
    .toLowerCase().split(/[^a-z0-9]+/u).filter(Boolean);
}

function brandTokens(name) {
  const all = tokens(name);
  const distinctive = all.filter((t) => t.length > 2 && !GENERIC_TOKEN.test(t));
  return { all, distinctive: distinctive.length ? distinctive : all.filter((t) => t.length > 2) };
}

async function wikidataCandidates(name) {
  const searchUrl =
    "https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&limit=5" +
    `&search=${encodeURIComponent(name)}`;
  const search = await fetch(searchUrl, {
    headers: { "user-agent": indexAgent, accept: "application/json" },
    signal: AbortSignal.timeout(20000),
  }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const hits = search?.search ?? [];
  if (!hits.length) return { entities: [], websites: [] };

  const ids = hits.map((h) => h.id).join("|");
  const detailUrl =
    "https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&languages=en" +
    `&props=claims|labels|descriptions&ids=${ids}`;
  const detail = await fetch(detailUrl, {
    headers: { "user-agent": indexAgent, accept: "application/json" },
    signal: AbortSignal.timeout(25000),
  }).then((r) => (r.ok ? r.json() : null)).catch(() => null);

  const entities = [];
  for (const hit of hits) {
    const entity = detail?.entities?.[hit.id];
    if (!entity) continue;
    const claims = entity.claims ?? {};
    const website = (claims.P856 ?? [])
      .map((c) => c.mainsnak?.datavalue?.value)
      .filter((v) => typeof v === "string");
    const description = entity.descriptions?.en?.value ?? hit.description ?? "";
    entities.push({
      id: hit.id,
      label: entity.labels?.en?.value ?? hit.label ?? "",
      description,
      website,
      // A bare disambiguation page or a person is not a manufacturer lead.
      looksLikeCompany: COMPANY_HINT.test(description),
    });
  }
  return {
    entities,
    websites: [...new Set(entities.filter((e) => e.looksLikeCompany).flatMap((e) => e.website))],
  };
}

async function probe(url) {
  const record = { url, reachable: false };
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
      headers: {
        "user-agent": siteAgent,
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
      },
    });
    record.httpStatus = response.status;
    record.finalUrl = response.url;
    record.https = response.url.startsWith("https://");
    const contentType = response.headers.get("content-type") ?? "";
    if (!response.ok || !contentType.includes("text/html")) {
      record.verdict = response.ok ? "NOT_HTML" : "HTTP_ERROR";
      return record;
    }
    const html = (await response.text()).slice(0, 400000);
    record.reachable = true;
    record.title = textOf(html, /<title[^>]*>([\s\S]{0,300}?)<\/title>/iu);
    record.siteName = metaContent(html, "og:site_name");
    record.metaDescription = metaContent(html, "description");
    record.organizationNames = organizationNames(html);
    record.bodyLength = html.length;
    record.pageText = html
      .replace(/<script[\s\S]*?<\/script>/giu, " ")
      .replace(/<style[\s\S]*?<\/style>/giu, " ")
      .replace(/<[^>]+>/gu, " ")
      .replace(/\s+/gu, " ")
      .slice(0, 60000)
      .toLowerCase();
    const brokerSignal = [record.title ?? "", ...(record.organizationNames ?? [])].join(" ");
    record.parked =
      PARKED.test(html) || BROKER.test(brokerSignal) || html.length < 2000;
    record.verdict = record.parked ? "PARKED_OR_EMPTY" : "LIVE";
    return record;
  } catch (error) {
    record.verdict = error?.name === "TimeoutError" ? "TIMEOUT" : "FETCH_ERROR";
    record.error = error instanceof Error ? error.message : String(error);
    return record;
  }
}

// A single failed request rarely means the manufacturer is gone: hosts differ
// on www, and some still answer only over HTTP. Governance rejects an insecure
// source, but the attempt is still worth recording so review sees the reason.
function urlVariants(url) {
  const variants = [url];
  try {
    const parsed = new URL(url);
    const bare = parsed.hostname.replace(/^www\./u, "");
    const swapped = parsed.hostname.startsWith("www.") ? bare : `www.${bare}`;
    variants.push(`${parsed.protocol}//${swapped}${parsed.pathname}`);
    if (parsed.protocol === "https:") {
      variants.push(`http://${parsed.hostname}${parsed.pathname}`);
    }
  } catch { /* keep the original */ }
  return [...new Set(variants)];
}

async function probeWithFallback(url) {
  let last = null;
  for (const variant of urlVariants(url)) {
    const record = await probe(variant);
    if (record.reachable) {
      if (variant !== url) record.reachedVia = variant;
      return record;
    }
    last = last ?? record;
  }
  return last ?? { url, reachable: false, verdict: "FETCH_ERROR" };
}

// Discovery only. A generated domain proves nothing on its own; it becomes a
// lead exactly when the live page names the manufacturer back.
const GUESS_TLDS = ["com", "de", "it", "eu", "net", "co.uk", "fr", "nl", "es", "cz", "ch", "at", "se"];

function guessedUrls(name) {
  const { distinctive } = brandTokens(name);
  if (!distinctive.length) return [];
  const stems = [...new Set([distinctive.join(""), distinctive[0]])].filter((s) => s.length > 3);
  const urls = [];
  for (const stem of stems) for (const tld of GUESS_TLDS) urls.push(`https://www.${stem}.${tld}`);
  return urls;
}

// Identity evidence, not identity proof: says how strongly a live page names
// the brand it is supposed to belong to. Matching runs on distinctive tokens,
// because a multi-word record like "AMCA HYDRAULIC CONTROLS" never appears
// verbatim on the manufacturer's own masthead.
function identityEvidence(brandName, probeRecord) {
  if (!probeRecord.reachable || probeRecord.parked) return { score: 0, signals: [], matched: [] };
  const { distinctive } = brandTokens(brandName);
  if (!distinctive.length) return { score: 0, signals: [], matched: [] };
  const lead = distinctive[0];
  const host = (() => {
    try { return new URL(probeRecord.finalUrl).hostname.replace(/^www\./u, ""); } catch { return ""; }
  })();
  const hostTokens = tokens(host);
  // Dropping the public suffix keeps "bb-battery" comparable to "bb battery"
  // while stopping "medc" from matching inside "medcoenergi".
  const hostStem = hostTokens.slice(0, Math.max(1, hostTokens.length - 1)).join("");
  const orgText = (probeRecord.organizationNames ?? []).join(" ");

  const fields = [
    { key: "DOMAIN", weight: 35, text: hostStem, joined: true, hostTokens },
    { key: "JSON_LD_ORGANIZATION_NAME", weight: 40, text: orgText },
    { key: "OG_SITE_NAME", weight: 20, text: probeRecord.siteName ?? "" },
    { key: "TITLE", weight: 15, text: probeRecord.title ?? "" },
  ];

  const signals = [];
  const matched = new Set();
  let score = 0;
  for (const field of fields) {
    const haystack = field.joined ? field.text : tokens(field.text).join(" ");
    const hasLead = field.joined
      // A host only counts when a whole label equals the token, or the label
      // stem is exactly the brand stem — never a partial word.
      ? field.hostTokens.includes(lead) || haystack === distinctive.join("")
      : tokens(field.text).includes(lead);
    if (!hasLead) continue;
    signals.push(field.key);
    score += field.weight;
    matched.add(lead);
    // Every further distinctive token that also appears raises confidence that
    // this is the same entity rather than a name collision.
    const parts = field.joined ? field.hostTokens : tokens(field.text);
    for (const token of distinctive.slice(1)) {
      if (parts.includes(token)) { matched.add(token); score += 5; }
    }
  }
  return { score, signals, matched: [...matched], distinctive };
}

async function investigate(brand) {
  const { keywords, countryWords } = hintTerms(brand.hint);
  const index = await wikidataCandidates(brand.name);
  const attempted = brand.attempted ?? [];
  const known = [...new Set([...index.websites, ...attempted])];
  // Guessing is a last resort and stays capped, so a record with real leads is
  // never buried under speculative hosts.
  const guessed = known.length ? [] : guessedUrls(brand.name).slice(0, 8);
  const urls = [...known, ...guessed].slice(0, 10);
  const probes = [];
  for (const url of urls) probes.push(await probeWithFallback(url));
  const scored = probes.map((p) => {
    const evidence = identityEvidence(brand.name, p);
    // The hint cannot create identity on its own; it only separates same-named
    // companies once the page already names the brand.
    if (evidence.score > 0 && p.pageText) {
      const matchedKeywords = keywords.filter((k) => p.pageText.includes(k));
      if (matchedKeywords.length) {
        evidence.score += 25;
        evidence.signals.push("PRODUCT_DOMAIN_MATCHES_CATALOG_HINT");
        evidence.matchedKeywords = matchedKeywords.slice(0, 5);
      } else if (keywords.length) {
        evidence.score -= 20;
        evidence.signals.push("PRODUCT_DOMAIN_CONFLICTS_WITH_CATALOG_HINT");
      }
      // A country-of-origin mismatch is a strong signal of a name collision:
      // the catalogued German brand is not the Turkish company of the same name.
      if (countryWords.length) {
        const host = (() => {
          try { return new URL(p.finalUrl).hostname; } catch { return ""; }
        })();
        const homeTld = COUNTRY_TLD[brand.hint?.country] ?? [];
        const tldFits = homeTld.some((t) => host.endsWith(t));
        if (countryWords.some((c) => p.pageText.includes(c)) || tldFits) {
          evidence.score += 10;
          evidence.signals.push("COUNTRY_MATCHES_CATALOG_HINT");
        } else {
          evidence.score -= 25;
          evidence.signals.push("COUNTRY_CONFLICTS_WITH_CATALOG_HINT");
        }
      }
    }
    // The page body was only needed for the hint comparison above; keeping it
    // would bloat every report by tens of kilobytes per candidate.
    const rest = { ...p };
    delete rest.pageText;
    return { ...rest, evidence };
  });
  scored.sort((a, b) => b.evidence.score - a.evidence.score);
  const best = scored[0];
  let companyEntities = index.entities.filter((e) => e.looksLikeCompany);
  if (keywords.length || countryWords.length) {
    const fits = (e) => {
      const description = (e.description ?? "").toLowerCase();
      return (
        keywords.some((k) => description.includes(k)) ||
        countryWords.some((c) => description.includes(c))
      );
    };
    const matching = companyEntities.filter(fits);
    // Only one index entity fits the catalogued product domain, so the name
    // collision that blocked this record is resolved for review purposes.
    if (matching.length) companyEntities = matching;
  }

  let outcome = "NO_SOURCE_FOUND";
  if (best?.evidence.score >= 45) outcome = "CANDIDATE_SOURCE_FOR_REVIEW";
  else if (best?.evidence.score > 0) outcome = "WEAK_CANDIDATE_FOR_REVIEW";
  else if (scored.some((p) => p.parked)) outcome = "DOMAIN_PARKED";
  if (companyEntities.length > 1 && outcome !== "NO_SOURCE_FOUND") {
    outcome = "AMBIGUOUS_MULTIPLE_ENTITIES";
  }

  return {
    slug: brand.slug,
    name: brand.name,
    existingBlocker: brand.code,
    outcome,
    reviewRequired: true,
    candidateOrigin: known.length ? "INDEX_OR_PRIOR_ATTEMPT" : "GENERATED_DOMAIN_GUESS",
    catalogHint: brand.hint
      ? {
          categories: (brand.hint.categories ?? []).slice(0, 3).map((c) => c.category),
          country: brand.hint.country,
          tier: "D",
          use: "RESEARCH_DIRECTION_ONLY_NEVER_A_PUBLISHED_FACT",
        }
      : null,
    indexEntities: index.entities.map((e) => ({
      id: e.id, label: e.label, description: e.description,
      website: e.website, looksLikeCompany: e.looksLikeCompany,
    })),
    probes: scored,
  };
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

const [master, profilesPayload] = await Promise.all([
  fs.readFile(MASTER_PATH, "utf8").then(JSON.parse),
  fs.readFile(PROFILES_PATH, "utf8").then(JSON.parse),
]);
const profiled = new Set(profilesPayload.profiles.map((p) => p.manufacturerId));
let pending = master.brands
  .filter((b) => !profiled.has(b.id))
  .map((b) => ({
    slug: b.id,
    name: b.canonicalName,
    code: b.reviewStatus?.blockerCode ?? "NONE",
    attempted: b.reviewStatus?.attemptedUrls ?? [],
  }));
if (onlyCodes.length) pending = pending.filter((b) => onlyCodes.includes(b.code));
if (hintsPath) {
  const hints = new Map(
    JSON.parse(await fs.readFile(hintsPath, "utf8")).map((h) => [h.slug, h]),
  );
  pending = pending.map((b) => ({ ...b, hint: hints.get(b.slug) ?? null }));
}
const selected = pending.slice(offset, offset + limit);

const records = await pooledMap(selected, 8, investigate);
const summary = records.reduce((counts, r) => {
  counts[r.outcome] = (counts[r.outcome] ?? 0) + 1;
  return counts;
}, {});
await fs.mkdir(OUTPUT_DIR, { recursive: true });
const outputPath = path.join(
  OUTPUT_DIR,
  `source-discovery-${String(offset).padStart(4, "0")}-${String(selected.length).padStart(4, "0")}.json`,
);
await fs.writeFile(
  outputPath,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      policy: "DISCOVERY_ONLY_REQUIRES_TIER_A_OR_B_REVIEW_BEFORE_ANY_PROFILE",
      indexSource: "wikidata.org (Tier C supplementary discovery)",
      offset, requested: selected.length, filterCodes: onlyCodes, summary, records,
    },
    null,
    2,
  )}\n`,
);
process.stdout.write(`${JSON.stringify({ outputPath, ...summary }, null, 2)}\n`);
