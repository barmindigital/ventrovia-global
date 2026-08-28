import fs from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const separator = args.indexOf("--");
if (separator < 1 || separator === args.length - 1) {
  throw new Error(
    "Usage: node scripts/import-reviewed-official-site-logos.mjs review.json -- slug [...]",
  );
}

const ROOT = process.cwd();
const reviewPath = path.resolve(args[0]);
const selectedSlugs = [...new Set(args.slice(separator + 1))];
const registryPath = path.join(ROOT, "app/lib/brand-logos.ts");
const logoDirectory = path.join(ROOT, "public/images/brand-logos");
const profilesPath = path.join(
  ROOT,
  "data/brand-knowledge-international/profiles.json",
);

function quote(value) {
  return JSON.stringify(value);
}

function hostnameMatches(hostname, domain) {
  const normalizedHost = hostname.toLowerCase().replace(/^www\./u, "");
  const normalizedDomain = domain.toLowerCase().replace(/^www\./u, "");
  return (
    normalizedHost === normalizedDomain ||
    normalizedHost.endsWith(`.${normalizedDomain}`)
  );
}

function renderEntry(profile, candidate, extension) {
  return [
    "  {",
    `    slug: ${quote(profile.manufacturerId)},`,
    `    name: ${quote(profile.displayName)},`,
    `    src: ${quote(`/images/brand-logos/${profile.manufacturerId}.${extension}`)},`,
    `    sourcePage: ${quote(candidate.sourcePage)},`,
    `    originalFile: ${quote(candidate.originalFile)},`,
    '    license: "Official manufacturer website asset — identification use; rights retained by brand owner",',
    `    licenseUrl: ${quote(candidate.sourcePage)},`,
    `    attribution: ${quote(`${profile.displayName}; asset served by the official manufacturer website`)},`,
    "  },",
  ].join("\n");
}

const [review, profilesPayload, registrySource] = await Promise.all([
  fs.readFile(reviewPath, "utf8").then(JSON.parse),
  fs.readFile(profilesPath, "utf8").then(JSON.parse),
  fs.readFile(registryPath, "utf8"),
]);
const candidates = new Map(review.downloaded.map((item) => [item.slug, item]));
const profiles = new Map(
  profilesPayload.profiles.map((profile) => [profile.manufacturerId, profile]),
);
const existingSlugs = new Set(
  [...registrySource.matchAll(/\n\s+slug: "([^"]+)"/gu)].map(
    (match) => match[1],
  ),
);

const entries = [];
const copies = [];
for (const slug of selectedSlugs) {
  if (existingSlugs.has(slug)) throw new Error(`Logo already registered: ${slug}`);
  const profile = profiles.get(slug);
  if (!profile) throw new Error(`SAFE profile not found: ${slug}`);
  const candidate = candidates.get(slug);
  if (!candidate) throw new Error(`Reviewed candidate not found: ${slug}`);
  const sourceHostname = new URL(candidate.sourcePage).hostname;
  const officialDomains = profile.officialDomains ?? [];
  if (!officialDomains.some((domain) => hostnameMatches(sourceHostname, domain))) {
    throw new Error(
      `Official source mismatch for ${slug}: ${sourceHostname} is not in ${officialDomains.join(", ")}`,
    );
  }
  const extension = path.extname(candidate.assetPath).slice(1).toLowerCase();
  if (!["gif", "jpg", "png", "svg", "webp"].includes(extension)) {
    throw new Error(`Unsupported reviewed asset extension for ${slug}: ${extension}`);
  }
  const destination = path.join(logoDirectory, `${slug}.${extension}`);
  try {
    await fs.access(destination);
    throw new Error(`Destination already exists: ${destination}`);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  copies.push({ source: candidate.assetPath, destination });
  entries.push(renderEntry(profile, candidate, extension));
}

const marker = "\n];\n\nexport const brandLogoRegistry";
if (!registrySource.includes(marker)) {
  throw new Error("Could not find brand logo registry insertion point");
}
await fs.mkdir(logoDirectory, { recursive: true });
for (const copy of copies) await fs.copyFile(copy.source, copy.destination);
await fs.writeFile(
  registryPath,
  registrySource.replace(marker, `\n${entries.join("\n")}${marker}`),
);
process.stdout.write(
  `${JSON.stringify({ imported: entries.length, slugs: selectedSlugs }, null, 2)}\n`,
);
