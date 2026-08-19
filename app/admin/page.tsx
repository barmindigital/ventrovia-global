import type { Metadata } from "next";
import { AdminPanel } from "@/app/components/admin/AdminPanel";

export const metadata: Metadata = {
  title: "Site administration",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function AdminPage() {
  return <AdminPanel />;
}
