import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { toEnglishBrandProfile } from "../app/lib/brand-knowledge-en.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(
  ROOT,
  "data/brand-knowledge-international/profiles.json",
);
const check = process.argv.includes("--check");

async function json(relativePath) {
  return JSON.parse(await readFile(path.join(ROOT, relativePath), "utf8"));
}

const SOURCE_DIRECTORY = path.join(ROOT, "data/brand-sources");
const sourceFiles = (await readdir(SOURCE_DIRECTORY))
  .filter((file) => /^curated-brand-facts(?:-wave-\d+)?\.json$/u.test(file))
  .sort((left, right) => {
    if (left === "curated-brand-facts.json") return -1;
    if (right === "curated-brand-facts.json") return 1;
    return Number(left.match(/wave-(\d+)/u)?.[1]) - Number(right.match(/wave-(\d+)/u)?.[1]);
  });
const [sourceBatches, identityIndex] = await Promise.all([
  Promise.all(
  sourceFiles.map((file) => json(`data/brand-sources/${file}`)),
  ),
  json("data/manufacturers/identities.json"),
]);

const rawProfiles = sourceBatches.flatMap((batch) => batch.profiles);
const rawBlockedIdentities = sourceBatches.flatMap((batch) => batch.blockedIdentities);
const duplicateValues = (values) => [
  ...new Set(values.filter((value, index) => values.indexOf(value) !== index)),
];
const duplicateProfiles = duplicateValues(rawProfiles.map((profile) => profile.manufacturerId));
const duplicateBlocked = duplicateValues(
  rawBlockedIdentities.map((blockedIdentity) => blockedIdentity.manufacturerId),
);
const profileIds = new Set(rawProfiles.map((profile) => profile.manufacturerId));
const blockedIds = new Set(rawBlockedIdentities.map((blockedIdentity) => blockedIdentity.manufacturerId));
const conflictingStatuses = [...profileIds].filter((manufacturerId) => blockedIds.has(manufacturerId));
const knownManufacturerIds = new Set(
  identityIndex.manufacturers.map((manufacturer) => manufacturer.slug),
);
const unknownManufacturerIds = [...profileIds, ...blockedIds].filter(
  (manufacturerId) => !knownManufacturerIds.has(manufacturerId),
);

if (duplicateProfiles.length || duplicateBlocked.length || conflictingStatuses.length || unknownManufacturerIds.length) {
  throw new Error(
    `Brand source integrity failure: ${JSON.stringify({ duplicateProfiles, duplicateBlocked, conflictingStatuses, unknownManufacturerIds })}`,
  );
}

const profiles = rawProfiles
  .map(toEnglishBrandProfile)
  .sort((left, right) =>
    left.manufacturerId.localeCompare(right.manufacturerId, "en"),
  );
const blockedIdentities = rawBlockedIdentities
  .sort((left, right) =>
    left.manufacturerId.localeCompare(right.manufacturerId, "en"),
  );
const sourceRecords = profiles.reduce(
  (total, profile) => total + profile.sources.length,
  0,
);

const payload = {
  version: "ventrovia-brand-knowledge-en-v1",
  generatedAt: "2026-08-19T00:00:00.000Z",
  sourceLanguage: "structured-source-facts",
  publicLanguage: "en",
  market: "Worldwide",
  profiles,
  blockedIdentities,
  metrics: {
    enContentReady: profiles.length,
    enSeoReady: profiles.length,
    sourceRecords,
    brandReview: blockedIdentities.length,
  },
};
const output = `${JSON.stringify(payload, null, 2)}\n`;

if (check) {
  const current = await readFile(OUTPUT, "utf8").catch(() => "");
  if (current !== output) {
    throw new Error(
      "International Brand Knowledge is stale. Run pnpm brands:international.",
    );
  }
} else {
  await mkdir(path.dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, output);
}

console.log(
  JSON.stringify({
    status: check ? "verified" : "generated",
    profiles: profiles.length,
    blockedIdentities: blockedIdentities.length,
    sourceRecords,
    output: path.relative(ROOT, OUTPUT),
  }),
);
