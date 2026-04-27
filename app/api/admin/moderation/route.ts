import { NextRequest, NextResponse } from "next/server";
import { getModerationByReportId, upsertModeration } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const reportId = request.nextUrl.searchParams.get("reportId");
    if (!reportId) {
      return NextResponse.json(
        { success: false, error: "缺少 reportId" },
        { status: 400 }
      );
    }

    const records = await getModerationByReportId(Number(reportId));
    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error("Get moderation error:", error);
    return NextResponse.json(
      { success: false, error: "获取审核记录失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();

    const {
      reportId,
      section,
      itemIndex,
      subSection,
      isHidden,
      reason,
    } = body;

    if (!reportId || !section || typeof itemIndex !== "number" || typeof isHidden !== "boolean") {
      return NextResponse.json(
        { success: false, error: "缺少必要参数" },
        { status: 400 }
      );
    }

    const id = await upsertModeration({
      reportId: Number(reportId),
      section,
      itemIndex: Number(itemIndex),
      subSection: subSection ?? null,
      isHidden,
      reason: reason ?? null,
      moderatedBy: admin.adminId,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "未登录" },
        { status: 401 }
      );
    }
    console.error("Upsert moderation error:", error);
    return NextResponse.json(
      { success: false, error: "操作失败" },
      { status: 500 }
    );
  }
}
