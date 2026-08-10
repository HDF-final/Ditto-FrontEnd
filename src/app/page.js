import Link from "next/link";

const foundations = [
  {
    title: "Next.js + React",
    description: "App Router와 Server Component를 기본으로 사용하는 화면 구조",
  },
  {
    title: "Tailwind CSS",
    description: "반응형 UI와 DITTO 디자인 토큰을 위한 스타일 시스템",
  },
  {
    title: "Axios",
    description: "공통 인스턴스를 통한 일관된 브라우저 API 통신",
  },
  {
    title: "Zustand",
    description: "국가·언어와 같은 공유 클라이언트 상태 관리",
  },
];

const routeLinks = [
  { href: "/ai-course", label: "AI 맞춤 코스" },
  { href: "/courses", label: "인기 코스" },
  { href: "/community", label: "여행자 커뮤니티" },
  { href: "/news", label: "DITTO 뉴스" },
];

export default function Home() {
  return (
    <main>
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-20">
        <div className="grid overflow-hidden rounded-[2rem] border border-line bg-surface-soft lg:grid-cols-2">
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
              K-Culture Shopping Mate
            </p>
            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-ink sm:text-6xl">
              한국을 가장
              <br />
              <span className="text-brand">디토답게</span> 경험하세요
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-ink-muted sm:text-lg">
              국가별 트렌드를 탐색하고 AI로 나만의 코스를 만든 뒤, 모바일
              실내지도와 여행자 커뮤니티로 경험을 이어갑니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/ai-course"
                className="rounded-full bg-brand px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-dark"
              >
                AI 코스 만들기
              </Link>
              <Link
                href="/courses"
                className="rounded-full border border-brand bg-white px-6 py-3 text-sm font-bold text-brand transition hover:bg-brand-soft"
              >
                인기 코스 둘러보기
              </Link>
            </div>
          </div>
          <div className="flex min-h-80 items-center justify-center bg-linear-to-br from-[#28166f] via-[#6537db] to-[#9b5cff] p-10 text-white">
            <div className="text-center">
              <p className="text-5xl font-black tracking-[0.08em]">DITTO</p>
              <p className="mt-3 text-sm text-white/70">Front-end foundation</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
            Project foundation
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-ink">
            초기 기술 구성
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {foundations.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-line bg-surface-soft p-6"
              >
                <h3 className="font-bold text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink-muted">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
              Routes
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-ink">
              기본 라우팅 확인
            </h2>
          </div>
          <p className="text-sm text-ink-muted">
            각 링크는 App Router의 독립된 page.js로 연결됩니다.
          </p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {routeLinks.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="rounded-2xl border border-line bg-white p-5 font-bold text-ink transition hover:-translate-y-0.5 hover:border-brand hover:text-brand hover:shadow-lg"
            >
              {route.label} →
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
