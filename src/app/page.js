import { BoniLauncher } from "@/components/home/boni-launcher";
import { CommunityPreviewSection } from "@/components/home/community-preview-section";
import { DittoPicksSection } from "@/components/home/ditto-picks-section";
import { HomeHero } from "@/components/home/home-hero";
import { HomeSnapScroller } from "@/components/home/home-snap-scroller";
import { NewsletterPreviewSection } from "@/components/home/newsletter-preview-section";
import { SiteFooter } from "@/components/layout/site-footer";
import { heroSlides } from "@/lib/fixtures/home";
import { fetchPublicCoursesServer } from "@/lib/api/community.server";
import { fetchNewsFeedsServer } from "@/lib/api/news.server";
import { fetchSystemCoursesServer } from "@/lib/api/courses.server";
import { getTranslations } from "next-intl/server";

export const revalidate = 300;

function sortCommunityCoursesByPopularity(courses = []) {
  const readCount = (value) => {
    const count = Number(value);
    return Number.isFinite(count) ? count : 0;
  };

  return [...courses]
    .sort((a, b) => {
      const likeDiff =
        readCount(b.likes ?? b.likeCount) - readCount(a.likes ?? a.likeCount);
      if (likeDiff !== 0) return likeDiff;

      const saveDiff =
        readCount(b.saves ?? b.bookmarkCount) -
        readCount(a.saves ?? a.bookmarkCount);
      if (saveDiff !== 0) return saveDiff;

      const commentDiff =
        readCount(b.comments ?? b.commentCount) -
        readCount(a.comments ?? a.commentCount);
      if (commentDiff !== 0) return commentDiff;

      return readCount(b.postId) - readCount(a.postId);
    })
    .slice(0, 9)
    .map((course, index) => ({
      ...course,
      rank: index + 1,
      country: course.country || "KR",
      hash: course.hash || "#공유코스",
    }));
}

export default async function Home() {
  const [newsList, systemCourses, communityCourses, t] = await Promise.all([
    fetchNewsFeedsServer({
      page: 0,
      size: 5,
      cache: "force-cache",
      revalidate: 300,
    }),
    fetchSystemCoursesServer({ size: 50 }).catch(() => []),
    fetchPublicCoursesServer({
      page: 0,
      size: 50,
      cache: "no-store",
    }).catch(() => []),
    getTranslations("home"),
  ]);
  const popularCommunityCourses = sortCommunityCoursesByPopularity(communityCourses);
  const localizedHeroSlides = heroSlides.map((slide, index) => {
    const copy = t.raw(`hero.slide${index + 1}`);
    return {
      ...slide,
      ...copy,
      primaryCta: { ...slide.primaryCta, label: copy.primaryCta },
      secondaryCta: { ...slide.secondaryCta, label: copy.secondaryCta },
    };
  });

  return (
    <HomeSnapScroller>
      <HomeHero slides={localizedHeroSlides} />
      <DittoPicksSection initialCourses={systemCourses} />
      <CommunityPreviewSection initialCourses={popularCommunityCourses} />
      <div className="home-snap-panel bg-surface-soft lg:flex lg:flex-col">
        <NewsletterPreviewSection items={newsList} />
        <SiteFooter embedded />
      </div>
      <BoniLauncher />
    </HomeSnapScroller>
  );
}
