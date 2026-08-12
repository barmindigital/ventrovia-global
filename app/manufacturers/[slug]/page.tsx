import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { RequestCta } from "../../components/RequestCta";
import { brandLogoBySlug } from "../../lib/brand-logos";
import { brandInitials, brandWordmarkTone } from "../../lib/brand-wordmark";
import {
  brandDisplayName,
  brandKnowledgeFor,
  brandMetaDescription,
  brandReadinessFor,
  brandSeoTitle,
  isBrandIndexable,
} from "../../lib/brand-knowledge.server";
import { manufacturerBySlug, manufacturers } from "../../lib/catalog-data";
import {
  canonicalManufacturerSlug,
  legacyManufacturerSlugsFor,
} from "../../lib/manufacturer-normalization";
import { serializeJsonLd, SITE_URL } from "../../lib/seo-content";

type BrandPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  const slugs = manufacturers
    .filter((manufacturer) => isBrandIndexable(manufacturer.slug))
    .flatMap((manufacturer) => [
      manufacturer.slug,
      ...legacyManufacturerSlugsFor(manufacturer.slug),
    ]);
  return Array.from(new Set(slugs)).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = manufacturerBySlug(slug);
  if (!brand) return {};
  const name = brandDisplayName(brand.slug, brand.name);
  const canonical = `/manufacturers/${brand.slug}`;
  const title = brandSeoTitle(brand.slug, brand.name);
  const description = brandMetaDescription(brand.slug, brand.name);
  const logo = brandLogoBySlug(brand.slug);
  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: isBrandIndexable(brand.slug), follow: true },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      images: logo ? [{ url: logo.src, alt: `${name} — логотип` }] : undefined,
    },
  };
}

