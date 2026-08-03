import Link from "next/link";
import { siteContent } from "../lib/site-content";

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
          <Link href="/manufacturers/abb">ABB</Link>
        </div>
        <div>
          <h2>Компания</h2>
          <Link href="/about">О компании</Link>
          <Link href="/contacts">Контакты</Link>
          <Link href="/contacts">Запросить подбор</Link>
        </div>
        <div className="footer-status">
          <span className="status-dot" />
          <p>
            <strong>Офис в Москве</strong><br />
            <a href={siteContent.contacts.phoneHref}>{siteContent.contacts.phoneDisplay}</a><br />
            <a href={`mailto:${siteContent.contacts.email}`}>{siteContent.contacts.email}</a><br />
            {siteContent.contacts.weekdays}<br />
            {siteContent.contacts.weekend}
          </p>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 {siteContent.site.name}</span>
        <span>Информация на сайте не является публичной офертой.</span>
      </div>
    </footer>
  );
}
