import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const catalogPath = path.join(projectRoot, "app/generated/full-catalog.ts");
const registryPath = path.join(projectRoot, "app/lib/brand-logos.ts");
const outputDir = path.join(projectRoot, ".logo-work");

const batchOffset = Number(process.argv[2] ?? 0);
const batchSize = Number(process.argv[3] ?? 100);
const userAgent =
  "IndustriaPostavokLogoAudit/1.0 (catalog quality and attribution audit)";

const legalTerms = new Set([
  "ag",
  "co",
  "company",
  "corp",
  "corporation",
  "gmbh",
  "group",
  "holding",
  "holdings",
  "inc",
  "international",
  "limited",
  "llc",
  "ltd",
  "plc",
  "sa",
  "spa",
  "srl",
]);
const artworkTerms = new Set([
  "black",
  "blue",
  "brand",
  "cmyk",
  "color",
  "colour",
  "corporate",
  "current",
  "horizontal",
  "icon",
  "logo",
  "logotype",
  "new",
  "official",
  "old",
  "red",
  "rgb",
  "sign",
  "symbol",
  "trademark",
  "vertical",
  "white",
  "wordmark",
]);

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function stripHtml(value = "") {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(value) {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();
}

function meaningfulTokens(value, removeArtworkTerms = false) {
  const tokens = normalize(value).split(/\s+/).filter(Boolean);
  const filtered = tokens.filter(
    (token) =>
      !legalTerms.has(token) &&
      (!removeArtworkTerms || !artworkTerms.has(token)) &&
      !/^(?:19|20)\d{2}$/.test(token),
  );
  return filtered.length ? filtered : tokens;
}

function manufacturerCore(value) {
  return meaningfulTokens(value).join(" ");
}

function fileCore(value) {
  return meaningfulTokens(
    value
      .replace(/^File:/i, "")
      .replace(/\.[a-z0-9]{2,5}$/i, ""),
    true,
  ).join(" ");
}

function exactFileMatch(manufacturerName, fileTitle) {
  return manufacturerCore(manufacturerName) === fileCore(fileTitle);
}

function commonsSearchUrl(manufacturerName) {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: `intitle:"${manufacturerCore(manufacturerName)}" logo`,
    gsrnamespace: "6",
    gsrlimit: "8",
    prop: "imageinfo",
    iiprop: "url|mime|size|extmetadata",
    format: "json",
    origin: "*",
  });
  return `https://commons.wikimedia.org/w/api.php?${params}`;
}

async function fetchJson(url, attempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "user-agent": userAgent,
          accept: "application/json",
        },
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await delay(attempt * 700);
    }
  }
  throw lastError;
}

function candidateFromPage(manufacturer, page) {
  const image = page.imageinfo?.[0];
  const metadata = image?.extmetadata ?? {};
  const license = stripHtml(metadata.LicenseShortName?.value);
  if (
    !exactFileMatch(manufacturer.name, page.title) ||
    !image?.url ||
    !image?.descriptionurl ||
    !image?.mime?.startsWith("image/") ||
    !license
  ) {
    return null;
  }
  return {
    manufacturer,
    status: "verified-candidate",
    fileName: page.title.replace(/^File:/i, ""),
    sourcePage: image.descriptionurl,
    originalFile: image.url,
    mime: image.mime,
    width: image.width,
    height: image.height,
    license,
    licenseUrl: metadata.LicenseUrl?.value,
    attribution: stripHtml(
      metadata.Artist?.value ||
        metadata.Credit?.value ||
        metadata.Attribution?.value ||
        manufacturer.name,
    ),
  };
}

const [catalogSource, registrySource] = await Promise.all([
  fs.readFile(catalogPath, "utf8"),
  fs.readFile(registryPath, "utf8"),
]);
const catalogMatch = catalogSource.match(
  /fullManufacturers: Manufacturer\[\] = (\[.*\]);\s*$/s,
);
if (!catalogMatch) {
  throw new Error("Could not parse fullManufacturers");
}
const manufacturers = JSON.parse(catalogMatch[1]);
const registered = new Set(
  [...registrySource.matchAll(/\n\s+slug: "([^"]+)"/g)].map(
    (match) => match[1],
  ),
);
const missing = manufacturers.filter(
  (manufacturer) => !registered.has(manufacturer.slug),
);
const batch = missing.slice(batchOffset, batchOffset + batchSize);

async function discoverManufacturer(manufacturer) {
  try {
    const data = await fetchJson(commonsSearchUrl(manufacturer.name));
    const pages = Object.values(data.query?.pages ?? {});
    const candidates = pages
      .map((page) => candidateFromPage(manufacturer, page))
      .filter(Boolean);
    const unique = [
      ...new Map(
        candidates.map((candidate) => [candidate.originalFile, candidate]),
      ).values(),
    ];
    if (unique.length === 1) {
      return unique[0];
    }
    return {
      manufacturer,
      status: unique.length ? "ambiguous-candidates" : "no-exact-file",
      candidates: unique,
    };
  } catch (error) {
    return {
      manufacturer,
      status: "search-error",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

const results = [];
const concurrency = 5;
for (let index = 0; index < batch.length; index += concurrency) {
  const chunk = batch.slice(index, index + concurrency);
  results.push(...(await Promise.all(chunk.map(discoverManufacturer))));
  await delay(220);
}

const summary = results.reduce((counts, result) => {
  counts[result.status] = (counts[result.status] ?? 0) + 1;
  return counts;
}, {});
const report = {
  generatedAt: new Date().toISOString(),
  batchOffset,
  batchSize: batch.length,
  registryCount: registered.size,
  missingCount: missing.length,
  summary,
  verified: results.filter(
    (result) => result.status === "verified-candidate",
  ),
  review: results.filter(
    (result) => result.status !== "verified-candidate",
  ),
};

await fs.mkdir(outputDir, { recursive: true });
const reportPath = path.join(
  outputDir,
  `commons-search-${String(batchOffset).padStart(4, "0")}-${String(batch.length).padStart(4, "0")}.json`,
);
await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);

process.stdout.write(
  `${JSON.stringify(
    {
      reportPath: path.relative(projectRoot, reportPath),
      checked: batch.length,
      summary,
    },
    null,
    2,
  )}\n`,
);
