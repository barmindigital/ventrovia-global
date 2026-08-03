import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { ProductArt } from "./components/ProductArt";
import { RevealOnScroll } from "./components/RevealOnScroll";
import { ScrollHeroOrb } from "./components/ScrollHeroOrb";
import {
  categories,
  categoryImageBySlug,
  products,
  productImage,
  formatCount,
} from "./lib/catalog-data";
import { brandLogoBySlug } from "./lib/brand-logos";
import { renderHeadingLines, siteContent } from "./lib/site-content";

const featuredManufacturers = [
  { slug: "abb", name: "ABB" },
  { slug: "siemens", name: "Siemens" },
  { slug: "schneider-electric", name: "Schneider Electric" },
  { slug: "bosch-rexroth", name: "Bosch Rexroth" },
  { slug: "festo", name: "Festo" },
  { slug: "skf", name: "SKF" },
  { slug: "danfoss", name: "Danfoss" },
  { slug: "honeywell", name: "Honeywell" },
  { slug: "emerson-industrial", name: "Emerson" },
  { slug: "yokogawa", name: "Yokogawa" },
  { slug: "endress-hauser", name: "Endress+Hauser" },
  { slug: "parker-hannifin-gmbh", name: "Parker Hannifin" },
  { slug: "atlas-copco", name: "Atlas Copco" },
  { slug: "grundfos", name: "Grundfos" },
  { slug: "sew-eurodrive", name: "SEW-Eurodrive" },
  { slug: "fanuc", name: "FANUC" },
  { slug: "yaskawa", name: "Yaskawa" },
  { slug: "rockwell-automation", name: "Rockwell Automation" },
  { slug: "weg", name: "WEG" },
  { slug: "sick-ag", name: "SICK" },
];

const pageContent = siteContent.pages.home;

