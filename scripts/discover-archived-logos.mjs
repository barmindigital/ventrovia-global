// Logo discovery from archived copies of manufacturer sites.
//
// 145 manufacturers have no logo because their site refuses this client or
// does not answer at all. The Internet Archive holds their own pages as they
// were served, so the source stays the manufacturer - only the capture is
// older. Provenance records both the archive URL and the original address.
//
// The same structural signals as the live sweep are used, and nothing is
// published: the output is a review queue.
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, ".logo-work/archived");
const cliArguments = process.argv.slice(2).filter((a) => a !== "--");
const offset = Number(cliArguments[0] ?? 0);
const limit = Number(cliArguments[1] ?? 3000);
const targetsPath = cliArguments[2];
// The Archive asks for modest, identified traffic; requests stay serial.
const pauseMs = Number(cliArguments[3] ?? 1500);

const archiveAgent =
  "VentroviaBrandAssetAudit/1.0 (manufacturer logo provenance review; https://ventroviaglobal.com)";

const REJECT = /\b(favicon|apple-touch|loader|spinner|pixel|avatar|placeholder|banner|hero|cookie|flag|award)\b/iu;

function decodeEntities(value = "") {
  return value
    .replaceAll("&amp;", "&").replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The availability API returns only the closest capture, and that one is
// often the parked page or error that made the site unreachable in the first
// place. The CDX index lists every capture, so an older, healthy one can be
// tried when the closest yields nothing.
async function captureList(url) {
  const api = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}`
    + "&output=json&fl=timestamp,statuscode&filter=statuscode:200&collapse=timestamp:6&limit=-12";
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(api, {
        headers: { "user-agent": archiveAgent, accept: "application/json" },
        signal: AbortSignal.timeout(30000),
      });
      if (response.status === 429) { await sleep(attempt * 15000); continue; }
      if (!response.ok) return [];
      const rows = await response.json();
      return rows.slice(1).map((r) => r[0]).reverse();
    } catch { await sleep(attempt * 3000); }
  }
  return [];
}

async function archived(url) {
  const api = `https://archive.org/wayback/available?url=${encodeURIComponent(url)}`;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(api, {
        headers: { "user-agent": archiveAgent, accept: "application/json" },
        signal: AbortSignal.timeout(25000),
      });
      if (response.status === 429) { await sleep(attempt * 15000); continue; }
      if (!response.ok) return null;
      const data = await response.json();
      const snap = data?.archived_snapshots?.closest;
      return snap?.available ? { url: snap.url, timestamp: snap.timestamp } : null;
    } catch { await sleep(attempt * 3000); }
  }
  return null;
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(40000),
    headers: { "user-agent": archiveAgent, accept: "text/html,*/*;q=0.8" },
  });
  if (!response.ok) throw new Error(String(response.status));
  return { html: (await response.text()).slice(0, 500000), finalUrl: response.url };
}

// An archived page rewrites every asset through web.archive.org; the original
// address is the tail of that URL and is what provenance should name.
function originalOf(archiveUrl) {
  const m = /https?:\/\/web\.archive\.org\/web\/[^/]+\/(https?:\/\/.+)$/iu.exec(archiveUrl);
  return m ? m[1] : archiveUrl;
}

function headerRegion(html) {
  for (const pattern of [
    /<header\b[\s\S]*?<\/header>/iu,
    /<div[^>]+(?:id|class)="[^"]*\b(?:header|masthead|navbar|topbar|site-head)\b[^"]*"[\s\S]{0,20000}?<\/div>/iu,
    /<nav\b[\s\S]*?<\/nav>/iu,
  ]) {
    const m = pattern.exec(html);
    if (m) return m[0];
  }
  return html.slice(0, 20000);
}

