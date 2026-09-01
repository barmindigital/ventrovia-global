import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const separator = args.indexOf("--");
if (separator < 1 || separator === args.length - 1) {
  throw new Error(
    "Usage: node scripts/download-official-site-logo-candidates.mjs report.json -- slug[@candidate-number] [...]",
  );
}

const reportPath = path.resolve(args[0]);
const selectedCandidates = [
  ...new Map(
    args.slice(separator + 1).map((selection) => {
      const match = selection.match(/^(.*?)(?:@(\d+))?$/u);
      const slug = match?.[1];
      const candidateNumber = Number(match?.[2] ?? 1);
      if (!slug || !Number.isInteger(candidateNumber) || candidateNumber < 1) {
        throw new Error(`Invalid candidate selection: ${selection}`);
      }
      return [slug, { slug, candidateIndex: candidateNumber - 1 }];
    }),
  ).values(),
];
const outputDirectory = path.join(process.cwd(), ".logo-work/official-site/assets");
const userAgent =
  "VentroviaBrandAssetAudit/1.0 (official manufacturer logo provenance review)";
const downloadTimeoutMs = 15_000;

const extensionByMime = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/webp": "webp",
};

function sniffImageMime(bytes) {
  if (bytes.length < 12) return null;
  const hex = (start, end) => Buffer.from(bytes.slice(start, end)).toString("hex");
  if (hex(0, 8) === "89504e470d0a1a0a") return "image/png";
  if (hex(0, 2) === "ffd8") return "image/jpeg";
  if (hex(0, 3) === "474946") return "image/gif";
  if (hex(0, 4) === "52494646" && hex(8, 12) === "57454250") return "image/webp";
  return null;
}

function extensionFromUrl(value) {
  try {
    const extension = path.extname(new URL(value).pathname).slice(1).toLowerCase();
    return ["gif", "jpeg", "jpg", "png", "svg", "webp"].includes(extension)
      ? extension === "jpeg"
        ? "jpg"
        : extension
      : null;
  } catch {
    return null;
  }
}

// Discovery reaches these pages with a browser agent while this step used the
// audit agent, so assets that had just been found came back 403 - elsto and
// hontko among them. The audit agent is still tried first because it says who
// we are; the browser agent is the fallback the site already answered.
const browserAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

async function requestAsset(url, agent) {
  return fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(downloadTimeoutMs),
    headers: {
      "user-agent": agent,
      accept: "image/svg+xml,image/png,image/webp,image/jpeg,image/gif,*/*;q=0.8",
    },
  });
}

async function download(url) {
  let response = await requestAsset(url, userAgent);
  if (response.status === 403 || response.status === 401 || response.status === 406) {
    response = await requestAsset(url, browserAgent);
  }
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.length < 100) throw new Error(`Asset too small: ${bytes.length} bytes`);
  const contentType = (response.headers.get("content-type") ?? "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  const isSvg = new TextDecoder().decode(bytes.slice(0, 1000)).includes("<svg");
  // The URL extension lies often enough to matter: manufacturers serve PNG
  // bytes from a .jpg path, and a mislabelled file breaks the audit's
  // dimension read and ships a wrong content type. Trust the magic bytes.
  const sniffed = sniffImageMime(bytes);
  const mime = isSvg ? "image/svg+xml" : (sniffed ?? contentType);
  const extension = extensionByMime[mime] ?? extensionFromUrl(response.url);
  if (!extension) throw new Error(`Unsupported asset type: ${mime || "unknown"}`);
  return { bytes, extension, mime, finalUrl: response.url };
}

const report = JSON.parse(await fs.readFile(reportPath, "utf8"));
const records = new Map(
  report.records.map((record) => [record.brand.brandId, record]),
);
await fs.mkdir(outputDirectory, { recursive: true });

const downloaded = [];
const failures = [];
for (const { slug, candidateIndex } of selectedCandidates) {
  const record = records.get(slug);
  const candidate = record?.candidates?.[candidateIndex];
  if (!record || !candidate) {
    failures.push({
      slug,
      candidateNumber: candidateIndex + 1,
      error: "No candidate in report",
    });
    continue;
  }
  if (candidate.url.includes("#")) {
    failures.push({ slug, error: "Candidate is a page fragment, not an asset" });
    continue;
  }
  try {
    const asset = await download(candidate.url);
    const assetPath = path.join(outputDirectory, `${slug}.${asset.extension}`);
    await fs.writeFile(assetPath, asset.bytes);
    downloaded.push({
      slug,
      name: record.brand.displayName,
      sourcePage: record.finalUrl,
      originalFile: asset.finalUrl,
      discoveryType: candidate.sourceType,
      evidence: candidate.evidence,
      candidateNumber: candidateIndex + 1,
      mime: asset.mime,
      bytes: asset.bytes.length,
      sha256: crypto.createHash("sha256").update(asset.bytes).digest("hex"),
      assetPath,
      reviewStatus: "VISUAL_AND_IDENTITY_REVIEW_REQUIRED",
    });
  } catch (error) {
    failures.push({
      slug,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

const reviewPath = path.join(outputDirectory, "review.json");
await fs.writeFile(
  reviewPath,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      sourceReport: reportPath,
      downloaded,
      failures,
    },
    null,
    2,
  )}\n`,
);
process.stdout.write(
  `${JSON.stringify(
    {
      reviewPath,
      downloaded: downloaded.length,
      failed: failures.length,
      failures,
    },
    null,
    2,
  )}\n`,
);
