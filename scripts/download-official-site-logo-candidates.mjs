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

const extensionByMime = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/webp": "webp",
};

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

async function download(url) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "user-agent": userAgent,
      accept: "image/svg+xml,image/png,image/webp,image/jpeg,image/gif",
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.length < 100) throw new Error(`Asset too small: ${bytes.length} bytes`);
  const contentType = (response.headers.get("content-type") ?? "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  const isSvg = new TextDecoder().decode(bytes.slice(0, 1000)).includes("<svg");
  const mime = isSvg ? "image/svg+xml" : contentType;
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
