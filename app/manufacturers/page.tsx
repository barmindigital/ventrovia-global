import type { Metadata } from "next";
import Link from "next/link";
import { ManufacturerBrowser } from "../components/ManufacturerBrowser";
import { FULL_MANUFACTURER_COUNT } from "../generated/full-catalog";
import { formatCount } from "../lib/catalog-data";

export const metadata: Metadata = {
  title: "Производители промышленного оборудования",
  description:
    "Каталог производителей промышленного оборудования и комплектующих. Поиск бренда и подбор позиции по точной маркировке.",
};

export default function ManufacturersPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <div className="breadcrumbs">
            <Link href="/">Главная</Link><span>/</span><span>Производители</span>
          </div>
          <div className="page-hero-row">
            <div>
              <p className="eyebrow">Поиск по бренду</p>
              <h1>Производители</h1>
              <p>
                Страницы брендов объединяют модели, категории и подсказки для
                точного запроса. Названия используются только для идентификации
                совместимого оборудования.
              </p>
            </div>
            <div className="page-count">
              <strong>{formatCount(FULL_MANUFACTURER_COUNT)}</strong>
              <span>производителей в базе</span>
            </div>
          </div>
        </div>
      </section>
      <section className="section shell">
        <ManufacturerBrowser />
      </section>
    </>
  );
}
