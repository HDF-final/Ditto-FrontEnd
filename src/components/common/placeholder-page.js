import { ButtonLink } from "@/components/common/button";
import { SoftCard } from "@/components/common/card";
import { PageShell } from "@/components/layout/page-shell";

export function PlaceholderPage({ eyebrow, title, description }) {
  return (
    <PageShell className="flex min-h-[calc(100vh-8rem)] items-center py-20">
      <SoftCard className="w-full p-8 sm:p-12 lg:p-16">
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
          <ButtonLink href="/">홈으로 돌아가기</ButtonLink>
          <span className="rounded-control border border-line bg-white px-5 py-3 text-sm font-semibold text-ink-muted">
            라우팅 준비 완료
          </span>
        </div>
      </SoftCard>
    </PageShell>
  );
}
