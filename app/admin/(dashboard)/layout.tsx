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

  const adminInitial = session.email.charAt(1).toUpperCase();

  return (
    <div className="min-h-screen flex bg-[var(--color-background)]">
      {/* Sidebar */}
      <aside className="w-[220px] shrink-0 flex flex-col bg-[#0d1117] border-r border-[#30363d]">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#30363d]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center shadow-lg shadow-[var(--color-accent)]/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-none">具身智能</div>
              <div className="text-[10px] text-[#8b949e] mt-0.5 tracking-widest uppercase">Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          <div className="mb-2 px-3 pb-2">
            <span className="text-[10px] text-[#8b949e] uppercase tracking-widest font-medium">内容管理</span>
          </div>
          <Link
            href="/admin/reports"
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 mb-1 transition-all duration-150
              text-[#c9d1d9] hover:bg-[#161b22] hover:text-white
              data-[active]:bg-[var(--color-accent)]/10 data-[active]:text-[var(--color-accent)]"
          >
            <div className="w-7 h-7 rounded-md bg-[#21262d] border border-[#30363d] flex items-center justify-center group-hover:bg-[#30363d] transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
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
            </div>
            <span className="text-sm font-medium">周报审核</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-auto opacity-0 group-hover:opacity-40"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>

          <div className="mt-6 mb-2 px-3 pb-2">
            <span className="text-[10px] text-[#8b949e] uppercase tracking-widest font-medium">系统</span>
          </div>
          <Link
            href="/"
            target="_blank"
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 mb-1 transition-all duration-150 text-[#8b949e] hover:bg-[#161b22] hover:text-[#c9d1d9]"
          >
            <div className="w-7 h-7 rounded-md bg-[#21262d] border border-[#30363d] flex items-center justify-center group-hover:bg-[#30363d] transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" x2="21" y1="14" y2="3" />
              </svg>
            </div>
            <span className="text-sm font-medium">查看前台</span>
          </Link>
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-[#30363d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#238636] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {adminInitial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-[#c9d1d9] font-medium truncate">{session.email}</div>
              <div className="text-[10px] text-[#8b949e]">管理员</div>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-7 h-7 rounded-md flex items-center justify-center text-[#8b949e] hover:text-[#f85149] hover:bg-[#f85149]/10 transition-all duration-150"
                title="登出"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" x2="9" y1="12" y2="12" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
