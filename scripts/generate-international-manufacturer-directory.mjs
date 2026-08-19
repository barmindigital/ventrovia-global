import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(ROOT, "data/manufacturers/identities.json");
const OUTPUT = path.join(ROOT, "app/generated/manufacturer-directory.ts");
const check = process.argv.includes("--check");

const identityIndex = JSON.parse(await readFile(SOURCE, "utf8"));
const manufacturers = identityIndex.manufacturers;
if (identityIndex.manufacturerCount !== manufacturers.length) {
  throw new Error("Manufacturer identity index count does not match its records");
}
const publicIdentities = manufacturers.map(({ slug, name, aliases = [] }) => ({
  slug,
  name,
  aliases: aliases.filter((alias) => !/[А-Яа-яЁё]/u.test(alias)),
}));
const output = `export type InternationalManufacturerIdentity = {\n  slug: string;\n  name: string;\n  aliases: string[];\n};\n\nexport const INTERNATIONAL_MANUFACTURER_COUNT = ${publicIdentities.length};\n\nexport const internationalManufacturers: InternationalManufacturerIdentity[] = ${JSON.stringify(publicIdentities)};\n`;
if (check) {
  const current = await readFile(OUTPUT, "utf8").catch(() => "");
  if (current !== output) {
    throw new Error("Manufacturer directory is stale. Run pnpm brands:directory.");
  }
} else {
  await writeFile(OUTPUT, output);
}
console.log(JSON.stringify({ status: check ? "verified" : "generated", manufacturers: publicIdentities.length, output: path.relative(ROOT, OUTPUT) }));
