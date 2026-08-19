import { NextResponse } from "next/server";
import { hasTrustedOrigin, isAdminAuthenticated } from "@/app/lib/admin-auth";
import {
  adminStorageConfigured,
  loadEditableContent,
  saveEditableContent,
  validateSiteContent,
} from "@/app/lib/admin-content-store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  try {
    const result = await loadEditableContent();
    return NextResponse.json({ ...result, storageConfigured: adminStorageConfigured() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load content" },
      { status: 502 },
    );
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  if (!(await hasTrustedOrigin())) {
    return NextResponse.json({ error: "Request origin is not allowed" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { content?: unknown; sha?: unknown };
    const content = validateSiteContent(body.content);
    const sha = typeof body.sha === "string" ? body.sha : null;
    const nextSha = await saveEditableContent(content, sha);
    return NextResponse.json({ ok: true, sha: nextSha });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save content" },
      { status: 400 },
    );
  }
}
