import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { RevealOnScroll } from "../components/RevealOnScroll";
import { RequestCta } from "../components/RequestCta";
import { renderHeadingLines, siteContent } from "../lib/site-content";

const pageContent = siteContent.pages.about;

export const metadata: Metadata = {
  title: pageContent.seoTitle,
  description: pageContent.seoDescription,
  alternates: { canonical: "/about" },
  openGraph: {
    title: pageContent.seoTitle,
    description: pageContent.seoDescription,
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <div className="breadcrumbs">
            <Link href="/">Главная</Link><span>/</span><span>О компании</span>
          </div>
          <p className="eyebrow">{pageContent.eyebrow}</p>
          <h1>
            {renderHeadingLines(pageContent.heading).map((line, index, lines) => (
              <Fragment key={line}>
                {line}
                {index < lines.length - 1 && <br />}
              </Fragment>
            ))}
          </h1>
          <p>{pageContent.intro}</p>
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
      <section className="section company-history-section" id="history">
        <div className="shell">
          <div className="company-history-heading">
            <div>
              <p className="eyebrow">2016–2026</p>
              <h2>История компании</h2>
            </div>
            <p>
              От первых поставок из Китая до международной сети и комплексного
              снабжения промышленным оборудованием.
            </p>
          </div>
          <ol className="company-timeline" aria-label="История компании по годам">
            {siteContent.companyHistory.map((event, index) => (
              <li className="company-timeline-item" key={event.year}>
                <RevealOnScroll className="company-timeline-reveal">
                  <article className="company-timeline-card">
                    <div className="company-timeline-meta">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <time dateTime={event.year}>{event.year} год</time>
                    </div>
                    <p>{event.text}</p>
                  </article>
                </RevealOnScroll>
              </li>
            ))}
          </ol>
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
            <div className="company-actions specification-button">
              <RequestCta />
              <a
                className="button button-outline"
                download
                href="/documents/industriya-postavok-presentation.pdf"
              >
                Скачать презентацию
              </a>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
