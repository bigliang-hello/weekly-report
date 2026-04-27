import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/auth";
import { ensureDefaultAdmin } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    await ensureDefaultAdmin();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "请填写邮箱和密码" },
        { status: 400 }
      );
    }

    const result = await login(email, password);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "登录失败，请稍后重试" },
      { status: 500 }
    );
  }
}