const commercialFaq = (name: string) => [
  {
    question: `Как заказать оборудование ${name}?`,
    answer: "Отправьте полную модель, артикул или фотографию шильдика. Мы проверим идентификацию позиции, возможность поставки, цену и срок.",
  },
  {
    question: "Можно ли запросить снятую с производства модель?",
    answer: "Да. Для такой позиции проверяются доступность, возможная замена и условия предложения. Статус модели подтверждается перед расчётом.",
  },
  {
    question: "Можно ли подобрать аналог?",
    answer: "Подбор возможен после проверки технических параметров и условий эксплуатации. Текстовое сходство артикулов не используется как доказательство совместимости.",
  },
  {
    question: "Можно ли отправить спецификацию?",
    answer: "Да. Приложите список позиций с производителем и полной маркировкой — так можно обработать несколько строк одним запросом.",
  },
];

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const canonicalSlug = canonicalManufacturerSlug(slug);
  if (canonicalSlug !== slug) redirect(`/manufacturers/${canonicalSlug}`);
  const brand = manufacturerBySlug(slug);
  if (!brand) notFound();

  const profile = brandKnowledgeFor(brand.slug);
  const readiness = brandReadinessFor(brand.slug);
  const displayName = brandDisplayName(brand.slug, brand.name);
  const logo = brandLogoBySlug(brand.slug);
  const brandUrl = `${SITE_URL}/manufacturers/${brand.slug}`;
  const summary = profile?.shortDescription
    ?? `Для ${displayName} выполняем адресный поиск по полной модели, артикулу и маркировке. Сведения о производителе и продукции проверяются перед подготовкой предложения.`;
  const brandJsonLd = profile ? {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: profile.officialName,
    alternateName: profile.aliases,
    url: brandUrl,
    description: profile.shortDescription,
    logo: logo ? `${SITE_URL}${logo.src}` : undefined,
    sameAs: [profile.officialWebsite],
  } : null;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Производители", item: `${SITE_URL}/manufacturers` },
      { "@type": "ListItem", position: 3, name: displayName, item: brandUrl },
    ],
  };
  const faq = commercialFaq(displayName);

  return (
    <>
      <section className="page-hero">
        <div className="shell brand-hero">
          <div>
            <div className="breadcrumbs">
              <Link href="/">Главная</Link><span>/</span>
              <Link href="/manufacturers">Производители</Link><span>/</span>
              <span>{displayName}</span>
            </div>
            <p className="eyebrow">База производителей</p>
            <h1>{displayName}</h1>
            <p>{summary}</p>
            <div className="brand-hero-actions">
              <RequestCta
                defaultProduct={displayName}
                requestContext={`Производитель: ${displayName}`}
                requestType="product"
                source="manufacturer_page"
              >
                Запросить цену и срок
              </RequestCta>
              <RequestCta
                className="button button-outline"
                defaultProduct={displayName}
                requestContext={`Спецификация по производителю: ${displayName}`}
                source="manufacturer_page"
              >
                Загрузить спецификацию
              </RequestCta>
            </div>
          </div>
          <div className="brand-visual" aria-label={`Иллюстрация раздела ${displayName}`} role="img">
            <Image alt="" height={900} priority src="/images/brands/global-sourcing-cover.webp" unoptimized width={1600} />
            {logo ? (
              <span className="brand-hero-logo">
                <Image alt={`${displayName} — логотип производителя`} height={150} src={logo.src} unoptimized width={360} />
              </span>
            ) : (
              <span aria-label={`Текстовая карточка производителя ${displayName}`} className={`brand-wordmark-hero ${brandWordmarkTone(brand.slug)}`} role="img">
                <span aria-hidden="true" className="brand-wordmark-initials" data-initials={brandInitials(displayName)} />
                <span className="brand-wordmark-copy"><strong>{displayName}</strong><small>производитель</small></span>
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="brand-sections">
          <aside>
            <p className="eyebrow">Проверенные сведения</p>
            <ul className="brand-facts">
              <li><span>Бренд</span><strong>{profile?.officialName ?? displayName}</strong></li>
              {profile?.country && <li><span>Происхождение бренда</span><strong>{profile.country}</strong></li>}
              {profile?.headquarters && <li><span>Штаб-квартира</span><strong>{profile.headquarters}</strong></li>}
              {profile?.foundedYear && <li><span>Основан</span><strong>{profile.foundedYear}</strong></li>}
              {profile?.parentCompany && <li><span>Группа</span><strong>{profile.parentCompany}</strong></li>}
              <li><span>Статус страницы</span><strong>{readiness === "BRAND_SAFE" ? "Источник подтверждён" : "Сведения уточняются"}</strong></li>
            </ul>
            {profile && (
              <a className="brand-official-link" href={profile.officialWebsite} rel="noreferrer" target="_blank">
                Официальный сайт <span aria-hidden="true">↗</span>
              </a>
            )}
          </aside>
          <article className="content-card">
            <h2>О производителе</h2>
            {profile ? profile.fullDescription.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : (
              <p>Публичная карточка содержит только безопасные сведения для идентификации бренда. Подтверждённое описание и направления продукции будут добавлены после проверки официального источника.</p>
            )}

            {profile && profile.productCategories.length > 0 && (
              <section className="brand-knowledge-section">
                <h3>Основные направления продукции</h3>
                <div className="brand-tag-list">{profile.productCategories.map((item) => <span key={item}>{item}</span>)}</div>
              </section>
            )}
            {profile && (profile.productFamilies.length > 0 || profile.series.length > 0) && (
              <section className="brand-knowledge-section">
                <h3>Подтверждённые семейства и серии</h3>
                <div className="brand-tag-list">{[...profile.productFamilies, ...profile.series].map((item) => <span key={item}>{item}</span>)}</div>
                <p className="brand-scope-note">Принадлежность к семейству не подтверждает характеристики отдельной модели.</p>
              </section>
            )}
            {profile && profile.industries.length > 0 && (
              <section className="brand-knowledge-section">
                <h3>Области применения</h3>
                <p>{profile.industries.join(" · ")}</p>
              </section>
            )}
            {profile && (profile.officialCatalogs.length > 0 || profile.documentationSources.length > 0) && (
              <section className="brand-knowledge-section">
                <h3>Официальные каталоги и документация</h3>
                <ul className="brand-document-list">
                  {profile.officialCatalogs.map((url, index) => <li key={url}><a href={url} rel="noreferrer" target="_blank">Официальный каталог{profile.officialCatalogs.length > 1 ? ` ${index + 1}` : ""} ↗</a></li>)}
                  {profile.documentationSources.map((url, index) => <li key={url}><a href={url} rel="noreferrer" target="_blank">Техническая документация{profile.documentationSources.length > 1 ? ` ${index + 1}` : ""} ↗</a></li>)}
                </ul>
              </section>
            )}
          </article>
        </div>
      </section>

      <section className="section section-tint">
        <div className="shell brand-rfq-panel">
          <div><p className="eyebrow">Запрос поставки</p><h2>Поставка оборудования {displayName}</h2><p>Отправьте артикул, модель или спецификацию — проверим возможность поставки, цену и срок.</p></div>
          <RequestCta defaultProduct={displayName} requestContext={`Производитель: ${displayName}`} requestType="product" source="manufacturer_page">Отправить заявку</RequestCta>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading"><div><p className="eyebrow">Вопросы и ответы</p><h2>Как оформить запрос</h2></div></div>
        <div className="brand-faq-grid">
          {faq.map((item) => <article className="content-card" key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></article>)}
        </div>
        <p className="trademark-note">
          Товарный знак {displayName} принадлежит соответствующему правообладателю и используется для идентификации продукции. Страница не подтверждает статус официального дилера или представителя.
          {logo && <> <Link href="/manufacturers/logos">Источник логотипа</Link></>}
        </p>
      </section>

      {brandJsonLd && <script dangerouslySetInnerHTML={{ __html: serializeJsonLd(brandJsonLd) }} type="application/ld+json" />}
      <script dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }} type="application/ld+json" />
    </>
  );
}
