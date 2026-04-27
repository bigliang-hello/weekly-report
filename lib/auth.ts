import crypto from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getAdminByEmail } from "@/lib/db";

const COOKIE_NAME = "admin_session";
const TOKEN_EXPIRY = "7d";

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET || "default-secret-change-me";
  return new TextEncoder().encode(secret);
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computed = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(hash, "hex"));
}

export async function createSession(adminId: number, email: string): Promise<void> {
  const token = await new SignJWT({ sub: String(adminId), email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function verifySession(): Promise<{ adminId: number; email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret(), { clockTolerance: 60 });
    if (!payload.sub || !payload.email) return null;
    return { adminId: Number(payload.sub), email: String(payload.email) };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<{ adminId: number; email: string }> {
  const session = await verifySession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const admin = await getAdminByEmail(email);
  if (!admin) {
    return { success: false, error: "邮箱或密码错误" };
  }

  const valid = verifyPassword(password, admin.password_hash, admin.salt);
  if (!valid) {
    return { success: false, error: "邮箱或密码错误" };
  }

  await createSession(admin.id, admin.email);
  return { success: true };
}
