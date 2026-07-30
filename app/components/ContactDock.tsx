import Link from "next/link";

export function ContactDock() {
  return (
    <aside className="contact-dock" aria-label="Быстрая связь">
      <div className="contact-dock-copy">
        <span className="contact-dock-status" aria-hidden="true" />
        <span>
          <small>Отдел поставок</small>
          <strong>Поможем с подбором</strong>
        </span>
      </div>
      <a
        aria-label="Позвонить в Индустрию поставок"
        className="contact-dock-action"
        href="tel:+74956986076"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M7.2 3.8 9.8 8l-2.1 2.1c1.2 2.4 3.1 4.3 5.5 5.5l2.1-2.1 4.2 2.6v2.8c0 .7-.5 1.3-1.2 1.4C10.4 21.2 3 13.8 3.9 5.9c.1-.7.7-1.2 1.4-1.2l1.9-.9Z" />
        </svg>
        <span className="sr-only">Позвонить</span>
      </a>
      <a
        aria-label="Написать на электронную почту"
        className="contact-dock-action"
        href="mailto:sales@industriapostavok.ru"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M3.5 6.5h17v11h-17v-11Zm.8.7 7.7 5.7 7.7-5.7M4.4 16.8l5.3-5m9.9 5-5.3-5" />
        </svg>
        <span className="sr-only">Написать</span>
      </a>
      <Link className="contact-dock-cta" href="/contacts">
        <span>Оставить заявку</span>
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <path d="m7 4 6 6-6 6" />
        </svg>
      </Link>
    </aside>
  );
}
