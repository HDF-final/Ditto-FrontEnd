import { AppBanner } from "@/components/home/app-banner";
import { CommunityPreviewSection } from "@/components/home/community-preview-section";
import { DittoPicksSection } from "@/components/home/ditto-picks-section";
import { HomeHero } from "@/components/home/home-hero";
import { KeywordSection } from "@/components/home/keyword-section";
import { NewsletterPreviewSection } from "@/components/home/newsletter-preview-section";
import { heroSlides } from "@/lib/fixtures/home";

export default function Home() {
  return (
    <main className="bg-background">
      <HomeHero slides={heroSlides} />
      <DittoPicksSection />
      <CommunityPreviewSection />
      <KeywordSection />
      <NewsletterPreviewSection />
      <AppBanner />
    </main>
  );
}
