import Link from "next/link";

export function PlaceholderPage({ eyebrow, title, description }) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl items-center px-5 py-20 lg:px-8">
      <section className="w-full rounded-[2rem] border border-line bg-surface-soft p-8 sm:p-12 lg:p-16">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-ink sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-ink-muted sm:text-lg">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-dark"
          >
            홈으로 돌아가기
          </Link>
          <span className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-ink-muted">
            라우팅 준비 완료
          </span>
        </div>
      </section>
    </main>
  );
}
