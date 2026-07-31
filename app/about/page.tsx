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
    description:
      "Основание компании «Индустрия Поставок» в Москве, начало большого партнерства с китайскими поставщиками и заказчиками. Мы являемся одними из первопроходцев сотрудничества с Китаем, с каждым месяцев объем поставляемых контейнеров увеличивается более чем на 200 единиц товара.",
  },
  {
    year: "2017",
    description:
      "Сеть наших партнерских проектов растет. К нам поступают предложения открыть офисы нашей компании в других округах России. Объем контейнеров увеличивается до 800 штук в месяц.",
  },
  {
    year: "2018",
    description:
      "«Индустрия поставок» открывает филиалы в Санкт-Петербурге, Владивостоке. Объем контейнеров увеличивается от 2000 штук в месяц за счет близкого к Китаю офиса во Владивостоке.",
  },
  {
    year: "2020",
    description:
      "Большой ребрендинг компании. Индустрия Поставок перепрофилируется в аутсорс ВЭД. Количество наших партнеров и заказчиков составляет 50 компаний в месяц.",
  },
  {
    year: "2022",
    description:
      "Начало международной деятельности, открытие первого офиса в Дубае, ОАЭ. Профиль компании и объем работ увеличивается. Штат сотрудников насчитывает 1500 человек.",
  },
  {
    year: "2025",
    description:
      "Открытие нового направления в сфере государственных закупок промышленного оборудования и запасных частей к нему. Заключение контрактов с такими компаниями как ГУП «Мосводосток», АО «Росатом Возобновляемая Энергия», ОАО «Омский аэропорт», ФГАУ «НМИЦ ЛРЦ Минздрава России» и другие.",
  },
  {
    year: "2026",
    description:
      "Расширение международной сети, открытие новых филиалов в Турции и ОАЭ. Работа более чем с 2600 производителями.",
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
                      <time dateTime={event.year}>{event.year} год</time>
                    </div>
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
