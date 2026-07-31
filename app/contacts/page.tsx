import type { Metadata } from "next";
import Link from "next/link";
import { RequestForm } from "../components/RequestForm";

export const metadata: Metadata = {
  title: "Контакты и запрос на подбор оборудования",
  description:
    "Офис в Москве: БЦ «Центральный Ярд». Телефон +7 (495) 148-59-67, e-mail sales@industriapostavok.ru. Работаем по будням с 09:00 до 18:00.",
  alternates: { canonical: "/contacts" },
  openGraph: { url: "/contacts" },
};

type ContactsPageProps = {
  searchParams: Promise<{ product?: string }>;
};

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const { product = "" } = await searchParams;
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <div className="breadcrumbs">
            <Link href="/">Главная</Link><span>/</span><span>Запрос</span>
          </div>
          <p className="eyebrow">География бизнеса</p>
          <h1>Офис в Москве</h1>
          <p>
            г. Москва, ул. Бауманская, БЦ «Центральный Ярд», д. 7, стр. 1
          </p>
        </div>
      </section>
      <section className="section shell contact-layout">
        <aside className="contact-aside">
          <p className="eyebrow">Контакты</p>
          <h2>Свяжитесь с нами</h2>
          <div className="contact-lines">
            <a href="tel:+74951485967">+7 (495) 148-59-67</a>
            <a href="mailto:sales@industriapostavok.ru">sales@industriapostavok.ru</a>
          </div>
          <div className="contact-hours" aria-label="График работы">
            <strong>График работы</strong>
            <span>Понедельник–пятница: 09:00–18:00</span>
            <span>Суббота и воскресенье: выходные</span>
          </div>
          <p>
            Для подбора достаточно модели, артикула, фотографии шильдика или
            описания задачи. Укажите количество, желаемый срок и возможность
            предложить аналог.
          </p>
        </aside>
        <RequestForm defaultProduct={product} />
      </section>
    </>
  );
}
