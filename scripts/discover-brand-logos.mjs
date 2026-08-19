import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const manufacturerPath = path.join(projectRoot, "data/manufacturers/identities.json");
const registryPath = path.join(projectRoot, "app/lib/brand-logos.ts");
const outputDir = path.join(projectRoot, ".logo-work");

const batchOffset = Number(process.argv[2] ?? 0);
const batchSize = Number(process.argv[3] ?? 500);

const userAgent =
  "VentroviaBrandLogoAudit/2.0 (brand identity and attribution audit)";

const legalTerms = new Set([
  "ag",
  "co",
  "company",
  "corp",
  "corporation",
  "gmbh",
  "group",
  "inc",
  "limited",
  "llc",
  "ltd",
  "plc",
  "sa",
  "spa",
  "srl",
]);

const organizationTerms =
  /\b(company|manufacturer|manufacturing|brand|corporation|business|industrial|engineering|technology|technologies|automation|electronics|equipment|pump|pumps|motor|motors|machinery|machine|valve|valves|hydraulic|instrument|instruments|sensor|sensors|group|gmbh|plc|inc)\b/i;
const rejectionTerms =
  /\b(airline|album|athlete|automobile|bank|chocolate|clothing|confectionery|console|financial|fintech|football|girl group|given name|jeweller|jewelry|music brand|newspaper|person|politician|restaurant|school|software company|song|sportswear|surname|television series|university|village)\b/i;

function normalize(value) {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();
}

function coreTokens(value) {
  const tokens = normalize(value).split(/\s+/).filter(Boolean);
  const filtered = tokens.filter((token) => !legalTerms.has(token));
  return filtered.length ? filtered : tokens;
}

function coreName(value) {
  return coreTokens(value).join(" ");
}

function exactBrandMatch(manufacturerName, candidate) {
  const manufacturer = normalize(manufacturerName);
  const core = coreName(manufacturerName);
  const labels = [
    candidate.label,
    ...(candidate.aliases ?? []),
    candidate.match?.text,
  ]
    .filter(Boolean)
    .map(normalize);

  return labels.some((label) => {
    const labelCore = coreName(label);
    return (
      label === manufacturer ||
      labelCore === core ||
      (core.length >= 7 &&
        (label.startsWith(`${core} `) || core.startsWith(`${labelCore} `)))
    );
  });
}

async function fetchJson(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "user-agent": userAgent,
          accept: "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 400));
      }
    }
  }
  throw lastError;
}

function commonsFilesUrl(fileNames) {
  const params = new URLSearchParams({
    action: "query",
    titles: fileNames.map((fileName) => `File:${fileName}`).join("|"),
    prop: "imageinfo",
    iiprop: "url|mime|size|extmetadata",
    format: "json",
    origin: "*",
  });
  return `https://commons.wikimedia.org/w/api.php?${params}`;
}

function titleCase(value) {
  return normalize(value)
    .split(" ")
    .map((token) =>
      token.length <= 3
        ? token.toUpperCase()
        : `${token[0].toUpperCase()}${token.slice(1)}`,
    )
    .join(" ");
}

function sparqlString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function sparqlQueryUrl(manufacturers) {
  const values = [
    ...new Set(
      manufacturers.flatMap((manufacturer) => [
        manufacturer.name,
        titleCase(manufacturer.name),
        coreName(manufacturer.name),
        titleCase(coreName(manufacturer.name)),
      ]),
    ),
  ]
    .filter(Boolean)
    .map((value) => `"${sparqlString(value)}"@en`)
    .join(" ");
  const query = `
SELECT DISTINCT ?item ?matched ?description ?logo ?article ?inception WHERE {
  VALUES ?matched { ${values} }
  { ?item rdfs:label ?matched. }
  UNION
  { ?item skos:altLabel ?matched. }
  ?item wdt:P154 ?logo.
  OPTIONAL { ?item wdt:P571 ?inception. }
  OPTIONAL {
    ?item schema:description ?description.
    FILTER(LANG(?description) = "en")
  }
  OPTIONAL {
    ?article schema:about ?item;
             schema:isPartOf <https://en.wikipedia.org/>.
  }
}`;
  const params = new URLSearchParams({
    query,
    format: "json",
  });
  return `https://query.wikidata.org/sparql?${params}`;
}

function fileNameFromCommonsUrl(value) {
  const parsed = new URL(value);
  return decodeURIComponent(parsed.pathname.split("/").at(-1));
}

function fileKey(value) {
  return value.replace(/_/g, " ").normalize("NFC").toLowerCase();
}

