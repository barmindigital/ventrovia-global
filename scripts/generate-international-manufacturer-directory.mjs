import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(ROOT, "app/generated/full-catalog.ts");
const OUTPUT = path.join(ROOT, "app/generated/manufacturer-directory.ts");

const source = await readFile(SOURCE, "utf8");
const match = source.match(/export const fullManufacturers: Manufacturer\[\] = (\[[\s\S]*\]);\s*$/u);
if (!match) throw new Error("Could not read the archived manufacturer snapshot");
const manufacturers = JSON.parse(match[1]);
const publicIdentities = manufacturers.map(({ slug, name, aliases = [] }) => ({
  slug,
  name,
  aliases: aliases.filter((alias) => !/[А-Яа-яЁё]/u.test(alias)),
}));
const output = `export type InternationalManufacturerIdentity = {\n  slug: string;\n  name: string;\n  aliases: string[];\n};\n\nexport const INTERNATIONAL_MANUFACTURER_COUNT = ${publicIdentities.length};\n\nexport const internationalManufacturers: InternationalManufacturerIdentity[] = ${JSON.stringify(publicIdentities)};\n`;
await writeFile(OUTPUT, output);
console.log(JSON.stringify({ manufacturers: publicIdentities.length, output: path.relative(ROOT, OUTPUT) }));
