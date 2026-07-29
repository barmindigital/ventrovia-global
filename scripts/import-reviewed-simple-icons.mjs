import fs from "node:fs/promises";
import path from "node:path";

const separator = process.argv.indexOf("--");
if (separator < 4 || separator === process.argv.length - 1) {
  throw new Error(
    "Usage: node scripts/import-reviewed-simple-icons.mjs package-directory report.json [...] -- slug [...]",
  );
}

const packageDirectory = process.argv[2];
const reportPaths = process.argv.slice(3, separator);
const selectedSlugs = [...new Set(process.argv.slice(separator + 1))];
const registryPath = path.join(process.cwd(), "app/lib/brand-logos.ts");
const logoDirectory = path.join(
  process.cwd(),
  "public/images/brand-logos",
);

function quote(value) {
  return JSON.stringify(value);
}

function renderEntry(candidate) {
  const packageVersion = candidate.packageVersion;
  const packageAsset = `https://cdn.jsdelivr.net/npm/simple-icons@${packageVersion}/icons/${candidate.icon.slug}.svg`;
  return [
    "  {",
    `    slug: ${quote(candidate.manufacturer.slug)},`,
    `    name: ${quote(candidate.icon.title)},`,
    `    src: ${quote(`/images/brand-logos/${candidate.manufacturer.slug}.svg`)},`,
    "    sourcePage:",
    `      ${quote(candidate.icon.source)},`,
    "    originalFile:",
    `      ${quote(packageAsset)},`,
    `    license: ${quote("CC0-1.0 (Simple Icons)")},`,
    "    licenseUrl:",
    `      ${quote(candidate.licenseUrl)},`,
    `    attribution: ${quote(`Simple Icons contributors; source artwork: ${candidate.icon.title}`)},`,
    "  },",
  ].join("\n");
}

const reports = await Promise.all(
  reportPaths.map(async (reportPath) =>
    JSON.parse(await fs.readFile(reportPath, "utf8")),
  ),
);
const candidates = new Map();
for (const report of reports) {
  for (const candidate of report.candidates ?? []) {
    candidates.set(candidate.manufacturer.slug, candidate);
  }
}

const registrySource = await fs.readFile(registryPath, "utf8");
const existingSlugs = new Set(
  [...registrySource.matchAll(/\n\s+slug: "([^"]+)"/g)].map(
    (match) => match[1],
  ),
);

await fs.mkdir(logoDirectory, { recursive: true });
const entries = [];
for (const slug of selectedSlugs) {
  if (existingSlugs.has(slug)) {
    throw new Error(`Logo already registered: ${slug}`);
  }
  const candidate = candidates.get(slug);
  if (!candidate) {
    throw new Error(`Candidate not found: ${slug}`);
  }
  const packageAssetPath = path.join(
    packageDirectory,
    "icons",
    `${candidate.icon.slug}.svg`,
  );
  const destinationPath = path.join(logoDirectory, `${slug}.svg`);
  await fs.copyFile(packageAssetPath, destinationPath);
  entries.push(renderEntry(candidate));
}

const marker = "\n];\n\nconst brandLogoMap";
if (!registrySource.includes(marker)) {
  throw new Error("Could not find brand logo registry insertion point");
}
const updatedSource = registrySource.replace(
  marker,
  `\n${entries.join("\n")}${marker}`,
);
await fs.writeFile(registryPath, updatedSource);

process.stdout.write(
  `${JSON.stringify({ imported: entries.length, slugs: selectedSlugs }, null, 2)}\n`,
);
