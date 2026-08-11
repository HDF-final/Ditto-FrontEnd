import Link from "next/link";

import { BrandAsset } from "@/components/common/brand-asset";
import { ButtonLink } from "@/components/common/button";
import { Card } from "@/components/common/card";
import {
  ContentGrid,
  PageShell,
  PageSection,
  SectionHeader,
  SectionInner,
} from "@/components/layout/page-shell";

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
      <PageShell className="lg:py-20">
        <div className="grid overflow-hidden rounded-card border border-line bg-surface-soft lg:grid-cols-2">
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
              <ButtonLink href="/ai-course" size="lg">
                AI 코스 만들기
              </ButtonLink>
              <ButtonLink href="/courses" variant="secondary" size="lg">
                인기 코스 둘러보기
              </ButtonLink>
            </div>
          </div>
          <div className="flex min-h-80 items-center justify-center bg-linear-to-br from-brand-dark via-brand to-brand-accent p-10">
            <BrandAsset
              name="boni"
              className="size-56 bg-white/15"
              imageClassName="p-4"
              priority
            />
          </div>
        </div>
      </PageShell>

      <PageSection bleed>
        <SectionInner>
          <SectionHeader eyebrow="Project foundation" title="초기 기술 구성" />
          <ContentGrid>
            {foundations.map((item) => (
              <Card key={item.title}>
                <h3 className="font-bold text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink-muted">
                  {item.description}
                </p>
              </Card>
            ))}
          </ContentGrid>
        </SectionInner>
      </PageSection>

      <PageSection>
        <SectionHeader
          eyebrow="Routes"
          title="기본 라우팅 확인"
          description="각 링크는 App Router의 독립된 page.js로 연결됩니다."
        />
        <ContentGrid className="gap-3" columns="four">
          {routeLinks.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="rounded-card border border-line bg-surface p-5 font-bold text-ink transition hover:-translate-y-0.5 hover:border-brand hover:text-brand hover:shadow-card"
            >
              {route.label} →
            </Link>
          ))}
        </ContentGrid>
      </PageSection>
    </main>
  );
}
