import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "О компании",
  description:
    "Подход к комплектации предприятий: точная идентификация позиции, проверка совместимости и единая работа со спецификацией.",
};

export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <div className="breadcrumbs">
            <Link href="/">Главная</Link><span>/</span><span>О компании</span>
          </div>
          <p className="eyebrow">Промышленная комплектация</p>
          <h1>Сначала точность,<br />потом скорость</h1>
          <p>
            Мы строим каталог вокруг технической идентификации: модель,
            артикул, производитель, назначение и контекст применения.
          </p>
        </div>
      </section>
      <section className="section shell">
        <div className="content-grid">
          <article className="value-card">
            <span>01</span>
            <h2>Единая спецификация</h2>
            <p>Собираем позиции разных категорий и брендов в один понятный запрос.</p>
          </article>
          <article className="value-card">
            <span>02</span>
            <h2>Проверка маркировки</h2>
            <p>Отделяем точный артикул от описания и фиксируем спорные параметры до заказа.</p>
          </article>
          <article className="value-card">
            <span>03</span>
            <h2>Честная публикация</h2>
            <p>Не выдаём иллюстрацию категории за фотографию конкретного оборудования.</p>
          </article>
        </div>
      </section>
      <section className="section section-tint">
        <div className="shell brand-sections">
          <div>
            <p className="eyebrow">Система данных</p>
            <h2>Каталог, готовый к масштабу</h2>
          </div>
          <article className="content-card">
            <p>
              Рабочая база включает 156 917 товарных позиций, 28 основных
              направлений и 2 806 производителей. Для 115 370 записей выделен
              точный идентификатор, по которому можно строить качественный поиск
              и постепенно открывать SEO-страницы после проверки.
            </p>
            <p>
              Тексты интерфейса и описания созданы специально для проекта.
              Изображения оборудования подключаются только при понятном
              источнике и подтверждённом соответствии модели.
            </p>
            <Link className="button button-primary" href="/contacts">
              Отправить спецификацию
            </Link>
          </article>
        </div>
      </section>
    </>
  );
}
