import { mkdir, readFile, writeFile } from "node:fs/promises";
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

const [base, wave4, wave5, wave6, wave7, wave8, wave9, wave10] = await Promise.all([
  json("data/brand-sources/curated-brand-facts.json"),
  json("data/brand-sources/curated-brand-facts-wave-4.json"),
  json("data/brand-sources/curated-brand-facts-wave-5.json"),
  json("data/brand-sources/curated-brand-facts-wave-6.json"),
  json("data/brand-sources/curated-brand-facts-wave-7.json"),
  json("data/brand-sources/curated-brand-facts-wave-8.json"),
  json("data/brand-sources/curated-brand-facts-wave-9.json"),
  json("data/brand-sources/curated-brand-facts-wave-10.json"),
]);

const profiles = [...base.profiles, ...wave4.profiles, ...wave5.profiles, ...wave6.profiles, ...wave7.profiles, ...wave8.profiles, ...wave9.profiles, ...wave10.profiles]
  .map(toEnglishBrandProfile)
  .sort((left, right) =>
    left.manufacturerId.localeCompare(right.manufacturerId, "en"),
  );
const blockedIdentities = [
  ...base.blockedIdentities,
  ...wave4.blockedIdentities,
  ...wave5.blockedIdentities,
  ...wave6.blockedIdentities,
  ...wave7.blockedIdentities,
  ...wave8.blockedIdentities,
  ...wave9.blockedIdentities,
  ...wave10.blockedIdentities,
]
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
