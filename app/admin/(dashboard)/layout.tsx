import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession, clearSession } from "@/lib/auth";
import { ensureDefaultAdmin } from "@/lib/db";

async function logoutAction() {
  "use server";
  await clearSession();
  redirect("/admin/login");
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureDefaultAdmin();
  const session = await verifySession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col">
        <div className="flex items-center gap-2 px-5 h-14 border-b border-[var(--color-border)]">
          <div className="w-7 h-7 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-[var(--color-foreground)]">后台管理</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            href="/admin/reports"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-neutral-100)] hover:bg-[var(--color-neutral-200)] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" x2="8" y1="13" y2="13" />
              <line x1="16" x2="8" y1="17" y2="17" />
              <line x1="10" x2="8" y1="9" y2="9" />
            </svg>
            周报审核
          </Link>
        </nav>

        <div className="px-4 py-3 border-t border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--color-muted)] truncate max-w-[120px]">
              {session.email}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-xs text-[var(--color-muted)] hover:text-[var(--color-danger)] transition-colors"
              >
                登出
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-[var(--color-background)] overflow-auto">
        {children}
      </main>
    </div>
  );
}
