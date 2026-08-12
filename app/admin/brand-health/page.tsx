import type { Metadata } from "next";
import { BrandHealthAdmin } from "@/app/components/admin/BrandHealthAdmin";

export const metadata: Metadata = {
  title: "Здоровье производителей",
  robots: { index: false, follow: false, nocache: true },
};

export default function BrandHealthPage() {
  return <BrandHealthAdmin />;
}
