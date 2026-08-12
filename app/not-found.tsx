import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-hero">
      <div className="shell">
        <p className="eyebrow">Ошибка 404</p>
        <h1>Страница не найдена</h1>
        <p>Проверьте адрес или перейдите к списку производителей.</p>
        <Link className="button button-primary" href="/manufacturers">
          Производители
        </Link>
      </div>
    </section>
  );
}
