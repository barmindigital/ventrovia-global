import Link from "next/link";
import { siteContent } from "@/app/lib/site-content";
import { RequestCta } from "./RequestCta";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link
          className="brand"
          href="/"
          aria-label={`${siteContent.site.name} — главная`}
        >
          <span className="brand-mark" aria-hidden="true">
            <i />
          </span>
          <span className="brand-copy">
            <strong>{siteContent.site.name.toLocaleUpperCase("ru-RU")}</strong>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Основная навигация">
          <Link href="/#services">Услуги</Link>
          <Link href="/catalog">Каталог</Link>
          <Link href="/manufacturers">Производители</Link>
          <Link href="/about">О компании</Link>
          <Link href="/contacts">Контакты</Link>
        </nav>
        <RequestCta className="header-cta" />
        <details className="mobile-menu">
          <summary aria-label="Открыть меню"><span /><span /></summary>
          <nav aria-label="Мобильная навигация">
            <Link href="/#services">Услуги</Link>
            <Link href="/catalog">Каталог</Link>
            <Link href="/manufacturers">Производители</Link>
            <Link href="/about">О компании</Link>
            <Link href="/contacts">Контакты</Link>
            <RequestCta className="mobile-menu-cta" />
          </nav>
        </details>
      </div>
    </header>
  );
}
