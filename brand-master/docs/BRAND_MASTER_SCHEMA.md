# Brand Master schema

Schema version: 1.0.0

Primary format: UTF-8 JSON

Primary language: English

Scope: independent manufacturer and brand knowledge

## Root object

`data/brand-master.json` contains:

- `schemaVersion` — export schema version.
- `generatedAt` — deterministic generation timestamp for this release.
- `language` — current factual content language.
- `framework`, `siteBrand` — deliberately `null` to assert portability.
- `sourceScope` — scope declaration.
- `totalBrands` — expected number of records.
- `brands` — all brand records.

## Brand record

- `id` — stable internal identifier. Treat as immutable.
- `canonicalName` — confirmed official name for SAFE records; preserved source name for REVIEW records.
- `displayName` — human-readable brand name.
- `slug` — stable canonical slug. Treat as immutable unless a separately reviewed migration supplies a redirect.
- `aliases`, `formerNames` — known identity labels. Aliases are not proof that two records should be merged.
- `identityStatus` — `CONFIRMED` or `REVIEW_REQUIRED`.
- `lifecycleStatus` — current, group-brand, acquired, legacy, successor or another explicitly source-backed identity modifier; `UNKNOWN` for REVIEW records.
- `publicationStatus` — `BRAND_SAFE` or `BRAND_REVIEW`.
- `officialDomain`, `officialWebsite` — present only when identity is confirmed.
- `country`, `headquarters`, `foundedYear`, `parentCompany` — optional official facts.
- `descriptions.en` — factual site-neutral English content. REVIEW records contain `null`.
- `categories` — controlled category relations with evidence state and source-record references.
- `productGroups` — source-backed normalized product areas. This is not a product catalogue.
- `families`, `series`, `industries` — optional source-backed brand-level facts.
- `documents` — official catalogue/documentation links already associated with the profile.
- `logo` — portable asset metadata and relative asset path, or `null`.
- `sourceRecordIds` — references into `data/brand-sources.json`.
- `checkedAt` — most recent source-check date for the profile.
- `contentStatus`, `seoStatus` — independent readiness gates.
- `seo` — suffix-free SEO core and intent data; REVIEW records contain `null`.
- `reviewStatus` — resolved state or explicit blocker data.
- `completeness` — inventory coverage indicator, separate from verification.
- `notes` — non-secret migration or review note.

## Descriptions

`descriptions` is language-keyed for future localization. The current export includes only `en`. New translations should be added as siblings (`ar`, `de`, `fr`, and so on), each with its own status and provenance policy. Do not overwrite English with machine translation.

`presentationCopyIncluded` is `false`: calls to action, supplier claims and the name of the current website are intentionally excluded.

## Categories and evidence

Each category relation contains:

- `id` — controlled category identifier.
- `label` — controlled English label.
- `evidenceStatus` — currently `SOURCE_BACKED` for SAFE records.
- `evidenceScope` — `PROFILE_LEVEL`; existing source data confirms the profile's scope but does not always map one source to one category sentence.
- `sourceRecordIds` — source records supporting the profile.

Do not interpret a brand category as proof that every model has every category attribute.

## Source registry

`data/brand-sources.json` stores:

- `sourceId` — stable unique source record identifier.
- `brandId` — stable brand ID.
- `url`, `domain` — first-party or approved corporate evidence location.
- `sourceType`, `tier`, `scope` — evidence classification.
- `checkedAt`, `status` — observation date and state.
- `contentChecksum` — optional; `null` where no captured content checksum exists.

Source records never contain credentials or session data.

## Logo object

- `assetPath` — relative path inside the assembled package.
- `sourceUrl`, `originalUrl`, `sourceType` — provenance.
- `retrievedAt`, `checksum`, `fileType`, `dimensions` — technical metadata.
- `license`, `rightsStatus`, `publicationStatus` — existing rights/publication assessment.
- `presentationBackground` — `light` or `dark`; preserves the official asset unchanged while telling a future UI which neutral background is required for legibility.

Manufacturer logos must not be recoloured or assigned by fuzzy matching.

## SEO object

- `titleCore` — factual title without a website suffix.
- `siteSuffix` — `null`; the new site supplies its own suffix at render time.
- `metaFactual` — site-neutral factual summary.
- `siteSpecificCta` — `null`.
- `primaryIntent`, `secondaryIntents` — reusable semantic intents.
- `titlePolicy` — reminder to append a new site suffix only at presentation time.

## Completeness versus verification

Completeness measures whether useful fields are populated. Verification controls whether an identity may be asserted. A high completeness score never promotes REVIEW to SAFE. A SAFE profile may legitimately lack an HQ, founded year, document or logo.

## Content-quality audit

`data/brand-content-quality-audit.json` records exact-duplicate groups and normalized word-trigram similarity across all SAFE short and full descriptions. A score of 0.85 is the release threshold for systemic near-duplicate findings; pairs at or above 0.75 are retained for editorial review. The audit also confirms that the portable description and SEO fields contain no current-site brand or CTA copy.

## CSV limitations

`data/brand-master.csv` is for inspection and simple imports. Array values use ` | ` as a display separator. JSON remains authoritative for nested evidence, sources, review state, categories, descriptions and logo metadata.
