import Image from "next/image";
import Link from "next/link";
import { SITE_BRAND } from "../lib/site-brand";
import { PhoneAction } from "./PhoneAction";
import { RequestCta } from "./RequestCta";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Link className="brand brand-footer brand-logo" href="/">
            <Image alt={`${SITE_BRAND.displayName} — ${SITE_BRAND.tagline}`} height={62} src={SITE_BRAND.logos.horizontalTaglineLight} unoptimized width={348} />
          </Link>
          <p className="footer-note">International industrial sourcing and supply coordination based on complete models, part numbers and technical specifications.</p>
        </div>
        <div>
          <h2>Sourcing</h2>
          <Link href="/manufacturers">Manufacturers</Link>
          <Link href="/services">Services</Link>
          <RequestCta className="footer-request-cta" source="footer">Request an Offer</RequestCta>
        </div>
        <div>
          <h2>Company</h2>
          <Link href="/about">About us</Link>
          <Link href="/contacts">Contact</Link>
          <Link href="/privacy">Privacy Policy</Link>
        </div>
        <div className="footer-status">
          <span className="status-dot" />
          <div className="footer-status-copy">
            <strong>{SITE_BRAND.baseLocation}</strong><br />
            <PhoneAction>{SITE_BRAND.phoneDisplay}</PhoneAction><br />
            <a href={`mailto:${SITE_BRAND.email}`}>{SITE_BRAND.email}</a><br />
            {[SITE_BRAND.address.line1, SITE_BRAND.address.line2, SITE_BRAND.address.line3].filter(Boolean).map((line) => <span key={line}>{line}<br /></span>)}
          </div>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 {SITE_BRAND.name}</span>
        <Link href="/privacy">Privacy Policy</Link>
        <span>All trademarks belong to their respective owners. Website information is not a binding offer.</span>
      </div>
    </footer>
  );
}
