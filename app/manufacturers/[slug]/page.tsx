import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProductArt } from "../../components/ProductArt";
import { RequestCta } from "../../components/RequestCta";
import { brandLogoBySlug } from "../../lib/brand-logos";
import { brandInitials, brandWordmarkTone } from "../../lib/brand-wordmark";
import {
  formatCount,
  manufacturerBySlug,
  manufacturers,
  productImage,
  productsByManufacturerSlug,
} from "../../lib/catalog-data";
import {
  canonicalManufacturerSlug,
  legacyManufacturerSlugsFor,
} from "../../lib/manufacturer-normalization";
import {
  manufacturerEditorialFor,
  manufacturerMetaDescription,
  serializeJsonLd,
  SITE_URL,
} from "../../lib/seo-content";
import { applySeoTemplate, siteContent } from "../../lib/site-content";

type BrandPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  const slugs = manufacturers.flatMap((manufacturer) => [
    manufacturer.slug,
    ...legacyManufacturerSlugsFor(manufacturer.slug),
  ]);
  return Array.from(new Set(slugs)).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = manufacturerBySlug(slug);
  if (!brand) return {};
  const canonical = `/manufacturers/${brand.slug}`;
  const shouldIndex =
    brand.verificationStatus === "verified" && brand.count > 0;
  const templateValues = {
    name: brand.name,
    slug: brand.slug,
    count: brand.count,
    country: brand.country,
  };
  const title = applySeoTemplate(
    siteContent.templates.manufacturerTitle,
    templateValues,
  );
  const description =
    applySeoTemplate(
      siteContent.templates.manufacturerDescription,
      templateValues,
    ) || manufacturerMetaDescription(brand);
  return {
    title,
    description,
    alternates: { canonical },
    robots: {
      index: shouldIndex,
      follow: true,
    },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
    },
  };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const canonicalSlug = canonicalManufacturerSlug(slug);
  if (canonicalSlug !== slug) redirect(`/manufacturers/${canonicalSlug}`);
  const brand = manufacturerBySlug(slug);
  if (!brand) notFound();

  const brandProducts = productsByManufacturerSlug(brand.slug);
  const logo = brandLogoBySlug(brand.slug);
  const editorial = manufacturerEditorialFor(brand);
  const brandUrl = `${SITE_URL}/manufacturers/${brand.slug}`;
  const brandDescription =
    applySeoTemplate(siteContent.templates.manufacturerDescription, {
      name: brand.name,
      slug: brand.slug,
      count: brand.count,
      country: brand.country,
    }) || manufacturerMetaDescription(brand);
  const brandJsonLd = brand.verificationStatus === "verified" ? {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: brand.name,
    url: brandUrl,
    description: brandDescription,
    logo: logo ? `${SITE_URL}${logo.src}` : undefined,
  } : null;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Главная",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Производители",
        item: `${SITE_URL}/manufacturers`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: brand.name,
        item: brandUrl,
      },
    ],
  };

  return (
    <>
      <section className="page-hero">
        <div className="shell brand-hero">
          <div>
            <div className="breadcrumbs">
              <Link href="/">Главная</Link><span>/</span>
              <Link href="/manufacturers">Производители</Link><span>/</span>
              <span>{brand.name}</span>
            </div>
            <p className="eyebrow">Производитель</p>
            <h1>{brand.name}</h1>
            <p>
              Подбор оборудования {brand.name} по точной модели, артикулу или
              маркировке с шильдика. Страница и тексты подготовлены специально
              для этого каталога.
            </p>
          </div>
          <div className="brand-visual" aria-label={`Иллюстрация раздела ${brand.name}`} role="img">
            <Image
              alt=""
              height={900}
              priority
              src="/images/brands/global-sourcing-cover.webp"
              unoptimized
              width={1600}
            />
            {logo ? (
              <span className="brand-hero-logo">
                <Image
                  alt={`${brand.name} — логотип производителя`}
                  height={150}
                  src={logo.src}
                  unoptimized
                  width={360}
                />
              </span>
            ) : (
              <span
                aria-label={`Текстовая карточка производителя ${brand.name}`}
                className={`brand-wordmark-hero ${brandWordmarkTone(brand.slug)}`}
                role="img"
              >
                <span
                  aria-hidden="true"
                  className="brand-wordmark-initials"
                  data-initials={brandInitials(brand.name)}
                />
                <span className="brand-wordmark-copy">
                  <strong>{brand.name}</strong>
                  <small>производитель</small>
                </span>
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="brand-sections">
          <aside>
            <p className="eyebrow">Кратко о разделе</p>
            <ul className="brand-facts">
              <li><span>Бренд</span><strong>{brand.name}</strong></li>
              <li><span>Регион</span><strong>{brand.country ?? "Международный рынок"}</strong></li>
              <li>
                <span>Позиций в базе</span>
                <strong>
                  {"count" in brand && brand.count > 0
                    ? formatCount(brand.count)
                    : "на верификации"}
                </strong>
              </li>
              <li>
                <span>Статус</span>
                <strong>
                  {brand.verificationStatus === "verified"
                    ? "Проверено редакцией"
                    : "Требует проверки"}
                </strong>
              </li>
            </ul>
          </aside>
          <article className="content-card">
            <h2>О бренде {brand.name}</h2>
            <p>{editorial.overview}</p>
            <h3>Ассортимент в каталоге</h3>
            <p>{editorial.assortment}</p>
            <h3>Применение оборудования</h3>
            <p>{editorial.applications}</p>
            <h3>Подбор и заказ</h3>
            <p>
              Для уверенного подбора укажите полную модель и артикул. Если
              маркировка повреждена, приложите фото шильдика и опишите узел,
              в котором установлено оборудование. Это помогает исключить
              похожие исполнения с другими электрическими или механическими
              параметрами.
            </p>
            <h3>Что желательно указать</h3>
            <ul>
              {editorial.selection.map((item) => (
                <li key={item}>{item};</li>
              ))}
            </ul>
            {editorial.sourceUrl && (
              <p className="editorial-source">
                Справочная информация подготовлена по открытому{" "}
                <a
                  href={editorial.sourceUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  каталогу производителя
                </a>
                .
              </p>
            )}
            <RequestCta
              className="button button-primary content-card-cta"
              defaultProduct={brand.name}
              requestContext={`Производитель: ${brand.name}`}
              requestType="product"
              source="manufacturer_page"
            />
          </article>
        </div>
        <p className="trademark-note">
          Товарный знак {brand.name} принадлежит соответствующему
          правообладателю и используется для идентификации продукции. Страница
          не подтверждает статус официального дилера или представителя.
          {logo && (
            <>
              {" "}
              <Link href="/manufacturers/logos">Источник логотипа</Link>
            </>
          )}
        </p>
      </section>

      {brandProducts.length > 0 && (
        <section className="section section-tint">
          <div className="shell">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Позиции витрины</p>
                <h2>{brand.name} в каталоге</h2>
              </div>
              <Link className="text-link" href={`/catalog?manufacturer=${brand.slug}`}>
                Все позиции <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="product-grid">
              {brandProducts.map((product, index) => (
                <article className="product-card" key={product.slug}>
                  <Link href={`/catalog/${product.slug}`}>
                    <ProductArt
                      imageSrc={productImage(product)}
                      label={product.name}
                      tone={index}
                    />
                  </Link>
                  <div className="product-card-body">
                    <p className="product-brand">{product.manufacturer}</p>
                    <h3><Link href={`/catalog/${product.slug}`}>{product.name}</Link></h3>
                    <Link className="button button-outline" href={`/catalog/${product.slug}`}>
                      Подробнее
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
      {brandJsonLd && (
        <script
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(brandJsonLd) }}
          type="application/ld+json"
        />
      )}
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
        type="application/ld+json"
      />
    </>
  );
}
