"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";

const NAV_ITEMS = [
  { href: "/admin", label: "대시보드", icon: "grid" },
  { href: "/admin/trends/rankings", label: "국가별 TOP 10", icon: "chart" },
  { href: "/admin/trends/candidates", label: "국가별 후보군", icon: "users" },
  { href: "/admin/trends/youtube", label: "YouTube 급상승", icon: "play" },
  { href: "/admin/courses", label: "승인 대기 코스", icon: "route" },
];

const PAGE_TITLES = {
  "/admin": ["트렌드 운영 대시보드", "오늘 수집된 트렌드 산출물을 한눈에 확인합니다."],
  "/admin/trends/rankings": ["국가별 TOP 10", "한국·중국·일본·미국 최종 트렌드 순위를 확인합니다."],
  "/admin/trends/candidates": ["국가별 후보군", "국가별 비교 분석에 투입된 후보군을 확인합니다."],
  "/admin/trends/youtube": ["YouTube 급상승", "최근 7일 K-컬처 영상 급상승 신호를 확인합니다."],
  "/admin/courses": ["승인 대기 코스 초안", "배치가 만든 셀럽 코스 초안을 승인 전에 확인합니다."],
};

function NavIcon({ name }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    chart: <><path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-7"/><path d="M22 19H2"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    play: <><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3Z"/></>,
    route: <><circle cx="6" cy="19" r="3"/><circle cx="18" cy="5" r="3"/><path d="M9 19h6a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h6"/></>,
  };
  return <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function AdminShell({ children }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [title, description] = PAGE_TITLES[pathname] || PAGE_TITLES["/admin"];

  return (
    <div className="flex min-h-dvh bg-[#f3f5fa] text-[#181b2f]">
      <aside className="sticky top-0 flex h-dvh w-[248px] shrink-0 flex-col bg-[#161c33] px-4 py-6 text-white max-md:w-[82px] max-md:px-3">
        <Link href="/admin" className="flex h-14 items-center gap-3 px-3 max-md:justify-center max-md:px-0">
          <span className="flex size-10 items-center justify-center rounded-xl bg-brand text-lg font-black">D</span>
          <span className="max-md:hidden"><strong className="block text-lg leading-none">DITTO</strong><small className="mt-1 block text-[10px] font-semibold tracking-[0.18em] text-[#929ab8]">ADMIN OFFICE</small></span>
        </Link>

        <p className="mb-3 mt-10 px-3 text-[10px] font-bold tracking-[0.18em] text-[#747d9f] max-md:hidden">TREND OPERATIONS</p>
        <nav className="space-y-2" aria-label="관리자 메뉴">
          {NAV_ITEMS.map((item) => {
            const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} title={item.label} className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors max-md:justify-center max-md:px-0 ${active ? "bg-brand text-white shadow-[0_10px_25px_rgba(92,46,245,0.28)]" : "text-[#aeb5ce] hover:bg-white/6 hover:text-white"}`}>
                <NavIcon name={item.icon} />
                <span className="max-md:hidden">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-5">
          <div className="mb-4 rounded-xl bg-white/5 px-4 py-3 max-md:hidden">
            <p className="text-[10px] font-bold tracking-[0.14em] text-[#7e87a8]">PHASE 1</p>
            <p className="mt-1 text-xs font-semibold text-[#c9cee0]">조회 전용 관리자 화면</p>
          </div>
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-[#aeb5ce] hover:bg-white/6 hover:text-white max-md:justify-center max-md:px-0" title="서비스로 돌아가기">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m15 18-6-6 6-6"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></svg>
            <span className="max-md:hidden">서비스로 돌아가기</span>
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex min-h-[92px] items-center justify-between border-b border-[#e3e6ef] bg-white px-8 max-md:px-5">
          <div>
            <h1 className="text-xl font-bold tracking-[-0.02em]">{title}</h1>
            <p className="mt-1 text-xs text-[#777d92] max-sm:hidden">{description}</p>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-[#e3e6ef] bg-[#fafbfe] py-2 pl-2 pr-4">
            <span className="flex size-8 items-center justify-center rounded-full bg-[#eee9ff] text-xs font-black text-brand">A</span>
            <div className="max-sm:hidden"><p className="text-xs font-bold">{user?.nickname || "관리자"}</p><p className="text-[10px] text-[#8c92a6]">Administrator</p></div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1600px] p-8 max-md:p-5">{children}</main>
      </div>
    </div>
  );
}