function candidates(html, baseUrl) {
  const out = new Map();
  const add = (raw, score, type, evidence) => {
    if (!raw) return;
    let url;
    try { url = new URL(decodeEntities(raw), baseUrl).toString(); } catch { return; }
    if (REJECT.test(url)) return;
    const existing = out.get(url);
    if (!existing || score > existing.score) out.set(url, { url, score, sourceType: type, evidence: evidence.slice(0, 160) });
  };
  for (const block of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/giu)) {
    try {
      const walk = (v) => {
        if (Array.isArray(v)) return v.forEach(walk);
        if (!v || typeof v !== "object") return;
        if (typeof v.logo === "string") add(v.logo, 100, "JSON_LD_LOGO", "schema.org logo");
        else if (v.logo && typeof v.logo === "object" && typeof v.logo.url === "string") add(v.logo.url, 100, "JSON_LD_LOGO", "schema.org logo");
        Object.values(v).forEach((n) => { if (n && typeof n === "object") walk(n); });
      };
      walk(JSON.parse(block[1].trim()));
    } catch { /* malformed */ }
  }
  const header = headerRegion(html);
  for (const tag of header.matchAll(/<img\b[^>]*>/giu)) {
    const src = /(?:data-src|src)=["']([^"']+)["']/iu.exec(tag[0])?.[1];
    const alt = /alt=["']([^"']*)["']/iu.exec(tag[0])?.[1] ?? "";
    const cls = /class=["']([^"']*)["']/iu.exec(tag[0])?.[1] ?? "";
    if (!src) continue;
    const named = /\blogo\b/iu.test(`${src} ${alt} ${cls}`);
    add(src, named ? 90 : 55, "HEADER_IMAGE", `header img${named ? " named logo" : ""}`);
  }
  return [...out.values()].sort((a, b) => b.score - a.score).slice(0, 5);
}

const targets = JSON.parse(await fs.readFile(targetsPath, "utf8")).slice(offset, offset + limit);
const records = [];
let done = 0;
for (const brand of targets) {
  const record = { slug: brand.slug, name: brand.name, officialWebsite: brand.officialWebsite, reviewRequired: true, candidates: [] };
  const closest = await archived(brand.officialWebsite);
  await sleep(pauseMs);
  const stamps = [];
  if (closest) stamps.push(closest.timestamp);
  // Walk back through older captures until one yields a candidate.
  for (const t of await captureList(brand.officialWebsite)) {
    if (!stamps.includes(t)) stamps.push(t);
    if (stamps.length >= 5) break;
  }
  await sleep(pauseMs);
  if (!stamps.length) {
    record.status = "NO_SNAPSHOT";
    records.push(record);
  } else {
    record.status = "NO_CANDIDATE";
    for (const stamp of stamps) {
      const snapshotUrl = `https://web.archive.org/web/${stamp}/${brand.officialWebsite}`;
      try {
        const page = await fetchHtml(snapshotUrl);
        const found = candidates(page.html, page.finalUrl).map((c) => ({ ...c, originalUrl: originalOf(c.url) }));
        if (found.length) {
          record.archiveUrl = page.finalUrl;
          record.capturedAt = stamp;
          record.candidates = found;
          record.status = "CANDIDATES_FOUND";
          record.triedCaptures = stamps.indexOf(stamp) + 1;
          break;
        }
      } catch { /* this capture is unreadable, try an older one */ }
      await sleep(pauseMs);
    }
    records.push(record);
  }
  if (++done % 20 === 0) process.stdout.write(`  ${done}/${targets.length}\n`);
}
const summary = records.reduce((c, r) => { c[r.status] = (c[r.status] ?? 0) + 1; return c; }, {});
await fs.mkdir(OUTPUT_DIR, { recursive: true });
const outputPath = path.join(OUTPUT_DIR, `archived-${String(offset).padStart(4, "0")}-${String(targets.length).padStart(4, "0")}.json`);
await fs.writeFile(outputPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  source: "INTERNET_ARCHIVE_CAPTURES_OF_MANUFACTURER_SITES",
  policy: "DISCOVERY_ONLY_REQUIRES_VISUAL_AND_IDENTITY_REVIEW",
  offset, requested: targets.length, summary, records,
}, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ outputPath, ...summary }, null, 2)}\n`);
