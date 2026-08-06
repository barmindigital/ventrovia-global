"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { siteContent } from "@/app/lib/site-content";
import { RequestCta } from "./RequestCta";

const navigationItems = [
  { href: "/#services", key: "services", label: "Услуги" },
  { href: "/catalog", key: "catalog", label: "Каталог" },
  { href: "/manufacturers", key: "manufacturers", label: "Производители" },
  { href: "/about", key: "about", label: "О компании" },
  { href: "/contacts", key: "contacts", label: "Контакты" },
] as const;

const homeSections = [
  { id: "services", key: "services" },
  { id: "catalog", key: "catalog" },
  { id: "about", key: "about" },
  { id: "cases", key: "about" },
  { id: "manufacturers", key: "manufacturers" },
  { id: "request", key: "contacts" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);
  const [activeHomeSection, setActiveHomeSection] = useState("");

  useEffect(() => {
    if (pathname !== "/") return;

    const updateActiveSection = () => {
      const marker = window.scrollY + window.innerHeight * 0.35;
      let activeSection = "";

      for (const section of homeSections) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= marker) {
          activeSection = section.key;
        }
      }

      setActiveHomeSection(activeSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [pathname]);

  const closeMobileMenu = () => {
    mobileMenuRef.current?.removeAttribute("open");
  };

  const isActive = (key: (typeof navigationItems)[number]["key"]) =>
    pathname === "/"
      ? activeHomeSection === key
      : pathname === `/${key}` || pathname.startsWith(`/${key}/`);

  const renderNavigationLink = (
    item: (typeof navigationItems)[number],
    closeMenu = false,
  ) => {
    const active = isActive(item.key);

    return (
      <Link
        aria-current={active ? (pathname === "/" ? "location" : "page") : undefined}
        className={active ? "is-active" : undefined}
        href={item.href}
        key={item.key}
        onClick={closeMenu ? closeMobileMenu : undefined}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link
          className="brand"
          href="/"
          aria-label={`${siteContent.site.name} — главная`}
          onClick={closeMobileMenu}
        >
          <span className="brand-mark" aria-hidden="true">
            <i />
          </span>
          <span className="brand-copy">
            <strong>{siteContent.site.name.toLocaleUpperCase("ru-RU")}</strong>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Основная навигация">
          {navigationItems.map((item) => renderNavigationLink(item))}
        </nav>
        <RequestCta className="header-cta" />
        <details className="mobile-menu" ref={mobileMenuRef}>
          <summary aria-label="Открыть меню"><span /><span /></summary>
          <nav aria-label="Мобильная навигация">
            {navigationItems.map((item) => renderNavigationLink(item, true))}
            <RequestCta className="mobile-menu-cta" onTrigger={closeMobileMenu} />
          </nav>
        </details>
      </div>
    </header>
  );
}
