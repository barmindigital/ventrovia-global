import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Link className="brand brand-footer" href="/">
            <span className="brand-mark" aria-hidden="true"><i /></span>
            <span className="brand-copy"><strong>ПРОМСНАБЖЕНИЕ</strong><small>Промышленная комплектация</small></span>
          </Link>
          <p className="footer-note">
            Подбор оборудования и комплектующих по модели, артикулу и техническому заданию.
          </p>
        </div>
        <div>
          <h2>Каталог</h2>
          <Link href="/catalog">Все категории</Link>
          <Link href="/manufacturers">Производители</Link>
          <Link href="/manufacturers/abb">ABB</Link>
        </div>
        <div>
          <h2>Компания</h2>
          <Link href="/about">О компании</Link>
          <Link href="/contacts">Контакты</Link>
          <Link href="/contacts">Запросить подбор</Link>
        </div>
        <div className="footer-status">
          <span className="status-dot" />
          <p><strong>Каталог обновляется</strong><br />Данные проходят техническую проверку перед публикацией.</p>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 Промснабжение</span>
        <span>Информация на сайте не является публичной офертой.</span>
      </div>
    </footer>
  );
}
