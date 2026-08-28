import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const GAPS_PATH = path.join(ROOT, "brand-master/data/brand-logo-gaps.json");
const OUTPUT_DIR = path.join(ROOT, ".logo-work/official-site");
const cliArguments = process.argv.slice(2).filter((argument) => argument !== "--");
const offset = Number(cliArguments[0] ?? 0);
const limit = Number(cliArguments[1] ?? 200);
const concurrency = Math.min(
  Math.max(Number(cliArguments[2] ?? 8), 1),
  12,
);
const userAgent =
  "VentroviaBrandAssetAudit/1.0 (official manufacturer logo provenance review)";

function decodeEntities(value = "") {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function normalize(value = "") {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();
}

function attributes(tag) {
  const result = {};
  for (const match of tag.matchAll(
    /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gu,
  )) {
    result[match[1].toLowerCase()] = decodeEntities(
      match[2] ?? match[3] ?? match[4] ?? "",
    );
  }
  return result;
}

function resolveUrl(value, baseUrl) {
  if (!value || value.startsWith("data:")) return null;
  try {
    return new URL(value.trim(), baseUrl).toString();
  } catch {
    return null;
  }
}

function srcsetUrl(value, baseUrl) {
  if (!value) return null;
  const entries = value
    .split(",")
    .map((entry) => entry.trim().split(/\s+/u)[0])
    .filter(Boolean);
  return resolveUrl(entries.at(-1), baseUrl);
}

function pushCandidate(target, candidate) {
  if (!candidate.url) return;
  if (/\b(favicon|apple-touch|loader|spinner|pixel|avatar)\b/iu.test(candidate.url)) {
    return;
  }
  const existing = target.get(candidate.url);
  if (!existing || candidate.score > existing.score) target.set(candidate.url, candidate);
}

function jsonLogoValues(value, source = "JSON_LD", found = []) {
  if (Array.isArray(value)) {
    for (const entry of value) jsonLogoValues(entry, source, found);
    return found;
  }
  if (!value || typeof value !== "object") return found;
  for (const [key, child] of Object.entries(value)) {
    if (/^(logo|image)$/iu.test(key)) {
      if (typeof child === "string") found.push({ value: child, source });
      else if (child && typeof child === "object") {
        for (const property of ["url", "contentUrl", "@id"]) {
          if (typeof child[property] === "string") {
            found.push({ value: child[property], source });
          }
        }
      }
    }
    jsonLogoValues(child, source, found);
  }
  return found;
}

function extractCandidates(html, pageUrl, brand) {
  const candidates = new Map();
  const brandName = normalize(brand.displayName);
  const brandTokens = brandName.split(" ").filter((token) => token.length >= 3);

  for (const script of html.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/giu,
  )) {
    try {
      const payload = JSON.parse(script[1].trim());
      for (const item of jsonLogoValues(payload)) {
        pushCandidate(candidates, {
          url: resolveUrl(item.value, pageUrl),
          score: 100,
          sourceType: item.source,
          evidence: "Structured data logo/image property",
        });
      }
    } catch {
      // Invalid third-party JSON-LD must not block the page audit.
    }
  }

  for (const metaTag of html.matchAll(/<meta\b[^>]*>/giu)) {
    const attrs = attributes(metaTag[0]);
    const property = `${attrs.property ?? ""} ${attrs.name ?? ""}`.toLowerCase();
    if (!/logo|og:image/u.test(property)) continue;
    pushCandidate(candidates, {
      url: resolveUrl(attrs.content, pageUrl),
      score: property.includes("logo") ? 95 : 45,
      sourceType: "META",
      evidence: property.trim(),
    });
  }

  for (const imageTag of html.matchAll(/<img\b[^>]*>/giu)) {
    const attrs = attributes(imageTag[0]);
    const signal = [attrs.alt, attrs.class, attrs.id, attrs.itemprop, attrs.title]
      .filter(Boolean)
      .join(" ");
    const normalizedSignal = normalize(signal);
    const hasLogoSignal = /\blogo\b/iu.test(signal);
    const hasBrandSignal =
      brandName.length >= 4 &&
      (normalizedSignal.includes(brandName) ||
        brandTokens.some((token) => normalizedSignal.includes(token)));
    if (!hasLogoSignal && !hasBrandSignal) continue;
    const url =
      resolveUrl(
        attrs.src ?? attrs["data-src"] ?? attrs["data-lazy-src"],
        pageUrl,
      ) ?? srcsetUrl(attrs.srcset ?? attrs["data-srcset"], pageUrl);
    let score = 55;
    if (hasLogoSignal) score += 20;
    if (hasBrandSignal) score += 15;
    if (attrs.itemprop === "logo") score += 15;
    if (/\.(svg|png|webp)(?:[?#]|$)/iu.test(url ?? "")) score += 5;
    pushCandidate(candidates, {
      url,
      score,
      sourceType: "HTML_IMAGE",
      evidence: signal.trim().slice(0, 240),
    });
  }

  return [...candidates.values()]
    .sort((left, right) => right.score - left.score)
    .slice(0, 8);
}

async function fetchPage(brand) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(brand.officialWebsite, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": userAgent,
        accept: "text/html,application/xhtml+xml",
        "accept-language": "en;q=1.0",
      },
    });
    const contentType = response.headers.get("content-type") ?? "";
    if (!response.ok || !contentType.includes("text/html")) {
      return {
        brand,
        status: "HTTP_BLOCKED",
        httpStatus: response.status,
        finalUrl: response.url,
        candidates: [],
      };
    }
    const html = await response.text();
    const candidates = extractCandidates(html, response.url, brand);
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
      status: error?.name === "AbortError" ? "TIMEOUT" : "FETCH_ERROR",
      error: error instanceof Error ? error.message : String(error),
      candidates: [],
    };
  } finally {
    clearTimeout(timeout);
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
const report = {
  generatedAt: new Date().toISOString(),
  source: "OFFICIAL_MANUFACTURER_WEBSITES",
  policy: "DISCOVERY_ONLY_REQUIRES_IDENTITY_AND_VISUAL_REVIEW_BEFORE_IMPORT",
  offset,
  requested: selected.length,
  concurrency,
  summary,
  records: results,
};
await fs.mkdir(OUTPUT_DIR, { recursive: true });
const outputPath = path.join(
  OUTPUT_DIR,
  `official-site-${String(offset).padStart(4, "0")}-${String(selected.length).padStart(4, "0")}.json`,
);
await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ outputPath, ...summary }, null, 2)}\n`);
