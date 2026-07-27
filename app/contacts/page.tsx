import type { Metadata } from "next";
import Link from "next/link";
import { RequestForm } from "../components/RequestForm";

export const metadata: Metadata = {
  title: "Контакты и запрос на подбор оборудования",
  description:
    "Офис в Москве: БЦ «Центральный Ярд». Телефон +7 495 698 60 76, e-mail sales@vitrologistics.com.",
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
            <a href="tel:+74956986076">+7 495 698 60 76</a>
            <a href="mailto:sales@vitrologistics.com">sales@vitrologistics.com</a>
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
