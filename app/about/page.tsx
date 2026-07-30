import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "О компании",
  description:
    "Международная торговая компания полного цикла: поиск промышленного оборудования, расчёты, таможенное оформление, логистика и контроль рисков.",
  alternates: { canonical: "/about" },
  openGraph: { url: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <div className="breadcrumbs">
            <Link href="/">Главная</Link><span>/</span><span>О компании</span>
          </div>
          <p className="eyebrow">Поставки полного цикла</p>
          <h1>Международная торговая<br />компания полного цикла</h1>
          <p>
            Профессиональный интегратор между заказчиком и глобальным рынком.
            Мы берём на себя все этапы сделки: от поиска труднодоступного
            оборудования до его доставки, таможенного оформления и финальных
            рисков.
          </p>
        </div>
      </section>
      <section className="section shell">
        <div className="content-grid">
          <article className="value-card">
            <span>01</span>
            <h2>Работа под спрос</h2>
            <p>Каждая закупка запускается под конкретный тендер или прямой запрос — без лишних складских рисков.</p>
          </article>
          <article className="value-card">
            <span>02</span>
            <h2>Прозрачная экономика</h2>
            <p>Цена складывается из понятных компонентов: товар, логистика, таможня, платежи и документы.</p>
          </article>
          <article className="value-card">
            <span>03</span>
            <h2>Контроль рисков</h2>
            <p>Юридические, финансовые и логистические риски проверяются до запуска каждой сделки.</p>
          </article>
        </div>
      </section>
      <section className="section section-tint">
        <div className="shell brand-sections">
          <div>
            <p className="eyebrow">Наш подход</p>
            <h2>Находим то, чего нет в свободном доступе</h2>
          </div>
          <article className="content-card">
            <p>
              Каждый заказ — строго под потребность клиента, без складских
              остатков и лишних издержек. Один запрос может включать позиции
              разных брендов: коммерческий отдел сопровождает сделку и
              координирует все внутренние подразделения.
            </p>
            <p>
              Собственный платёжный контур помогает организовать расчёты с
              иностранными поставщиками без посредников. Компания работает с
              товарами, где важны поиск, экспертиза и проверенные каналы
              поставки.
            </p>
            <Link className="button button-primary specification-button" href="/contacts">
              Отправить спецификацию
            </Link>
          </article>
        </div>
      </section>
    </>
  );
}
