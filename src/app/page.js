import { AppBanner } from "@/components/home/app-banner";
import { BoniLauncher } from "@/components/home/boni-launcher";
import { CommunityPreviewSection } from "@/components/home/community-preview-section";
import { DittoPicksSection } from "@/components/home/ditto-picks-section";
import { HomeHero } from "@/components/home/home-hero";
import { NewsletterPreviewSection } from "@/components/home/newsletter-preview-section";
import { heroSlides } from "@/lib/fixtures/home";
import { fetchNewsFeedsServer } from "@/lib/api/news.server";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [newsList, t] = await Promise.all([
    fetchNewsFeedsServer({ page: 0, size: 3 }),
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
    <main className="bg-background">
      <HomeHero slides={localizedHeroSlides} />
      <DittoPicksSection />
      <CommunityPreviewSection />
      <NewsletterPreviewSection items={newsList} />
      <AppBanner />
      <BoniLauncher />
    </main>
  );
}
