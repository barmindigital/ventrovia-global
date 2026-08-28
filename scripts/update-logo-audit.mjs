import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AUDIT_PATH = path.join(ROOT, "data/brand-operations/logo-audit.json");
const IDENTITIES_PATH = path.join(ROOT, "data/manufacturers/identities.json");
const CHECKED_AT = "2026-08-28";

function svgDimensions(bytes) {
  const sample = bytes.subarray(0, Math.min(bytes.length, 24000));
  const source =
    sample[0] === 0xff && sample[1] === 0xfe
      ? new TextDecoder("utf-16le").decode(sample)
      : sample[0] === 0xfe && sample[1] === 0xff
        ? new TextDecoder("utf-16be").decode(sample)
        : sample.toString("utf8");
  const width = Number(source.match(/\bwidth=["']([\d.]+)/iu)?.[1]);
  const height = Number(source.match(/\bheight=["']([\d.]+)/iu)?.[1]);
  if (width > 0 && height > 0) return { width, height };
  const viewBox = source.match(
    /\bviewBox=["'][\s]*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)[\s]*["']/iu,
  );
  if (viewBox) return { width: Number(viewBox[1]), height: Number(viewBox[2]) };
  throw new Error("SVG dimensions are missing");
}

function jpegDimensions(bytes) {
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    const length = bytes.readUInt16BE(offset + 2);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return {
        width: bytes.readUInt16BE(offset + 7),
        height: bytes.readUInt16BE(offset + 5),
      };
    }
    if (!Number.isFinite(length) || length < 2) break;
    offset += length + 2;
  }
  throw new Error("JPEG dimensions are missing");
}

function webpDimensions(bytes) {
  const kind = bytes.toString("ascii", 12, 16);
  if (kind === "VP8X") {
    return {
      width: bytes.readUIntLE(24, 3) + 1,
      height: bytes.readUIntLE(27, 3) + 1,
    };
  }
  if (kind === "VP8 ") {
    const marker = bytes.indexOf(Buffer.from([0x9d, 0x01, 0x2a]), 20);
    if (marker >= 0) {
      return {
        width: bytes.readUInt16LE(marker + 3) & 0x3fff,
        height: bytes.readUInt16LE(marker + 5) & 0x3fff,
      };
    }
  }
  if (kind === "VP8L") {
    const bits = bytes.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }
  throw new Error("WEBP dimensions are missing");
}

function dimensions(bytes, extension) {
  if (extension === "svg") return svgDimensions(bytes);
  if (extension === "png") {
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  if (extension === "gif") {
    return { width: bytes.readUInt16LE(6), height: bytes.readUInt16LE(8) };
  }
  if (extension === "jpg" || extension === "jpeg") return jpegDimensions(bytes);
  if (extension === "webp") return webpDimensions(bytes);
  throw new Error(`Unsupported logo format: ${extension}`);
}

const [{ brandLogoRegistry }, audit, identities] = await Promise.all([
  import(pathToFileURL(path.join(ROOT, "app/lib/brand-logos.ts"))),
  fs.readFile(AUDIT_PATH, "utf8").then(JSON.parse),
  fs.readFile(IDENTITIES_PATH, "utf8").then(JSON.parse),
]);
const knownIds = new Set(identities.manufacturers.map((item) => item.slug));
const auditById = new Map(audit.map((item) => [item.manufacturerId, item]));
const output = [];
const addedIds = [];
const refreshedIds = [];

for (const logo of brandLogoRegistry) {
  if (!knownIds.has(logo.slug)) throw new Error(`Unknown logo identity: ${logo.slug}`);
  const assetPath = path.join(ROOT, "public", logo.src.replace(/^\//u, ""));
  const bytes = await fs.readFile(assetPath);
  const extension = path.extname(assetPath).slice(1).toLowerCase();
  const size = dimensions(bytes, extension);
  const checksum = crypto.createHash("sha256").update(bytes).digest("hex");
  const previous = auditById.get(logo.slug);
  const officialSourceCandidate = logo.license.startsWith("Official ");
  const changed =
    !previous ||
    previous.checksum !== checksum ||
    previous.localAsset !== logo.src ||
    previous.sourcePage !== logo.sourcePage ||
    previous.originalUrl !== logo.originalFile ||
    previous.license !== logo.license ||
    (previous.presentationBackground ?? "light") !==
      (logo.presentationBackground ?? "light");

  if (!previous) addedIds.push(logo.slug);
  else if (changed) refreshedIds.push(logo.slug);

  output.push({
    manufacturerId: logo.slug,
    sourcePage: logo.sourcePage,
    originalUrl: logo.originalFile,
    localAsset: logo.src,
    format: extension.toUpperCase(),
    width: size.width,
    height: size.height,
    checksum,
    checkedAt: changed ? CHECKED_AT : previous.checkedAt,
    scope: previous?.scope ?? "BRAND",
    variant: previous?.variant ?? "PRIMARY",
    license: logo.license,
    rightsStatus:
      previous?.rightsStatus ??
      (officialSourceCandidate ? "OFFICIAL_ASSET_PUBLIC" : "RIGHTS_CONFIRMED"),
    officialSourceCandidate,
    publicationStatus: previous?.publicationStatus ?? "PUBLISHABLE",
    ...(logo.presentationBackground
      ? { presentationBackground: logo.presentationBackground }
      : {}),
  });
}

await fs.writeFile(AUDIT_PATH, `${JSON.stringify(output, null, 2)}\n`);
process.stdout.write(
  `${JSON.stringify(
    {
      existing: audit.length,
      added: addedIds.length,
      refreshed: refreshedIds.length,
      total: output.length,
      addedIds,
      refreshedIds,
    },
    null,
    2,
  )}\n`,
);
