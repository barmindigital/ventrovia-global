import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = process.cwd();
const catalogPath = path.join(projectRoot, "app/generated/full-catalog.ts");
const registryPath = path.join(projectRoot, "app/lib/brand-logos.ts");
const outputDir = path.join(projectRoot, ".logo-work");

const packageDirectory = process.argv[2];
const batchOffset = Number(process.argv[3] ?? 0);
const batchSize = Number(process.argv[4] ?? 1000);

if (!packageDirectory) {
  throw new Error(
    "Usage: node scripts/discover-simple-icons.mjs package-directory [offset] [size]",
  );
}

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

function normalize(value) {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();
}

function coreName(value) {
  const tokens = normalize(value).split(/\s+/).filter(Boolean);
  const filtered = tokens.filter((token) => !legalTerms.has(token));
  return (filtered.length ? filtered : tokens).join(" ");
}

function exactMatch(manufacturerName, iconTitle) {
  const manufacturer = normalize(manufacturerName);
  const icon = normalize(iconTitle);
  return manufacturer === icon || coreName(manufacturer) === coreName(icon);
}

function parseArray(source, exportName) {
  const expression = new RegExp(
    `export const ${exportName}[^=]*=\\s*(\\[[\\s\\S]*?\\]);`,
  );
  const match = source.match(expression);
  if (!match) {
    throw new Error(`Could not parse ${exportName}`);
  }
  return JSON.parse(match[1]);
}

const [catalogSource, registrySource] = await Promise.all([
  fs.readFile(catalogPath, "utf8"),
  fs.readFile(registryPath, "utf8"),
]);
const manufacturers = parseArray(catalogSource, "fullManufacturers");
const registered = new Set(
  [...registrySource.matchAll(/\n\s+slug: "([^"]+)"/g)].map(
    (match) => match[1],
  ),
);
const missing = manufacturers.filter(
  (manufacturer) => !registered.has(manufacturer.slug),
);
const batch = missing.slice(batchOffset, batchOffset + batchSize);

const modulePath = path.join(packageDirectory, "index.mjs");
const iconModule = await import(pathToFileURL(modulePath).href);
const icons = Object.values(iconModule).filter(
  (icon) =>
    icon &&
    typeof icon === "object" &&
    typeof icon.title === "string" &&
    typeof icon.slug === "string" &&
    typeof icon.path === "string",
);

const candidates = [];
const ambiguous = [];
for (const manufacturer of batch) {
  const matches = icons.filter((icon) =>
    exactMatch(manufacturer.name, icon.title),
  );
  if (matches.length === 1) {
    const [icon] = matches;
    candidates.push({
      manufacturer,
      icon: {
        title: icon.title,
        slug: icon.slug,
        hex: icon.hex,
        source: icon.source,
        path: icon.path,
      },
      sourcePackage: "simple-icons",
      packageVersion: "16.27.1",
      license: "CC0-1.0",
      licenseUrl:
        "https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md",
    });
  } else if (matches.length > 1) {
    ambiguous.push({
      manufacturer,
      matches: matches.map((icon) => ({
        title: icon.title,
        slug: icon.slug,
        source: icon.source,
      })),
    });
  }
}

await fs.mkdir(outputDir, { recursive: true });
const reportPath = path.join(
  outputDir,
  `simple-icons-batch-${String(batchOffset).padStart(4, "0")}-${String(batch.length).padStart(4, "0")}.json`,
);
await fs.writeFile(
  reportPath,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      batchOffset,
      requestedBatchSize: batchSize,
      checked: batch.length,
      remainingBeforeBatch: missing.length,
      candidates,
      ambiguous,
    },
    null,
    2,
  )}\n`,
);

process.stdout.write(
  `${JSON.stringify(
    {
      reportPath: path.relative(projectRoot, reportPath),
      checked: batch.length,
      candidates: candidates.length,
      ambiguous: ambiguous.length,
      remainingBeforeBatch: missing.length,
    },
    null,
    2,
  )}\n`,
);
