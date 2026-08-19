# Ventrovia Blue Regression Audit

## Decision

Ventrovia keeps the geometric V identity from the approved reference, but the public website uses the established warm industrial design system that existed before the international rebrand.

## Restored production palette

- Primary text: `#332f2a`
- Secondary text: `#4b453e`
- Brand / primary CTA: `#b4533c`
- Signal accent: `#d31027`
- Warm surface: `#f2ebdd`
- Dark stone surface: `#6b6459`

## Removed rebrand injections

The rebrand-only values `#173f5a`, `#123449`, `#272326`, `#45414a`, `#f4f0e8`, `#5d77a5`, and `#b9c8d5` were removed from the Ventrovia application theme, site-brand assets, favicon and social-image generator.

Official manufacturer logos are excluded from this audit. Their own brand colors are preserved and are never recolored to match Ventrovia.

## Logo policy

The V symbol geometry and lock-up proportions are preserved. Production wordmarks use **VENTROVIA** and the optional tagline **GLOBAL INDUSTRIAL TRADE**. The asset family includes site-color, dark-background, monochrome, symbol-only, horizontal, tagline, app-icon and favicon variants.

## Automated gate

Run:

```sh
pnpm audit:visual
```

The command fails if any removed rebrand-blue token returns to the Ventrovia application or first-party brand assets.
