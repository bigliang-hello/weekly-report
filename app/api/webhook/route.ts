import { NextRequest, NextResponse } from "next/server";
import { insertReport } from "@/lib/db";
import type { WeeklyReport } from "@/types/report";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as WeeklyReport;
    //输出传入的值
    console.log(body)

    if (!body.report_type || !body.time_range?.start || !body.time_range?.end) {
      return NextResponse.json(
        { error: "Missing required fields: report_type, time_range.start, time_range.end" },
        { status: 400 }
      );
    }

    const id = await insertReport(body);

    return NextResponse.json(
      { success: true, id, message: "Report saved successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error", detail: String(error) },
      { status: 500 }
    );
  }
}
