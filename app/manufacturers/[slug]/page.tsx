import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductArt } from "../../components/ProductArt";
import {
  formatCount,
  manufacturerBySlug,
  manufacturers,
  productImage,
  products,
} from "../../lib/catalog-data";

type BrandPageProps = {
  params: Promise<{ slug: string }>;
};

const specialBrands = {
  abb: {
    name: "ABB",
    country: "Международная группа",
    focus: "Электрификация, автоматизация и приводная техника",
    count: 0,
  },
};

export function generateStaticParams() {
  return [
    { slug: "abb" },
    ...manufacturers.map((manufacturer) => ({ slug: manufacturer.slug })),
  ];
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = slug === "abb" ? specialBrands.abb : manufacturerBySlug(slug);
  if (!brand) return {};
  return {
    title: `${brand.name} — оборудование и комплектующие`,
    description: `Подбор оборудования ${brand.name} по модели и артикулу. Проверка маркировки, совместимости и подготовка запроса на поставку.`,
  };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const brand = slug === "abb" ? specialBrands.abb : manufacturerBySlug(slug);
  if (!brand) notFound();

  const brandProducts = products.filter(
    (product) => product.manufacturerSlug === slug,
  );
  const initials = brand.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

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
            <span className="brand-monogram">{initials}</span>
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
            <h2>Как заказать {brand.name}</h2>
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
    </>
  );
}
