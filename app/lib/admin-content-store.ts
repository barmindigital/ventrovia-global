import { Buffer } from "node:buffer";
import { siteContent, type SiteContent } from "./site-content";

const CONTENT_PATH = "content/site-content.json";

type GithubContentResponse = {
  content?: string;
  encoding?: string;
  sha?: string;
};

function githubSettings() {
  return {
    token: process.env.GITHUB_CONTENT_TOKEN?.trim(),
    repository: process.env.ADMIN_GITHUB_REPO?.trim(),
    branch: process.env.ADMIN_GITHUB_BRANCH?.trim() || "main",
  };
}

export function adminStorageConfigured() {
  const { token, repository } = githubSettings();
  return Boolean(token && repository?.includes("/"));
}

function githubUrl(repository: string, branch: string) {
  return `https://api.github.com/repos/${repository}/contents/${CONTENT_PATH}?ref=${encodeURIComponent(branch)}`;
}

async function githubRequest(url: string, init?: RequestInit) {
  const { token } = githubSettings();
  if (!token) throw new Error("GITHUB_CONTENT_TOKEN is not configured");

  return fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...init?.headers,
    },
  });
}

export async function loadEditableContent() {
  const { repository, branch } = githubSettings();
  if (!repository || !adminStorageConfigured()) {
    return { content: siteContent, sha: null, source: "local" as const };
  }

  const response = await githubRequest(githubUrl(repository, branch));
  if (!response.ok) {
    throw new Error(`GitHub returned ${response.status} while loading content`);
  }
  const payload = (await response.json()) as GithubContentResponse;
  if (!payload.content || payload.encoding !== "base64" || !payload.sha) {
    throw new Error("GitHub returned an invalid content file");
  }

  const decoded = Buffer.from(payload.content.replace(/\s/g, ""), "base64").toString("utf8");
  return {
    content: validateSiteContent(JSON.parse(decoded)),
    sha: payload.sha,
    source: "github" as const,
  };
}

export async function saveEditableContent(content: SiteContent, sha: string | null) {
  const { repository, branch } = githubSettings();
  if (!repository || !adminStorageConfigured()) {
    throw new Error("GitHub storage is not configured");
  }

  const validated = validateSiteContent(content);
  const response = await githubRequest(githubUrl(repository, branch).split("?ref=")[0], {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Update site content and SEO from admin",
      content: Buffer.from(`${JSON.stringify(validated, null, 2)}\n`, "utf8").toString("base64"),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`GitHub rejected the update (${response.status}): ${details.slice(0, 240)}`);
  }

  const payload = (await response.json()) as { content?: { sha?: string } };
  return payload.content?.sha ?? null;
}

function requireString(value: unknown, name: string, maxLength: number) {
  if (typeof value !== "string") throw new Error(`${name} must be a string`);
  const normalized = value.trim();
  if (!normalized) throw new Error(`${name} cannot be empty`);
  if (normalized.length > maxLength) throw new Error(`${name} is too long`);
  return normalized;
}

export function validateSiteContent(value: unknown): SiteContent {
  if (!value || typeof value !== "object") throw new Error("Invalid content payload");
  const draft = structuredClone(value) as SiteContent;

  if (draft.version !== 1) throw new Error("Unsupported content version");
  if (!draft.site || !draft.pages || !draft.templates || !draft.contacts) {
    throw new Error("Content payload is incomplete");
  }
  draft.site.name = requireString(draft.site?.name, "site.name", 80);
  draft.site.defaultSeoTitle = requireString(draft.site?.defaultSeoTitle, "site.defaultSeoTitle", 120);
  draft.site.defaultSeoDescription = requireString(draft.site?.defaultSeoDescription, "site.defaultSeoDescription", 220);
  draft.site.openGraphTitle = requireString(draft.site?.openGraphTitle, "site.openGraphTitle", 140);
  draft.site.openGraphDescription = requireString(draft.site?.openGraphDescription, "site.openGraphDescription", 240);

  for (const key of ["home", "catalog", "manufacturers", "about", "contacts"] as const) {
    const page = draft.pages?.[key];
    if (!page) throw new Error(`pages.${key} is missing`);
    page.seoTitle = requireString(page.seoTitle, `pages.${key}.seoTitle`, 120);
    page.seoDescription = requireString(page.seoDescription, `pages.${key}.seoDescription`, 220);
    page.eyebrow = requireString(page.eyebrow, `pages.${key}.eyebrow`, 100);
    page.heading = requireString(page.heading, `pages.${key}.heading`, 220);
    page.intro = requireString(page.intro, `pages.${key}.intro`, 700);
  }

  for (const key of ["productTitle", "productDescription", "manufacturerTitle", "manufacturerDescription"] as const) {
    draft.templates[key] = requireString(draft.templates?.[key], `templates.${key}`, 300);
  }

  draft.contacts.phoneDisplay = requireString(draft.contacts?.phoneDisplay, "contacts.phoneDisplay", 40);
  draft.contacts.phoneHref = requireString(draft.contacts?.phoneHref, "contacts.phoneHref", 30);
  draft.contacts.email = requireString(draft.contacts?.email, "contacts.email", 120);
  draft.contacts.address = requireString(draft.contacts?.address, "contacts.address", 240);
  draft.contacts.weekdays = requireString(draft.contacts?.weekdays, "contacts.weekdays", 120);
  draft.contacts.weekend = requireString(draft.contacts?.weekend, "contacts.weekend", 120);

  if (!Array.isArray(draft.companyHistory) || draft.companyHistory.length < 1 || draft.companyHistory.length > 30) {
    throw new Error("companyHistory must contain 1–30 items");
  }
  draft.companyHistory = draft.companyHistory.map((item, index) => ({
    year: requireString(item?.year, `companyHistory.${index}.year`, 20),
    text: requireString(item?.text, `companyHistory.${index}.text`, 1400),
  }));

  return draft;
}
