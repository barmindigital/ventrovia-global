# Ventrovia category page prototypes — not published

Checked: 2026-08-24

Status: local editorial prototype only. These paths are not implemented, are
not indexable, and are not present in the sitemap.

## Shared release gate

A category page may be published only when every listed manufacturer is
`BRAND_SAFE`, every category association is traceable to official evidence, the
page has unique editorial copy, no product or SKU data are loaded, and the page
passes canonical, schema, similarity, internal-link and useful-content review.

The page must not imply that Ventrovia is an authorised distributor and must not
make stock, price, lead-time, warranty or manufacturer-relationship claims.

## Prototype A — pumps and pumping systems

- Proposed URL: `/manufacturers/pumps`
- Proposed Title: `Industrial Pump Manufacturers & Sourcing | Ventrovia`
- Proposed Meta: `Explore source-backed industrial pump manufacturers covering process, dosing, vacuum and fluid-handling applications. Send a model or specification to Ventrovia for sourcing review.`
- Proposed H1: `Industrial Pump Manufacturers`
- Current evidence base: 344 SAFE manufacturers; 344 full English profiles; 341 with family evidence; 328 with Tier A evidence; 51 with publishable logos.

Suggested structure:

1. concise definition of the sourcing scope and evidence policy;
2. evidence-backed segments such as centrifugal, positive-displacement, dosing,
   sanitary, vacuum and high-pressure pumping only when category facts support
   the grouping;
3. curated SAFE manufacturer cards with short category-specific descriptors;
4. guidance for model, duty point, fluid, materials and applicable document
   submission;
5. Request an Offer and Send Your Specification paths;
6. related factual category links only after those categories are published.

FAQ candidates:

- What information should be included in an industrial pump enquiry?
- Can Ventrovia review a request by manufacturer and model?
- How are manufacturers selected for this directory?
- Does inclusion imply an authorised distributor relationship?

## Prototype B — industrial automation and control

- Proposed URL: `/manufacturers/industrial-automation`
- Proposed Title: `Industrial Automation Manufacturers & Sourcing | Ventrovia`
- Proposed Meta: `Browse source-backed manufacturers of industrial automation, control and motion technologies. Submit a brand, model, part reference or specification for sourcing review.`
- Proposed H1: `Industrial Automation Manufacturers`
- Current evidence base: 491 SAFE manufacturers; 491 full English profiles; 488 with family evidence; 470 with Tier A evidence; 142 with publishable logos.

Suggested structure:

1. factual automation and control scope;
2. evidence-backed segments such as controllers, industrial communication,
   motion control, safety automation, operator interfaces and control devices;
3. curated SAFE manufacturer cards with category-specific evidence summaries;
4. guidance for part reference, firmware/hardware generation, interface and
   technical-document submission without claiming compatibility;
5. Request an Offer and Send Your Specification paths;
6. restrained links to manufacturer pages and future sensors/drives pages.

FAQ candidates:

- What details help identify an industrial automation component?
- Can a request include an obsolete or legacy model reference?
- Does Ventrovia guarantee compatibility or availability?
- Why are only verified manufacturers shown?

## Implementation boundary

The first release should be one or two controlled pages, not a generated mass
URL layer. Category evidence and full Brand Facts remain server-side; the client
receives only the compact card and search data required for the visible page.
