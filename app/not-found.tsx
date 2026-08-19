import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-hero">
      <div className="shell">
        <p className="eyebrow">Error 404</p>
        <h1>Page not found</h1>
        <p>Check the address or continue to the manufacturer knowledge base.</p>
        <Link className="button button-primary" href="/manufacturers">
          Manufacturers
        </Link>
      </div>
    </section>
  );
}
