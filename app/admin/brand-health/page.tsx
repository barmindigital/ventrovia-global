import type { Metadata } from "next";
import { BrandHealthAdmin } from "@/app/components/admin/BrandHealthAdmin";

export const metadata: Metadata = {
  title: "Manufacturer data health",
  robots: { index: false, follow: false, nocache: true },
};

export default function BrandHealthPage() {
  return <BrandHealthAdmin />;
}
