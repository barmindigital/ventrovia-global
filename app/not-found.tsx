import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-hero">
      <div className="shell">
        <p className="eyebrow">Ошибка 404</p>
        <h1>Страница не найдена</h1>
        <p>Возможно, позиция ещё не опубликована в открытой части каталога.</p>
        <Link className="button button-primary" href="/catalog">
          Перейти в каталог
        </Link>
      </div>
    </section>
  );
}
