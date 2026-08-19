import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/app/lib/admin-auth";
import { brandHealthDataset } from "@/app/lib/brand-health-data.server";

export const dynamic = "force-dynamic";

const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ dataset: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: "Authentication required" },
      { headers: privateHeaders, status: 401 },
    );
  }

  const { dataset } = await params;
  const payload = brandHealthDataset(dataset);
  if (!payload) {
    return NextResponse.json(
      { error: "The requested brand dataset is unavailable" },
      { headers: privateHeaders, status: 404 },
    );
  }

  return NextResponse.json(payload, { headers: privateHeaders });
}
