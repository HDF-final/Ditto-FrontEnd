import { BoniLauncher } from "@/components/home/boni-launcher";
import { CommunityPreviewSection } from "@/components/home/community-preview-section";
import { DittoPicksSection } from "@/components/home/ditto-picks-section";
import { HomeHero } from "@/components/home/home-hero";
import { NewsletterPreviewSection } from "@/components/home/newsletter-preview-section";
import { heroSlides } from "@/lib/fixtures/home";
import { fetchPublicCoursesServer } from "@/lib/api/community.server";
import { fetchNewsFeedsServer } from "@/lib/api/news.server";
import { fetchSystemCoursesServer } from "@/lib/api/courses.server";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

function sortCommunityCoursesByPopularity(courses = []) {
  return [...courses]
    .sort((a, b) => {
      const likeDiff = (b.likes ?? 0) - (a.likes ?? 0);
      if (likeDiff !== 0) return likeDiff;

      const saveDiff = (b.saves ?? 0) - (a.saves ?? 0);
      if (saveDiff !== 0) return saveDiff;

      const commentDiff = (b.comments ?? 0) - (a.comments ?? 0);
      if (commentDiff !== 0) return commentDiff;

      return (b.postId ?? 0) - (a.postId ?? 0);
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
    fetchNewsFeedsServer({ page: 0, size: 5 }),
    fetchSystemCoursesServer({ size: 3 }).catch(() => []),
    fetchPublicCoursesServer({ page: 0, size: 50 }).catch(() => []),
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
    <main className="bg-background max-lg:space-y-5">
      <HomeHero slides={localizedHeroSlides} />
      <DittoPicksSection initialCourses={systemCourses} />
      <CommunityPreviewSection initialCourses={popularCommunityCourses} />
      <NewsletterPreviewSection items={newsList} />
      <BoniLauncher />
    </main>
  );
}
