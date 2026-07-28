import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductArt } from "../../components/ProductArt";
import { brandLogoBySlug } from "../../lib/brand-logos";
import {
  formatCount,
  manufacturerBySlug,
  manufacturers,
  productImage,
  products,
} from "../../lib/catalog-data";
import {
  manufacturerMetaDescription,
  manufacturerOverview,
  serializeJsonLd,
  SITE_URL,
} from "../../lib/seo-content";

type BrandPageProps = {
  params: Promise<{ slug: string }>;
};

const specialBrands = {
  abb: {
    slug: "abb",
    name: "ABB",
    country: "Международная группа",
    focus: "Электрификация, автоматизация и приводная техника",
    count: 0,
  },
};

export function generateStaticParams() {
  return [
    { slug: "abb" },
    ...manufacturers
      .filter((manufacturer) => manufacturer.slug !== "abb")
      .map((manufacturer) => ({ slug: manufacturer.slug })),
  ];
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = slug === "abb" ? specialBrands.abb : manufacturerBySlug(slug);
  if (!brand) return {};
  const canonical = `/manufacturers/${slug}`;
  const shouldIndex = slug === "abb" || brand.count > 0;
  return {
    title: `${brand.name} — оборудование и комплектующие`,
    description: manufacturerMetaDescription(brand),
    alternates: { canonical },
    robots: {
      index: shouldIndex,
      follow: true,
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: `${brand.name} — оборудование и комплектующие`,
      description: manufacturerMetaDescription(brand),
    },
  };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const brand = slug === "abb" ? specialBrands.abb : manufacturerBySlug(slug);
  if (!brand) notFound();

  const brandProducts = products.filter(
    (product) => product.manufacturerSlug === slug,
  );
  const logo = brandLogoBySlug(slug);
  const overview = manufacturerOverview(brand);
  const brandUrl = `${SITE_URL}/manufacturers/${slug}`;
  const brandJsonLd = {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: brand.name,
    url: brandUrl,
    description: manufacturerMetaDescription(brand),
    logo: logo ? `${SITE_URL}${logo.src}` : undefined,
  };
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
                className="brand-wordmark-hero"
                role="img"
              >
                <strong>{brand.name}</strong>
                <small>производитель</small>
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
                <strong>Подбор по запросу</strong>
              </li>
            </ul>
          </aside>
          <article className="content-card">
            <h2>О бренде {brand.name}</h2>
            <p>{overview}</p>
            <h3>Ассортимент в каталоге</h3>
            <p>
              {brand.count > 0
                ? `В разделе доступно ${formatCount(brand.count)} позиций. Для поиска используйте полную модель, артикул или маркировку с корпуса — так можно отделить близкие по названию, но несовместимые исполнения.`
                : "Позиции этого производителя добавляются по мере проверки исходных данных. Уже сейчас можно отправить модель или фотографию маркировки для адресного поиска."}
            </p>
            <h3>Применение оборудования</h3>
            <p>
              Компоненты {brand.name} запрашивают для действующих
              производственных линий, ремонтного фонда, модернизации и новых
              инженерных проектов. Область применения конкретной позиции
              определяем по её документации и полному коду заказа.
            </p>
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
              <li>полный артикул и серийную маркировку;</li>
              <li>напряжение, мощность, тип подключения или интерфейс;</li>
              <li>количество, требуемый срок и город поставки;</li>
              <li>допустимость функционального аналога.</li>
            </ul>
            {slug === "abb" && (
              <>
                <h3>Основные направления ABB</h3>
                <p>
                  В запросах по ABB чаще всего встречаются компоненты
                  автоматизации, низковольтное оборудование, электроприводы и
                  элементы управления. Точную серию определяем по маркировке,
                  поскольку внешне похожие исполнения могут иметь разные
                  параметры.
                </p>
              </>
            )}
            <Link className="button button-primary" href={`/contacts?product=${encodeURIComponent(brand.name)}`}>
              Запросить оборудование
            </Link>
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
              <Link className="text-link" href={`/catalog?manufacturer=${slug}`}>
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
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(brandJsonLd) }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
        type="application/ld+json"
      />
    </>
  );
}
