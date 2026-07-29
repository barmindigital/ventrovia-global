import fs from "node:fs/promises";
import path from "node:path";

const separator = process.argv.indexOf("--");
if (separator < 3 || separator === process.argv.length - 1) {
  throw new Error(
    "Usage: node scripts/download-logo-candidates.mjs report.json [...] -- slug [...]",
  );
}

const reportPaths = process.argv.slice(2, separator);
const selectedSlugs = [...new Set(process.argv.slice(separator + 1))];
const logoDirectory = path.join(
  process.cwd(),
  "public/images/brand-logos",
);
const userAgent =
  "IndustriaPostavokLogoAudit/1.0 (catalog quality and attribution audit)";

const extensionByMime = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/tiff": "tif",
  "image/webp": "webp",
};

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function thumbnailDownload(candidate) {
  try {
    const original = new URL(candidate.originalFile);
    const marker = "/wikipedia/commons/";
    if (!original.pathname.includes(marker)) return null;
    const fileName = original.pathname.split("/").at(-1);
    const rasterized = new Set([
      "image/gif",
      "image/svg+xml",
      "image/tiff",
    ]).has(candidate.mime);
    original.pathname = original.pathname.replace(
      marker,
      "/wikipedia/commons/thumb/",
    );
    original.pathname = `${original.pathname}/500px-${fileName}${
      rasterized ? ".png" : ""
    }`;
    return {
      url: original.toString(),
      mime: rasterized ? "image/png" : candidate.mime,
    };
  } catch {
    return null;
  }
}

async function download(candidate, attempts = 5) {
  let lastError;
  const downloadUrls = [
    { url: candidate.originalFile, mime: candidate.mime },
    thumbnailDownload(candidate),
    candidate.fileName
      ? {
          url: `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(candidate.fileName.replaceAll(" ", "_"))}`,
          mime: candidate.mime,
        }
      : null,
  ].filter(Boolean);
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const downloadTarget =
        downloadUrls[Math.min(attempt - 1, downloadUrls.length - 1)];
      const response = await fetch(downloadTarget.url, {
        headers: {
          "user-agent": userAgent,
          accept: downloadTarget.mime,
        },
      });
      if (!response.ok) {
        const retryAfter = Number(response.headers.get("retry-after"));
        const error = new Error(`${response.status} ${response.statusText}`);
        error.retryAfter = Number.isFinite(retryAfter) ? retryAfter : null;
        throw error;
      }
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.length < 100) {
        throw new Error(`Downloaded file is too small (${bytes.length} bytes)`);
      }
      if (
        downloadTarget.mime === "image/svg+xml" &&
        !new TextDecoder().decode(bytes.slice(0, 500)).includes("<svg")
      ) {
        throw new Error("Downloaded SVG does not contain an svg element");
      }
      return {
        bytes,
        mime:
          response.headers.get("content-type")?.split(";")[0] ||
          downloadTarget.mime,
      };
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        const retryDelay =
          attempt < downloadUrls.length
            ? 250
            : error.retryAfter != null
            ? Math.min(error.retryAfter * 1000, 15000)
            : attempt * 1500;
        await delay(retryDelay);
      }
    }
  }
  throw lastError;
}

const reports = await Promise.all(
  reportPaths.map(async (reportPath) =>
    JSON.parse(await fs.readFile(reportPath, "utf8")),
  ),
);
const candidates = new Map();
for (const report of reports) {
  for (const candidate of report.verified ?? []) {
    candidates.set(candidate.manufacturer.slug, candidate);
  }
}

await fs.mkdir(logoDirectory, { recursive: true });
const downloaded = [];
for (const slug of selectedSlugs) {
  const candidate = candidates.get(slug);
  if (!candidate) {
    throw new Error(`Verified candidate not found: ${slug}`);
  }
  const existingAsset = (
    await Promise.all(
      [...new Set(Object.values(extensionByMime))].map(async (extension) => {
        const assetPath = path.join(logoDirectory, `${slug}.${extension}`);
        try {
          await fs.access(assetPath);
          return assetPath;
        } catch {
          return null;
        }
      }),
    )
  ).find(Boolean);
  if (existingAsset) {
    downloaded.push({
      slug,
      status: "already-present",
      assetPath: existingAsset,
    });
    continue;
  }
  const result = await download(candidate);
  const extension = extensionByMime[result.mime];
  if (!extension) {
    throw new Error(`Unsupported downloaded MIME type for ${slug}: ${result.mime}`);
  }
  const assetPath = path.join(logoDirectory, `${slug}.${extension}`);
  await fs.writeFile(assetPath, result.bytes);
  downloaded.push({
    slug,
    status: "downloaded",
    assetPath,
    bytes: result.bytes.length,
    mime: result.mime,
  });
  await delay(250);
}

process.stdout.write(
  `${JSON.stringify(
    {
      processed: downloaded.length,
      downloaded: downloaded.filter((item) => item.status === "downloaded")
        .length,
      files: downloaded.map((item) => ({
        slug: item.slug,
        status: item.status,
        bytes: item.bytes,
      })),
    },
    null,
    2,
  )}\n`,
);
