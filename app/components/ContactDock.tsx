import Link from "next/link";

export function ContactDock() {
  return (
    <aside className="contact-dock" aria-label="Быстрая связь">
      <a className="contact-dock-link" href="tel:+74956986076">
        <span aria-hidden="true">☎</span>
        <span>Позвонить</span>
      </a>
      <a
        className="contact-dock-link"
        href="mailto:sales@industriapostavok.ru"
      >
        <span aria-hidden="true">✉</span>
        <span>Написать</span>
      </a>
      <Link className="contact-dock-cta" href="/contacts">
        Оставить заявку
      </Link>
    </aside>
  );
}
