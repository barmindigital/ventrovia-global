import Link from "next/link";
import { siteContent } from "../lib/site-content";
import { PhoneAction } from "./PhoneAction";
import { RequestCta } from "./RequestCta";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Link className="brand brand-footer" href="/">
            <span className="brand-mark" aria-hidden="true"><i /></span>
            <span className="brand-copy"><strong>{siteContent.site.name.toUpperCase()}</strong></span>
          </Link>
          <p className="footer-note">
            Подбор оборудования и комплектующих по модели, артикулу и техническому заданию.
          </p>
        </div>
        <div>
          <h2>Каталог</h2>
          <Link href="/catalog">Все категории</Link>
          <Link href="/manufacturers">Производители</Link>
          <Link href="/#services">Услуги</Link>
        </div>
        <div>
          <h2>Компания</h2>
          <Link href="/about">О компании</Link>
          <Link href="/contacts">Контакты</Link>
          <Link href="/privacy">Политика конфиденциальности</Link>
          <RequestCta className="footer-request-cta" source="footer" />
        </div>
        <div className="footer-status">
          <span className="status-dot" />
          <div className="footer-status-copy">
            <strong>Офис в Москве</strong><br />
            <PhoneAction>{siteContent.contacts.phoneDisplay}</PhoneAction><br />
            <a href={`mailto:${siteContent.contacts.email}`}>{siteContent.contacts.email}</a><br />
            {siteContent.contacts.weekdays}<br />
            {siteContent.contacts.weekend}
          </div>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 {siteContent.site.name}</span>
        <Link href="/privacy">Политика конфиденциальности</Link>
        <span>Информация на сайте не является публичной офертой.</span>
      </div>
    </footer>
  );
}
