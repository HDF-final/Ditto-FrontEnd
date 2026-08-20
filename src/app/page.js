import { AppBanner } from "@/components/home/app-banner";
import { BoniLauncher } from "@/components/home/boni-launcher";
import { CommunityPreviewSection } from "@/components/home/community-preview-section";
import { DittoPicksSection } from "@/components/home/ditto-picks-section";
import { HomeHero } from "@/components/home/home-hero";
import { KeywordSection } from "@/components/home/keyword-section";
import { NewsletterPreviewSection } from "@/components/home/newsletter-preview-section";
import { heroSlides } from "@/lib/fixtures/home";
import { fetchNewsFeedsServer } from "@/lib/api/news.server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const newsList = await fetchNewsFeedsServer({ page: 0, size: 3 });

  return (
    <main className="bg-background">
      <HomeHero slides={heroSlides} />
      <DittoPicksSection />
      <CommunityPreviewSection />
      <KeywordSection />
      <NewsletterPreviewSection items={newsList} />
      <AppBanner />
      <BoniLauncher />
    </main>
  );
}
