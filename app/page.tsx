import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProductArt } from "./components/ProductArt";
import { RequestCta } from "./components/RequestCta";
import { RequestForm } from "./components/RequestForm";
import { RevealOnScroll } from "./components/RevealOnScroll";
import { ScrollHeroOrb } from "./components/ScrollHeroOrb";
import {
  categories,
  categoryImageBySlug,
  formatCount,
} from "./lib/catalog-data";
import { brandLogoBySlug } from "./lib/brand-logos";
import { renderHeadingLines, siteContent } from "./lib/site-content";
import { PRODUCT_CATALOG_PUBLIC_ENABLED } from "./lib/catalog-visibility";

const featuredManufacturers = [
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
  { slug: "xylem", name: "Xylem" },
];

const heroTrustItems = [
  "Договор и расчёты в рублях",
  "Поиск редких и снятых с производства позиций",
  "Оригинал или согласованный аналог",
  "Доставка по России и СНГ",
  "Персональный менеджер по всей сделке",
];

const pageContent = siteContent.pages.home;

export const metadata: Metadata = {
  title: pageContent.seoTitle,
  description: PRODUCT_CATALOG_PUBLIC_ENABLED
    ? pageContent.seoDescription
    : "Поставка промышленного оборудования по модели, артикулу или спецификации. Найдите производителя или отправьте заявку на адресный подбор.",
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: pageContent.seoTitle,
    description: PRODUCT_CATALOG_PUBLIC_ENABLED
      ? pageContent.seoDescription
      : "Поставка промышленного оборудования по модели, артикулу или спецификации. Найдите производителя или отправьте заявку на адресный подбор.",
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
              {renderHeadingLines(pageContent.heading).map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>
            <p className="hero-lead">{pageContent.intro}</p>
            <div className="hero-links">
              <Link className="button button-primary" href="/manufacturers">
                Найти производителя
              </Link>
              <RequestCta
                className="button button-outline"
                source="hero_home"
              />
            </div>
          </div>
          <div className="hero-visual" aria-label="Объёмная планета в фирменных цветах">
            <ScrollHeroOrb />
            <div className="hero-badge">
              <span>Подбор оборудования</span>
              <strong>По модели, артикулу или спецификации</strong>
            </div>
          </div>
        </div>
        <div className="hero-trust-shell">
          <ul className="hero-trust" aria-label="Условия поставки">
            {heroTrustItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section services-section" id="services">
        <div className="shell">
          <div className="section-heading services-heading">
            <div>
              <p className="eyebrow">Полный цикл или отдельный этап</p>
              <h2>Услуги</h2>
              <p className="section-intro">
                Можно передать нам всю поставку под ключ или подключить команду
                на конкретном этапе: от поиска позиции до доставки на ваш
                объект.
              </p>
            </div>
          </div>
          <div className="service-points-grid service-cards">
            <article><span>01</span><h3>Поиск и проверка</h3><p>Находим оригинальный товар и проверяем поставщика.</p></article>
            <article><span>02</span><h3>Оплата и документы</h3><p>Организуем расчёты, декларирование и сертификацию.</p></article>
            <article><span>03</span><h3>Логистика</h3><p>Строим подходящий маршрут и контролируем сроки.</p></article>
            <article><span>04</span><h3>Поставка под ключ</h3><p>Координируем весь цикл и отвечаем за результат.</p></article>
          </div>
        </div>
      </section>

      {PRODUCT_CATALOG_PUBLIC_ENABLED ? (
        <section className="section shell" id="catalog">
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
                href={`/catalog/category/${category.slug}`}
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
      ) : (
        <section className="section shell" id="catalog">
          <div className="company-intro">
            <div>
              <p className="eyebrow">Адресный подбор</p>
              <h2>Найдём оборудование по вашей маркировке</h2>
            </div>
            <div>
              <p>
                Пришлите производителя, модель, артикул или спецификацию. Мы
                проверим исполнение и возможность поставки до подготовки
                предложения.
              </p>
              <div className="company-actions">
                <Link className="text-link" href="/manufacturers">
                  Найти производителя <span aria-hidden="true">→</span>
                </Link>
                <RequestCta
                  className="button button-outline"
                  source="catalog_help"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section shell" id="about">
        <div className="company-intro">
          <div>
            <p className="eyebrow">О компании</p>
            <h2>
              <span>Международная торговая</span>
              <span>компания полного цикла</span>
            </h2>
          </div>
          <div>
            <p>
              Профессиональный интегратор между заказчиком и глобальным рынком.
              Мы берём на себя этапы сделки: от поиска труднодоступного
              оборудования до доставки, таможенного оформления и контроля
              рисков. Каждый заказ формируется под потребность клиента.
            </p>
            <div className="company-actions">
              <Link className="text-link" href="/about">
                Подробнее о компании <span aria-hidden="true">→</span>
              </Link>
              <a
                className="button button-outline"
                download
                href="/documents/industriya-postavok-presentation.pdf"
              >
                Скачать презентацию
              </a>
            </div>
          </div>
        </div>
        <RevealOnScroll className="business-stats company-facts" stagger>
          <Link href="/about#history"><strong>10+</strong><span>лет работы компании</span></Link>
          {PRODUCT_CATALOG_PUBLIC_ENABLED ? (
            <Link href="/catalog"><strong>156 000+</strong><span>доступных позиций</span></Link>
          ) : (
            <Link href="#request"><strong>RFQ</strong><span>подбор по спецификации</span></Link>
          )}
          <Link href="/manufacturers"><strong>2 800+</strong><span>производителей в базе</span></Link>
          <Link href="#geography"><strong>60+</strong><span>стран в географии работы</span></Link>
        </RevealOnScroll>
        <div className="geography-panel" id="geography">
          <div>
            <p className="eyebrow">География</p>
            <h3>Международная сеть поставок</h3>
            <p>
              Работаем с поставщиками и логистическими партнёрами в разных
              регионах мира. Карта показывает общий международный охват, а
              конкретный маршрут подтверждаем для каждой заявки.
            </p>
          </div>
          <Image
            alt="Схема международной географии поставок"
            height={941}
            src="/images/company/international-reach-map.png"
            unoptimized
            width={1672}
          />
        </div>
      </section>

      <section className="section shell" id="manufacturers">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Поставки по всему миру</p>
            <h2>Работаем с ведущими мировыми производителями</h2>
            <p className="section-intro">
              Подбираем промышленное оборудование, запасные части, насосы,
              электродвигатели, редукторы, лабораторное оборудование и
              автоматику по точной маркировке.
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

      <section className="section shell" id="request">
        <div className="process-panel request-process-panel">
          <div className="process-form-column">
            <p className="eyebrow eyebrow-light">Заявка на поставку</p>
            <h2>Расскажите, что нужно поставить</h2>
            <p>
              Укажите модель или приложите спецификацию. Если точной маркировки
              нет, опишите задачу — поможем собрать исходные данные.
            </p>
            <RequestForm compact source="home_bottom" />
          </div>
        </div>
      </section>
    </>
  );
}
