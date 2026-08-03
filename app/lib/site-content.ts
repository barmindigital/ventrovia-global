import content from "@/content/site-content.json";

export type PageContent = {
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  heading: string;
  intro: string;
};

export type SiteContent = {
  version: number;
  site: {
    name: string;
    defaultSeoTitle: string;
    defaultSeoDescription: string;
    openGraphTitle: string;
    openGraphDescription: string;
  };
  pages: Record<"home" | "catalog" | "manufacturers" | "about" | "contacts", PageContent>;
  templates: {
    productTitle: string;
    productDescription: string;
    manufacturerTitle: string;
    manufacturerDescription: string;
  };
  contacts: {
    phoneDisplay: string;
    phoneHref: string;
    email: string;
    address: string;
    weekdays: string;
    weekend: string;
  };
  companyHistory: Array<{ year: string; text: string }>;
};

export const siteContent = content as SiteContent;

export function applySeoTemplate(
  template: string,
  values: Record<string, string | number | undefined>,
) {
  return template
    .replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => String(values[key] ?? ""))
    .replace(/\s+/g, " ")
    .replace(/\s+([.,:;!?])/g, "$1")
    .trim();
}

export function renderHeadingLines(value: string) {
  return value.split("\n").filter(Boolean);
}
