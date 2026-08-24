import { createHash } from "node:crypto";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(ROOT, "brand-master");
const destinationArgument = process.argv.slice(2).find((value) => value !== "--");
const destinationParent = path.resolve(destinationArgument ?? path.join(process.cwd(), "brand-master-package"));
const packageName = "industrial-brand-master-2026-08-24";
const packageRoot = path.join(destinationParent, packageName);
const archivePath = path.join(destinationParent, `${packageName}.tar.gz`);
const manifest = JSON.parse(await readFile(path.join(sourceRoot, "BRAND_MASTER_MANIFEST.json"), "utf8"));

await rm(packageRoot, { recursive: true, force: true });
await mkdir(path.join(packageRoot, "data"), { recursive: true });
await mkdir(path.join(packageRoot, "reports"), { recursive: true });
await mkdir(path.join(packageRoot, "docs"), { recursive: true });
await mkdir(path.join(packageRoot, "brand-assets/logos"), { recursive: true });
await mkdir(path.join(packageRoot, "tests"), { recursive: true });

await cp(path.join(sourceRoot, "data"), path.join(packageRoot, "data"), { recursive: true });
await cp(path.join(sourceRoot, "reports"), path.join(packageRoot, "reports"), { recursive: true });
await cp(path.join(sourceRoot, "docs"), path.join(packageRoot, "docs"), { recursive: true });
await cp(path.join(sourceRoot, "README.md"), path.join(packageRoot, "README.md"));
await cp(path.join(sourceRoot, "BRAND_MASTER_MANIFEST.json"), path.join(packageRoot, "BRAND_MASTER_MANIFEST.json"));
await cp(path.join(ROOT, "scripts/test-brand-master-portability.mjs"), path.join(packageRoot, "tests/portable-test.mjs"));

for (const file of manifest.files.filter((item) => item.role === "BRAND_LOGO")) {
  const source = path.join(ROOT, "public/images/brand-logos", path.basename(file.path));
  const destination = path.join(packageRoot, file.path);
  await cp(source, destination);
}

for (const file of manifest.files) {
  const value = await readFile(path.join(packageRoot, file.path));
  const checksum = createHash("sha256").update(value).digest("hex");
  if (value.byteLength !== file.size || checksum !== file.sha256) {
    throw new Error(`Manifest validation failed for ${file.path}`);
  }
}

const test = spawnSync(process.execPath, [path.join(packageRoot, "tests/portable-test.mjs"), packageRoot], { encoding: "utf8" });
if (test.status !== 0) throw new Error(`Portable test failed:\n${test.stdout}\n${test.stderr}`);

await rm(archivePath, { force: true });
const archive = spawnSync("tar", ["-czf", archivePath, "-C", destinationParent, packageName], { encoding: "utf8" });
if (archive.status !== 0) throw new Error(`Archive creation failed: ${archive.stderr}`);
const bytes = await readFile(archivePath);
const checksum = createHash("sha256").update(bytes).digest("hex");
await writeFile(`${archivePath}.sha256`, `${checksum}  ${path.basename(archivePath)}\n`);

console.log(JSON.stringify({
  status: "PASS",
  packageRoot,
  archivePath,
  archiveSize: bytes.byteLength,
  archiveSha256: checksum,
  portabilityTest: JSON.parse(test.stdout),
}, null, 2));
