import type { Metadata } from "next";
import Link from "next/link";
import { ProductArt } from "./components/ProductArt";
import { categories, manufacturers, products, formatCount } from "./lib/catalog-data";

export const metadata: Metadata = {
  title: "Промышленное оборудование и комплектующие",
  description:
    "Каталог промышленного оборудования: гидравлика, насосы, электродвигатели, датчики, автоматика и запчасти. Подбор по артикулу и модели.",
};

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Поставки для промышленности</p>
            <h1>
              Всё необходимое
              <br />
              для производства
            </h1>
            <p className="hero-lead">
              Находим оборудование и комплектующие по модели, артикулу или
              техническому описанию. Проверяем совместимость и готовим
              предложение под вашу задачу.
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
              <ProductArt tone={index % 4} compact />
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
                  <ProductArt tone={index} label={product.manufacturer} />
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
            <p className="eyebrow">Производители</p>
            <h2>Подбор по бренду</h2>
          </div>
          <Link className="text-link" href="/manufacturers">
            Все производители <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="brand-cloud">
          <Link className="brand-chip brand-featured" href="/manufacturers/abb">ABB</Link>
          {manufacturers.slice(0, 11).map((brand) => (
            <Link className="brand-chip" href={`/manufacturers/${brand.slug}`} key={brand.slug}>
              {brand.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="section shell">
        <div className="process-panel">
          <div>
            <p className="eyebrow eyebrow-light">Как мы работаем</p>
            <h2>От запроса до поставки — прозрачно</h2>
            <p>
              Один запрос может включать позиции разных брендов. Мы сверяем
              маркировку, уточняем исполнение и объединяем поставку.
            </p>
            <Link className="button button-light" href="/contacts">
              Обсудить задачу
            </Link>
          </div>
          <ol className="process-list">
            <li><span>01</span><div><strong>Получаем спецификацию</strong><p>Артикул, модель, фото шильдика или техническое описание.</p></div></li>
            <li><span>02</span><div><strong>Проверяем соответствие</strong><p>Уточняем производителя, исполнение и совместимость.</p></div></li>
            <li><span>03</span><div><strong>Готовим предложение</strong><p>Фиксируем состав, сроки и условия поставки.</p></div></li>
          </ol>
        </div>
      </section>
    </>
  );
}
