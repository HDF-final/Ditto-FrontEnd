import { realtimeKeywords } from "@/lib/fixtures/home";
import { SectionHeading } from "@/components/home/section-heading";
import { getTranslations } from "next-intl/server";

export async function KeywordSection() {
  const t = await getTranslations("home");

  return (
    <section className="bg-background px-5 py-8 lg:px-52 lg:py-16 xl:px-60 2xl:px-72">
      <SectionHeading
        eyebrow="REALTIME TREND"
        title={t("keywordTitle")}
        description={t("keywordDescription")}
        href="/news"
        linkLabel={t("viewAll")}
      />
      <div className="flex flex-wrap gap-2 lg:gap-3">
        {realtimeKeywords.map((keyword, index) => {
          const isHot = index < 3;
          return (
            <span
              key={keyword}
              className={`inline-flex items-center gap-1.5 rounded-full py-1.5 pl-1.5 pr-3 text-xs font-black lg:gap-2 lg:py-2 lg:pl-2 lg:pr-4 lg:text-sm ${
                isHot
                  ? "bg-accent text-violet-50"
                  : "bg-accent-soft text-accent"
              }`}
            >
              <span
                className={`flex size-5 items-center justify-center rounded-full text-[10px] lg:text-xs ${
                  isHot ? "bg-white/25" : "bg-accent text-violet-50"
                }`}
              >
                {index + 1}
              </span>
              {keyword}
            </span>
          );
        })}
      </div>
    </section>
  );
}
