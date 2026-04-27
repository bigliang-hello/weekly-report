import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ADMIN_ROUTES = ["/admin/login"];

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET || "default-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow public admin routes
  if (PUBLIC_ADMIN_ROUTES.some((route) => pathname === route)) {
    return NextResponse.next();
  }

  // Verify session cookie
  const token = request.cookies.get("admin_session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    await jwtVerify(token, getSecret(), { clockTolerance: 60 });
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
