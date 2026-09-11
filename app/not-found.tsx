import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found | Aihamyn Hampa Trading",
  robots: { index: false, follow: true },
};

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
