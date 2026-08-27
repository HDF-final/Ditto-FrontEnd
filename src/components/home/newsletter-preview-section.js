import { getTranslations } from "next-intl/server";

import { DesktopNewsletterBento } from "@/components/home/desktop-newsletter-bento";
import { NewsletterPreviewSlider } from "@/components/home/newsletter-preview-slider";
import { newsletters as defaultNewsletters } from "@/lib/fixtures/home";

export async function NewsletterPreviewSection({ items = [] }) {
  const t = await getTranslations("home");
  // 모바일 슬라이더는 최대 5개, 데스크톱 벤토 보드는 4개까지 노출
  const mobileItems = items.length > 0 ? items.slice(0, 5) : defaultNewsletters;
  const desktopItems = items.length > 0 ? items.slice(0, 4) : defaultNewsletters;

  return (
    <section
      id="newsletter"
      className="scroll-mt-16 bg-surface-soft px-5 py-8 lg:flex lg:min-h-0 lg:flex-1 lg:scroll-mt-0 lg:flex-col lg:px-0 lg:py-[clamp(22px,3.5dvh,40px)]"
    >
      <div className="home-content-boundary lg:flex lg:h-full lg:min-h-0 lg:translate-y-1 lg:flex-col lg:justify-center">
        <div className="lg:hidden">
          <h2 className="text-[22px] font-black leading-[1.32] text-ink">
            {t("newsletterTitle")}
          </h2>
          <p className="mt-3 text-[13px] leading-6 text-ink-muted">
            {t("newsletterDescription")}
          </p>
        </div>

        <div className="hidden text-center lg:block">
          <h2 className="text-5xl font-black leading-[1.18] tracking-[-0.035em] text-ink">
            {t("newsletterTitle")}
          </h2>
          <p className="mt-2 text-lg font-semibold leading-8 text-ink-muted">
            {t("newsletterDescription")}
          </p>
        </div>

        {/* 모바일: 드래그 슬라이더 (최대 5개) */}
        <NewsletterPreviewSlider items={mobileItems} />

        <div className="mt-[clamp(18px,2.6dvh,30px)] hidden min-h-0 lg:block">
          <DesktopNewsletterBento items={desktopItems} />
        </div>
      </div>
    </section>
  );
}
