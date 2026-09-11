import assert from "node:assert/strict";
import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");
const CLIENT = path.join(DIST, "client");
const SERVER_ENTRY = path.join(DIST, "server/index.js");

async function files(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await files(absolute)));
    if (entry.isFile()) result.push(absolute);
  }
  return result;
}

const clientFiles = await files(CLIENT);
const clientJs = clientFiles.filter((file) => file.endsWith(".js"));
const totalClientJsBytes = (
  await Promise.all(clientJs.map(async (file) => (await stat(file)).size))
).reduce((sum, size) => sum + size, 0);
const clientSource = (
  await Promise.all(clientJs.map((file) => readFile(file, "utf8")))
).join("\n");
const serverSource = await readFile(SERVER_ENTRY, "utf8");

const forbiddenPublicMarkers = [
  "PRIVATE CATALOG RECORD",
  "Гидравлическое оборудование",
  "Индустрия Поставок",
  "industriapostavok.ru",
  "VENTORVIA",
  "catalog-runtime/chunks",
];
const clientMarkers = forbiddenPublicMarkers.filter((marker) => clientSource.includes(marker));
const serverMarkers = forbiddenPublicMarkers.filter((marker) => serverSource.includes(marker));
const publicCatalogAssets = await access(path.join(ROOT, "public/data/catalog")).then(() => true, () => false);
const publicProductImages = await access(path.join(ROOT, "public/images/products")).then(() => true, () => false);

assert.equal(publicCatalogAssets, false);
assert.equal(publicProductImages, false);
assert.deepEqual(clientMarkers, []);
assert.deepEqual(serverMarkers, []);
assert.ok(totalClientJsBytes < 1_050_000, "public JavaScript budget exceeded");

console.log(JSON.stringify({
  status: "healthy",
  mode: "BRAND_ONLY",
  totalClientJsBytes,
  clientJsFiles: clientJs.length,
  publicCatalogAssets,
  publicProductImages,
  clientMarkers,
  serverMarkers,
}, null, 2));