async function discoverWithSparql(manufacturers) {
  const chunkSize = 50;
  const rawCandidates = [];

  for (let index = 0; index < manufacturers.length; index += chunkSize) {
    const chunk = manufacturers.slice(index, index + chunkSize);
    const data = await fetchJson(sparqlQueryUrl(chunk), 5);
    for (const binding of data.results?.bindings ?? []) {
      rawCandidates.push({
        wikidataId: binding.item?.value?.split("/").at(-1),
        wikidataLabel: binding.matched?.value,
        wikidataDescription: binding.description?.value ?? "",
        wikipediaUrl: binding.article?.value,
        originalFile: binding.logo?.value,
        foundingYear: binding.inception?.value?.slice(0, 4),
      });
    }
    await new Promise((resolve) => setTimeout(resolve, 350));
  }

  const candidateFiles = [
    ...new Set(
      rawCandidates
        .map((candidate) => candidate.originalFile)
        .filter(Boolean)
        .map(fileNameFromCommonsUrl),
    ),
  ];
  const fileMetadata = new Map();
  for (let index = 0; index < candidateFiles.length; index += chunkSize) {
    const fileNames = candidateFiles.slice(index, index + chunkSize);
    const data = await fetchJson(commonsFilesUrl(fileNames), 5);
    for (const page of Object.values(data.query?.pages ?? {})) {
      const image = page.imageinfo?.[0];
      if (image?.url) {
        fileMetadata.set(fileKey(fileNameFromCommonsUrl(image.url)), {
          image,
          metadata: image.extmetadata ?? {},
        });
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 350));
  }

  return manufacturers.map((manufacturer) => {
    const candidates = rawCandidates.filter(
      (candidate) =>
        exactBrandMatch(manufacturer.name, {
          label: candidate.wikidataLabel,
        }) &&
        organizationTerms.test(candidate.wikidataDescription) &&
        !rejectionTerms.test(candidate.wikidataDescription) &&
        (!manufacturer.foundingYear ||
          !candidate.foundingYear ||
          Math.abs(
            Number(manufacturer.foundingYear) - Number(candidate.foundingYear),
          ) <= 15),
    );
    const uniqueCandidates = [
      ...new Map(
        candidates.map((candidate) => [candidate.wikidataId, candidate]),
      ).values(),
    ];

    if (!uniqueCandidates.length) {
      return { manufacturer, status: "no-verified-entity" };
    }
    if (uniqueCandidates.length > 1) {
      return {
        manufacturer,
        status: "ambiguous-entity",
        candidates: uniqueCandidates,
      };
    }

    const candidate = uniqueCandidates[0];
    const fileName = fileNameFromCommonsUrl(candidate.originalFile);
    const file = fileMetadata.get(fileKey(fileName));
    const image = file?.image;
    const metadata = file?.metadata ?? {};
    const license = metadata.LicenseShortName?.value;

    if (
      !license ||
      !image?.descriptionurl ||
      !image?.url ||
      !image?.mime?.startsWith("image/")
    ) {
      return {
        manufacturer,
        status: "incomplete-commons-metadata",
        candidate,
        fileName,
      };
    }

    return {
      manufacturer,
      status: "verified-candidate",
      ...candidate,
      fileName,
      sourcePage: image.descriptionurl,
      originalFile: image.url,
      mime: image.mime,
      width: image.width,
      height: image.height,
      license: stripHtml(license),
      licenseUrl: metadata.LicenseUrl?.value,
      attribution: stripHtml(
        metadata.Artist?.value ||
          metadata.Credit?.value ||
          metadata.Attribution?.value ||
          candidate.wikidataLabel,
      ),
    };
  });
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

async function main() {
  const [manufacturerSource, registrySource] = await Promise.all([
    fs.readFile(manufacturerPath, "utf8"),
    fs.readFile(registryPath, "utf8"),
  ]);
  const manufacturers = JSON.parse(manufacturerSource).manufacturers;
  const registered = new Set(
    [...registrySource.matchAll(/\n\s+slug: "([^"]+)"/g)].map(
      (entry) => entry[1],
    ),
  );
  const missing = manufacturers.filter(
    (manufacturer) => !registered.has(manufacturer.slug),
  );
  const batch = missing.slice(batchOffset, batchOffset + batchSize);
  const discovered = await discoverWithSparql(batch);

  const summary = discovered.reduce((counts, result) => {
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
    verified: discovered.filter(
      (result) => result.status === "verified-candidate",
    ),
    unresolved: discovered.filter(
      (result) => result.status !== "verified-candidate",
    ),
  };

  await fs.mkdir(outputDir, { recursive: true });
  const outputPath = path.join(
    outputDir,
    `commons-batch-${String(batchOffset).padStart(4, "0")}-${String(
      batch.length,
    ).padStart(4, "0")}.json`,
  );
  await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(
    `${JSON.stringify({ outputPath, ...summary }, null, 2)}\n`,
  );
}

await main();
