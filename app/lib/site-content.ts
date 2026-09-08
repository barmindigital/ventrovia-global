import content from "@/content/site-content.json";
import { SITE_BRAND } from "./site-brand";

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
  pages: Record<"home" | "manufacturers" | "services" | "about" | "contacts", PageContent>;
  templates: {
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
};

const rawSiteContent = content as SiteContent;

export const siteContent: SiteContent = {
  ...rawSiteContent,
  site: {
    ...rawSiteContent.site,
    name: SITE_BRAND.name,
  },
  contacts: {
    ...rawSiteContent.contacts,
    phoneDisplay: SITE_BRAND.phoneDisplay,
    phoneHref: SITE_BRAND.phoneHref,
    email: SITE_BRAND.email,
    address: SITE_BRAND.address.singleLine,
  },
};

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
