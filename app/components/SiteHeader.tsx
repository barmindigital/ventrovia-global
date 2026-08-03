import Link from "next/link";
import { siteContent } from "@/app/lib/site-content";

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
          <Link href="/catalog">Каталог</Link>
          <Link href="/manufacturers">Производители</Link>
          <Link href="/about">О компании</Link>
          <Link href="/contacts">Контакты</Link>
        </nav>
        <Link className="header-cta" href="/contacts">Отправить запрос</Link>
        <details className="mobile-menu">
          <summary aria-label="Открыть меню"><span /><span /></summary>
          <nav aria-label="Мобильная навигация">
            <Link href="/catalog">Каталог</Link>
            <Link href="/manufacturers">Производители</Link>
            <Link href="/about">О компании</Link>
            <Link href="/contacts">Контакты</Link>
            <Link href="/contacts">Отправить запрос</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
