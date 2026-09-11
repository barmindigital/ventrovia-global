import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const scanRoots = ["app", "public/brand", "public/favicon.svg"];
const textExtensions = new Set([".css", ".js", ".mjs", ".py", ".svg", ".ts", ".tsx"]);
const forbidden = ["#173f5a", "#123449", "#272326", "#45414a", "#f4f0e8", "#5d77a5", "#b9c8d5"];
const findings = [];

async function collect(relativePath) {
  const absolutePath = path.join(root, relativePath);
  const entries = await readdir(absolutePath, { withFileTypes: true }).catch(() => null);

  if (!entries) {
    const extension = path.extname(relativePath).toLowerCase();
    if (textExtensions.has(extension)) {
      const body = (await readFile(absolutePath, "utf8")).toLowerCase();
      for (const value of forbidden) {
        if (body.includes(value)) findings.push({ path: relativePath, value });
      }
    }
    return;
  }

  for (const entry of entries) {
    if (entry.name === "images") continue;
    await collect(path.join(relativePath, entry.name));
  }
}

for (const scanRoot of scanRoots) await collect(scanRoot);

if (findings.length > 0) {
  console.error(JSON.stringify({ status: "FAIL", findings }, null, 2));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      status: "PASS",
      forbiddenLegacyBlueValues: forbidden,
      findings: 0,
      note: "Third-party manufacturer logos are excluded because their official brand colors must remain unchanged.",
    },
    null,
    2,
  ),
);
