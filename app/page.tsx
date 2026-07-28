import type { Metadata } from "next";
import Link from "next/link";
import { ProductArt } from "./components/ProductArt";
import {
  categories,
  categoryImageBySlug,
  manufacturers,
  products,
  productImage,
  formatCount,
} from "./lib/catalog-data";

export const metadata: Metadata = {
  title: "Глобальные промышленные закупки и оборудование",
  description:
    "Международная торговая компания полного цикла: поиск промышленного оборудования, оплата, таможенное оформление, логистика и доставка.",
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Глобальные промышленные закупки</p>
            <h1>
              Ваш надежный партнёр
              <br />
              в сфере глобальных
              <br />
              промышленных закупок
            </h1>
            <p className="hero-lead">
              От поиска товара до доставки — берём всё на себя. Находим
              проверенных поставщиков, контролируем качество, организуем оплату
              инвойсов, логистику и таможенное оформление.
            </p>
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
          <div className="hero-visual" aria-label="Абстрактная композиция в фирменных цветах">
            <div className="hero-orb">
              <span className="hero-tile hero-tile-one" />
              <span className="hero-tile hero-tile-two" />
              <span className="hero-tile hero-tile-three" />
              <span className="hero-ring" />
            </div>
            <div className="hero-badge">
              <span>Точный поиск</span>
              <strong>по 115 370 артикулам</strong>
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
          <div><strong>156 917</strong><span>товарных позиций</span></div>
          <div><strong>2 806</strong><span>производителей</span></div>
          <div><strong>28</strong><span>направлений</span></div>
          <div><strong>115 370</strong><span>точных идентификаторов</span></div>
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
        <div className="business-stats" aria-label="Компания в цифрах">
          <div><strong>10+</strong><span>лет на рынке промышленного оборудования</span></div>
          <div><strong>200</strong><span>тендеров в день</span></div>
          <div><strong>30%</strong><span>маржинальности по сделкам</span></div>
          <div><strong>13</strong><span>сделок в квартал</span></div>
          <div><strong>60+</strong><span>стран мира, в которых мы работаем</span></div>
        </div>
      </section>

      <section className="section section-tint">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Проверенные данные</p>
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
          <Link className="brand-chip brand-featured" href="/manufacturers/abb">ABB</Link>
          {manufacturers.slice(0, 7).map((brand) => (
            <Link className="brand-chip" href={`/manufacturers/${brand.slug}`} key={brand.slug}>
              {brand.name}
            </Link>
          ))}
          {["Kaeser", "Honeywell", "Andritz", "JOEST", "Flottweg", "Bronswerk", "Auma", "Volpak", "RTP POWER"].map((brand) => (
            <span className="brand-chip" key={brand}>{brand}</span>
          ))}
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
          <div className="projects-grid">
            <article><span>Энергетика</span><h3>АО «Росатом Возобновляемая энергия»</h3><p>Ветроэнергетика и возобновляемые источники энергии.</p></article>
            <article><span>Инфраструктура</span><h3>ГУП «Мосводосток»</h3><p>Водоснабжение и водоотведение Москвы.</p></article>
            <article><span>Авиация</span><h3>ОАО «Омский аэропорт»</h3><p>Авиационная инфраструктура и наземное обслуживание.</p></article>
            <article><span>Медицина</span><h3>ФГАУ «НМИЦ ЛРЦ Минздрава России»</h3><p>Федеральный медицинский исследовательский центр.</p></article>
          </div>
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
