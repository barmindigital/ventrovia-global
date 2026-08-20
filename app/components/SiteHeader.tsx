"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SITE_BRAND } from "@/app/lib/site-brand";
import { RequestCta } from "./RequestCta";

const navigationItems = [
  { href: "/", key: "home", label: "Home" },
  { href: "/manufacturers", key: "manufacturers", label: "Manufacturers" },
  { href: "/about", key: "about", label: "About" },
  { href: "/#services", key: "services", label: "Services" },
  { href: "/contacts", key: "contacts", label: "Contact" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => {
    mobileMenuRef.current?.removeAttribute("open");
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const menu = mobileMenuRef.current;
      if (menu?.open && !menu.contains(event.target as Node)) closeMobileMenu();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !mobileMenuRef.current?.open) return;
      closeMobileMenu();
      mobileMenuRef.current?.querySelector<HTMLElement>("summary")?.focus();
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  const isActive = (key: (typeof navigationItems)[number]["key"]) =>
    key === "home"
      ? pathname === "/"
      : key === "services"
        ? false
        : pathname === `/${key}` || pathname.startsWith(`/${key}/`);

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand brand-ventrovia" href="/" aria-label={`${SITE_BRAND.name} home`} onClick={closeMobileMenu}>
          <Image alt={SITE_BRAND.displayName} height={54} priority src={SITE_BRAND.logos.horizontalDark} unoptimized width={228} />
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigationItems.map((item) => (
            <Link aria-current={isActive(item.key) ? "page" : undefined} className={isActive(item.key) ? "is-active" : undefined} href={item.href} key={item.key}>
              {item.label}
            </Link>
          ))}
        </nav>
        <RequestCta className="header-cta" source="header_desktop">Request a Quote</RequestCta>
        <details className="mobile-menu" onToggle={(event) => setMobileMenuOpen(event.currentTarget.open)} ref={mobileMenuRef}>
          <summary aria-expanded={mobileMenuOpen} aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}><span /><span /></summary>
          <nav aria-label="Mobile navigation">
            {navigationItems.map((item) => (
              <Link aria-current={isActive(item.key) ? "page" : undefined} className={isActive(item.key) ? "is-active" : undefined} href={item.href} key={item.key} onClick={closeMobileMenu}>
                {item.label}
              </Link>
            ))}
            <RequestCta className="mobile-menu-cta" onTrigger={closeMobileMenu} source="header_mobile">Request a Quote</RequestCta>
          </nav>
        </details>
      </div>
    </header>
  );
}
