import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { brandLogoRegistry } from "../../lib/brand-logos";

export const metadata: Metadata = {
  title: "Источники логотипов производителей",
  description:
    "Реестр источников и лицензий логотипов, используемых для идентификации производителей в каталоге.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: { canonical: "/manufacturers" },
};

export default function BrandLogoSourcesPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <div className="breadcrumbs">
            <Link href="/">Главная</Link><span>/</span>
            <Link href="/manufacturers">Производители</Link><span>/</span>
            <span>Источники логотипов</span>
          </div>
          <p className="eyebrow">Контроль материалов</p>
          <h1>Источники логотипов</h1>
          <p>
            В реестр попадают только проверенные файлы с указанным источником и
            статусом лицензии. Для остальных производителей используется
            нейтральная монограмма.
          </p>
        </div>
      </section>
      <section className="section shell">
        <div className="logo-source-list">
          {brandLogoRegistry.map((logo) => (
            <article className="logo-source-card" key={logo.slug}>
              <div className="logo-source-preview">
                <Image
                  alt={`${logo.name} — логотип производителя`}
                  height={120}
                  src={logo.src}
                  unoptimized
                  width={260}
                />
              </div>
              <div>
                <h2>{logo.name}</h2>
                <p>{logo.license}</p>
                <p>{logo.attribution}</p>
                {logo.licenseUrl && (
                  <a href={logo.licenseUrl} rel="noreferrer" target="_blank">
                    Условия лицензии ↗
                  </a>
                )}
                <a href={logo.sourcePage} rel="noreferrer" target="_blank">
                  Страница источника ↗
                </a>
              </div>
            </article>
          ))}
        </div>
        <p className="trademark-note">
          Все товарные знаки принадлежат соответствующим правообладателям.
          Размещение используется исключительно для идентификации продукции и
          не означает официального партнёрства.
        </p>
      </section>
    </>
  );
}
