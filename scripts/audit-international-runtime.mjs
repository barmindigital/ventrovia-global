import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const knowledgeSource = await readFile(
  new URL("../data/brand-knowledge-international/profiles.json", import.meta.url),
  "utf8",
);
const knowledge = JSON.parse(knowledgeSource);
const brandConfig = await readFile(
  new URL("../app/lib/site-brand.ts", import.meta.url),
  "utf8",
);
const publicContent = await readFile(
  new URL("../content/site-content.json", import.meta.url),
  "utf8",
);

assert.ok(knowledge.profiles.length > 0);
assert.equal(knowledge.metrics.enContentReady, knowledge.profiles.length);
assert.equal(knowledge.metrics.enSeoReady, knowledge.profiles.length);
assert.doesNotMatch(knowledgeSource, /[А-Яа-яЁё]/u);
assert.doesNotMatch(publicContent, /[А-Яа-яЁё]/u);
assert.doesNotMatch(`${brandConfig}\n${publicContent}`, /VENTORVIA/u);
assert.match(brandConfig, /ventroviaglobal\.com/u);
assert.match(brandConfig, /sales@ventroviaglobal\.com/u);
assert.match(brandConfig, /\+971557254463/u);

const titles = knowledge.profiles.map((profile) =>
  `${profile.displayName} ${profile.productCategories[0]} | Ventrovia`,
);
const descriptions = knowledge.profiles.map((profile) =>
  `Source ${profile.displayName} equipment across ${profile.productCategories
    .slice(0, 3)
    .join(", ")}. Send the complete part number, model or specification for pricing and lead-time review.`,
);
assert.equal(new Set(titles).size, titles.length);
assert.equal(new Set(descriptions).size, descriptions.length);
for (const profile of knowledge.profiles) {
  assert.equal(profile.contentLanguage, "en");
  assert.equal(profile.enContentStatus, "EN_CONTENT_READY");
  assert.equal(profile.enSeoStatus, "EN_SEO_READY");
  const hasTierASource = profile.sources.some((source) => source.tier === "A");
  const hasOfficialCorporateEvidence = Boolean(profile.parentCompany)
    && profile.sources.some((source) =>
      source.tier === "B"
      && /PARENT|ACQUISITION|SUCCESSOR|RIGHTS_OWNER/u.test(source.type),
    );
  assert.ok(hasTierASource || hasOfficialCorporateEvidence);
  assert.ok(profile.shortDescription.length >= 100);
  assert.ok(profile.fullDescription.length >= 3);
  assert.doesNotMatch(
    `${profile.shortDescription} ${profile.fullDescription.join(" ")}`,
    /authori[sz]ed dealer|official distributor|in stock|best price/iu,
  );
}

console.log(
  JSON.stringify(
    {
      status: "healthy",
      brand: "VENTROVIA",
      domain: "ventroviaglobal.com",
      publicLanguage: "en",
      enContentReady: knowledge.metrics.enContentReady,
      enSeoReady: knowledge.metrics.enSeoReady,
      uniqueTitles: new Set(titles).size,
      uniqueDescriptions: new Set(descriptions).size,
      unsupportedCommercialClaims: 0,
      typoOccurrences: 0,
    },
    null,
    2,
  ),
);
