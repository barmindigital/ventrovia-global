import type { Metadata } from "next";
import Link from "next/link";
import { RevealOnScroll } from "../components/RevealOnScroll";

export const metadata: Metadata = {
  title: "О компании",
  description:
    "Международная торговая компания полного цикла: поиск промышленного оборудования, расчёты, таможенное оформление, логистика и контроль рисков.",
  alternates: { canonical: "/about" },
  openGraph: { url: "/about" },
};

const companyHistory = [
  {
    year: "2016",
    title: "Основание компании",
    description:
      "Компания «Индустрия Поставок» основана в Москве. Началось долгосрочное сотрудничество с китайскими поставщиками и заказчиками, а ежемесячный объём поставок стал увеличиваться более чем на 200 товарных единиц.",
  },
  {
    year: "2017",
    title: "Рост партнёрской сети",
    description:
      "Сеть партнёрских проектов вышла за пределы Москвы. Компания получила первые предложения об открытии офисов в других округах России, а объём поставок достиг 800 контейнеров в месяц.",
  },
  {
    year: "2018",
    title: "Филиалы в двух городах",
    description:
      "Открыты филиалы в Санкт-Петербурге и Владивостоке. Благодаря офису рядом с ключевыми маршрутами из Китая объём поставок превысил 2 000 контейнеров в месяц.",
  },
  {
    year: "2020",
    title: "Ребрендинг и аутсорсинг ВЭД",
    description:
      "Компания провела масштабный ребрендинг и сосредоточилась на комплексном аутсорсинге внешнеэкономической деятельности. Ежемесячно услугами компании пользовались около 50 партнёров и заказчиков.",
  },
  {
    year: "2022",
    title: "Выход на международный рынок",
    description:
      "Началась международная деятельность и открылся первый офис в Дубае, ОАЭ. Расширились профиль компании и объём выполняемых работ, а штат достиг 1 500 сотрудников.",
  },
  {
    year: "2025",
    title: "Государственные закупки",
    description:
      "Открыто новое направление по государственным закупкам промышленного оборудования и запасных частей. Заключены контракты с ГУП «Мосводосток», АО «Росатом Возобновляемая Энергия», ОАО «Омский аэропорт», ФГАУ «НМИЦ ЛРЦ» Минздрава России и другими организациями.",
  },
  {
    year: "2026",
    title: "Расширение международной сети",
    description:
      "Открыты новые филиалы в Турции и ОАЭ. Партнёрская сеть компании превысила 2 600 производителей промышленного оборудования и комплектующих.",
  },
] as const;

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
      <section className="section company-history-section">
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
            {companyHistory.map((event, index) => (
              <li className="company-timeline-item" key={event.year}>
                <RevealOnScroll className="company-timeline-reveal">
                  <article className="company-timeline-card">
                    <div className="company-timeline-meta">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <time dateTime={event.year}>{event.year}</time>
                    </div>
                    <h3>{event.title}</h3>
                    <p>{event.description}</p>
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
            <Link className="button button-primary specification-button" href="/contacts">
              Отправить спецификацию
            </Link>
          </article>
        </div>
      </section>
    </>
  );
}
