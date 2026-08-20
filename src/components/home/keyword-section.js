import { realtimeKeywords } from "@/lib/fixtures/home";
import { SectionHeading } from "@/components/home/section-heading";
import { getTranslations } from "next-intl/server";

export async function KeywordSection() {
  const t = await getTranslations("home");

  return (
    <section className="bg-background px-10 sm:px-14 py-16 lg:px-52 xl:px-60 2xl:px-72">
      <SectionHeading
        eyebrow="REALTIME TREND"
        title={t("keywordTitle")}
        description={t("keywordDescription")}
        href="/news"
        linkLabel={t("viewAll")}
      />
      <div className="flex flex-wrap gap-3">
        {realtimeKeywords.map((keyword, index) => {
          const isHot = index < 3;
          return (
            <span
              key={keyword}
              className={`inline-flex items-center gap-2 rounded-full py-2 pl-2 pr-4 text-sm font-black ${
                isHot
                  ? "bg-accent text-violet-50"
                  : "bg-accent-soft text-accent"
              }`}
            >
              <span
                className={`flex size-5 items-center justify-center rounded-full text-xs ${
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
