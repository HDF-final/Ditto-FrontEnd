import { BoniLauncher } from "@/components/home/boni-launcher";
import { CommunityPreviewSection } from "@/components/home/community-preview-section";
import { DittoPicksSection } from "@/components/home/ditto-picks-section";
import { HomeHero } from "@/components/home/home-hero";
import { NewsletterPreviewSection } from "@/components/home/newsletter-preview-section";
import { heroSlides } from "@/lib/fixtures/home";
import { fetchNewsFeedsServer } from "@/lib/api/news.server";
import { fetchSystemCoursesServer } from "@/lib/api/courses.server";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [newsList, systemCourses, t] = await Promise.all([
    fetchNewsFeedsServer({ page: 0, size: 3 }),
    fetchSystemCoursesServer({ size: 3 }).catch(() => []),
    getTranslations("home"),
  ]);
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
      <CommunityPreviewSection />
      <NewsletterPreviewSection items={newsList} />
      <BoniLauncher />
    </main>
  );
}
