import type { Metadata } from "next";
import Link from "next/link";
import { RequestForm } from "../components/RequestForm";

export const metadata: Metadata = {
  title: "Запрос на подбор оборудования",
  description:
    "Отправьте модель, артикул или описание промышленного оборудования для подбора и проверки совместимости.",
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
          <p className="eyebrow">Подбор оборудования</p>
          <h1>Расскажите,<br />что нужно найти</h1>
          <p>
            Достаточно модели, артикула, фотографии шильдика или описания
            задачи. Чем полнее маркировка, тем точнее результат.
          </p>
        </div>
      </section>
      <section className="section shell contact-layout">
        <aside className="contact-aside">
          <p className="eyebrow">Что приложить</p>
          <h2>Данные для точного подбора</h2>
          <p>
            Укажите количество, желаемый срок, город поставки и возможность
            предложить аналог. Для замены установленного компонента полезна
            фотография шильдика.
          </p>
          <p>
            Корпоративные телефон и e-mail пока не заданы. Форма сохраняет
            заполненный запрос как локальный черновик и не имитирует отправку.
          </p>
        </aside>
        <RequestForm defaultProduct={product} />
      </section>
    </>
  );
}