export const metadata: Metadata = {
  title: pageContent.seoTitle,
  description: pageContent.seoDescription,
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: pageContent.seoTitle,
    description: pageContent.seoDescription,
  },
};

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">{pageContent.eyebrow}</p>
            <h1>
              {renderHeadingLines(pageContent.heading).map((line, index) => (
                <Fragment key={`${line}-${index}`}>
                  {index > 0 ? <br /> : null}
                  {line}
                </Fragment>
              ))}
            </h1>
            <p className="hero-lead">{pageContent.intro}</p>
            <form className="hero-search" action="/catalog">
              <label className="sr-only" htmlFor="hero-query">
                Поиск по каталогу
              </label>
              <input
                id="hero-query"
                name="q"
                placeholder="Введите артикул, модель или производителя"
              />
              <button type="submit">Найти</button>
            </form>
            <div className="hero-links">
              <Link className="button button-primary" href="/catalog">
                Открыть каталог
              </Link>
              <Link className="text-link" href="/contacts">
                Запросить подбор <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
          <div className="hero-visual" aria-label="Объёмная планета в фирменных цветах">
            <ScrollHeroOrb />
            <div className="hero-badge">
              <span>Каталог оборудования</span>
              <strong>Более 156 000 позиций</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="service-points" aria-label="Наши услуги">
        <div className="shell service-points-grid">
          <div><span>01</span><p>Поиск оригинального товара и надежного поставщика</p></div>
          <div><span>02</span><p>Таможенное оформление, декларирование и сертификация товара</p></div>
          <div><span>03</span><p>Доставка товара без нарушения сроков</p></div>
          <div><span>04</span><p>Построение выгодного и быстрого логистического маршрута</p></div>
        </div>
      </section>

      <section className="stats-bar" aria-label="Каталог в цифрах">
        <div className="shell stats-grid">
          <div><strong>Более 156 000</strong><span>товарных позиций</span></div>
          <div><strong>Более 2 800</strong><span>производителей</span></div>
          <div><strong>28</strong><span>направлений</span></div>
          <div><strong>Под запрос</strong><span>подбор по точной маркировке</span></div>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Основные направления</p>
            <h2>Каталог оборудования</h2>
          </div>
          <Link className="text-link" href="/catalog">
            Все категории <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="category-grid">
          {categories.slice(0, 8).map((category, index) => (
            <Link
              className={`category-card category-tone-${(index % 4) + 1}`}
              href={`/catalog?category=${category.slug}`}
              key={category.slug}
            >
              <ProductArt
                compact
                imageSrc={categoryImageBySlug(category.slug)}
                label={category.name}
                tone={index % 4}
              />
              <span className="category-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{category.name}</h3>
              <p>{formatCount(category.count)} позиций</p>
              <span className="round-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section shell">
        <div className="company-intro">
          <div>
            <p className="eyebrow">О компании</p>
            <h2>Международная торговая компания полного цикла</h2>
          </div>
          <div>
            <p>
              Профессиональный интегратор между заказчиком и глобальным рынком.
              Мы берём на себя все этапы сделки: от поиска труднодоступного
              оборудования до его доставки, таможенного оформления и финальных
              рисков. Мы находим то, чего нет в свободном доступе. Каждый заказ
              — строго под потребность клиента, без складских остатков и лишних
              издержек.
            </p>
            <Link className="text-link" href="/about">
              Подробнее о компании <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <RevealOnScroll
          className="business-stats"
          stagger
        >
          <div><strong>10+</strong><span>лет на рынке промышленного оборудования</span></div>
          <div><strong>200</strong><span>тендеров в день</span></div>
          <div><strong>30%</strong><span>маржинальности по сделкам</span></div>
          <div><strong>13</strong><span>сделок в квартал</span></div>
          <div><strong>60+</strong><span>стран мира, в которых мы работаем</span></div>
        </RevealOnScroll>
      </section>

      <section className="section section-tint">
        <div className="shell">
          <div className="section-heading">
            <div>
              <h2>Популярные позиции</h2>
            </div>
            <Link className="text-link" href="/catalog">
              Смотреть витрину <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="product-grid">
            {products.slice(0, 4).map((product, index) => (
              <article className="product-card" key={product.slug}>
                <Link className="product-art-link" href={`/catalog/${product.slug}`}>
                  <ProductArt
                    imageSrc={productImage(product)}
                    label={product.name}
                    tone={index}
                  />
                </Link>
                <div className="product-card-body">
                  <p className="product-brand">{product.manufacturer}</p>
                  <h3>
                    <Link href={`/catalog/${product.slug}`}>{product.name}</Link>
                  </h3>
                  <dl className="product-meta">
                    <div><dt>Модель</dt><dd>{product.model}</dd></div>
                    <div><dt>Раздел</dt><dd>{product.subcategory}</dd></div>
                  </dl>
                  <Link className="button button-outline" href={`/catalog/${product.slug}`}>
                    Подробнее
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Поставки по всему миру</p>
            <h2>Работаем с ведущими мировыми производителями</h2>
            <p className="section-intro">
              Осуществляем поставки промышленного оборудования и запасных
              частей, компрессорного оборудования, генераторов, насосов,
              электродвигателей, редукторов, лабораторного оборудования,
              промышленной автоматики и другого оборудования ведущих мировых
              производителей.
            </p>
          </div>
          <Link className="text-link" href="/manufacturers">
            Все производители <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="brand-cloud">
          {featuredManufacturers.map((brand) => {
            const logo = brandLogoBySlug(brand.slug);
            return (
              <Link
                className="brand-chip brand-chip-logo"
                href={`/manufacturers/${brand.slug}`}
                key={brand.slug}
              >
                {logo ? (
                  <Image
                    alt={`${brand.name} — логотип производителя`}
                    height={72}
                    loading="lazy"
                    src={logo.src}
                    unoptimized
                    width={180}
                  />
                ) : (
                  <strong>{brand.name}</strong>
                )}
                <span>{brand.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section section-tint">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Опыт поставок</p>
              <h2>Реализованные проекты</h2>
              <p className="section-intro">
                Среди наших заказчиков — государственные корпорации,
                инфраструктурные предприятия и федеральные медицинские центры.
              </p>
            </div>
          </div>
          <RevealOnScroll className="projects-grid" stagger>
            <article><span>Энергетика</span><h3>АО «Росатом Возобновляемая энергия»</h3><p>Ветроэнергетика и возобновляемые источники энергии.</p></article>
            <article><span>Инфраструктура</span><h3>ГУП «Мосводосток»</h3><p>Водоснабжение и водоотведение Москвы.</p></article>
            <article><span>Авиация</span><h3>ОАО «Омский аэропорт»</h3><p>Авиационная инфраструктура и наземное обслуживание.</p></article>
            <article><span>Медицина</span><h3>ФГАУ «НМИЦ ЛРЦ Минздрава России»</h3><p>Федеральный медицинский исследовательский центр.</p></article>
          </RevealOnScroll>
        </div>
      </section>

      <section className="section shell">
        <div className="process-panel">
          <div>
            <p className="eyebrow eyebrow-light">Ключевой фокус</p>
            <h2>Работаем под конкретный спрос</h2>
            <p>
              Каждая закупка запускается под конкретный тендер или прямой запрос
              — без лишних складских рисков.
            </p>
            <Link className="button button-light" href="/contacts">
              Обсудить задачу
            </Link>
          </div>
          <ol className="process-list">
            <li><span>01</span><div><strong>Одна точка ответственности</strong><p>Коммерческий отдел сопровождает сделку и координирует все внутренние подразделения.</p></div></li>
            <li><span>02</span><div><strong>Собственный платёжный контур</strong><p>Финлогистика обеспечивает расчёты с иностранными поставщиками без посредников.</p></div></li>
            <li><span>03</span><div><strong>Фокус на сложном импорте</strong><p>Работаем с товарами, где важны поиск, экспертиза и проверенные каналы поставки.</p></div></li>
          </ol>
        </div>
      </section>
    </>
  );
}
