import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { requireAdmin } from "@/lib/auth";

function getClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("Missing TURSO_DATABASE_URL");
  return createClient({ url, authToken });
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "缺少 id" }, { status: 400 });
    }

    const client = getClient();

    // Delete moderation records first
    await client.execute({
      sql: "DELETE FROM moderation WHERE report_id = ?",
      args: [Number(id)],
    });

    // Delete report
    await client.execute({
      sql: "DELETE FROM reports WHERE id = ?",
      args: [Number(id)],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
    }
    console.error("Delete report error:", error);
    return NextResponse.json({ success: false, error: "删除失败" }, { status: 500 });
  }
}
