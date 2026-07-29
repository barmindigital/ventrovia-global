import fs from "node:fs/promises";
import path from "node:path";

const separator = process.argv.indexOf("--");
if (separator < 3 || separator === process.argv.length - 1) {
  throw new Error(
    "Usage: node scripts/import-reviewed-brand-logos.mjs report.json [...] -- slug [...]",
  );
}

const reportPaths = process.argv.slice(2, separator);
const selectedSlugs = [...new Set(process.argv.slice(separator + 1))];
const registryPath = path.join(process.cwd(), "app/lib/brand-logos.ts");
const logoDirectory = path.join(
  process.cwd(),
  "public/images/brand-logos",
);

const extensionByMime = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/tiff": "tif",
  "image/webp": "webp",
};

function quote(value) {
  return JSON.stringify(value);
}

function normalizedLicense(value) {
  return value === "Public domain"
    ? "Public domain (Wikimedia Commons)"
    : value;
}

function normalizedAttribution(candidate) {
  const attribution = candidate.attribution?.trim() ?? "";
  if (!attribution || /^unknown author(?: unknown author)?$/i.test(attribution)) {
    return `Source artwork: ${candidate.wikidataLabel || candidate.manufacturer.name}`;
  }
  return attribution;
}

function renderEntry(candidate, extension) {
  const lines = [
    "  {",
    `    slug: ${quote(candidate.manufacturer.slug)},`,
    `    name: ${quote(candidate.wikidataLabel || candidate.manufacturer.name)},`,
    `    src: ${quote(`/images/brand-logos/${candidate.manufacturer.slug}.${extension}`)},`,
    "    sourcePage:",
    `      ${quote(candidate.sourcePage)},`,
    "    originalFile:",
    `      ${quote(candidate.originalFile)},`,
    `    license: ${quote(normalizedLicense(candidate.license))},`,
  ];
  if (candidate.licenseUrl) {
    lines.push(`    licenseUrl: ${quote(candidate.licenseUrl)},`);
  }
  lines.push(
    `    attribution: ${quote(normalizedAttribution(candidate))},`,
    "  },",
  );
  return lines.join("\n");
}

const reports = await Promise.all(
  reportPaths.map(async (reportPath) =>
    JSON.parse(await fs.readFile(reportPath, "utf8")),
  ),
);
const candidates = new Map();
for (const report of reports) {
  for (const candidate of report.verified ?? []) {
    candidates.set(candidate.manufacturer.slug, candidate);
  }
}

const registrySource = await fs.readFile(registryPath, "utf8");
const existingSlugs = new Set(
  [...registrySource.matchAll(/\n\s+slug: "([^"]+)"/g)].map(
    (match) => match[1],
  ),
);

const entries = [];
for (const slug of selectedSlugs) {
  if (existingSlugs.has(slug)) {
    throw new Error(`Logo already registered: ${slug}`);
  }
  const candidate = candidates.get(slug);
  if (!candidate) {
    throw new Error(`Verified candidate not found: ${slug}`);
  }
  const expectedExtension = extensionByMime[candidate.mime];
  const supportedExtensions = [
    expectedExtension,
    ...new Set(Object.values(extensionByMime)),
  ].filter(Boolean);
  let extension;
  for (const candidateExtension of supportedExtensions) {
    try {
      await fs.access(
        path.join(logoDirectory, `${slug}.${candidateExtension}`),
      );
      extension = candidateExtension;
      break;
    } catch {
      // Continue until a downloaded original or thumbnail is found.
    }
  }
  if (!extension) {
    throw new Error(`Downloaded asset not found for ${slug}`);
  }
  entries.push(renderEntry(candidate, extension));
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
