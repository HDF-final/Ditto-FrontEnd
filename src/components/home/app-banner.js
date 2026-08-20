import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function AppBanner() {
  const t = await getTranslations("home");

  return (
    <section className="bg-background px-10 sm:px-14 py-16 lg:px-52 xl:px-60 2xl:px-72">
      <div className="grid min-h-60 overflow-hidden rounded-[32px] bg-linear-to-br from-[#2d1b8e] via-[#4a2fa8] to-[#6d28d9] lg:grid-cols-[1fr_420px]">
        <div className="flex flex-col justify-center gap-3 p-8 sm:p-[60px]">
          <h2 className="text-2xl font-black text-white sm:text-[28px]">
            {t("appTitle")}
          </h2>
          <p className="text-sm leading-7 text-violet-100 sm:text-base">
            {t("appDescription")}
          </p>
          <div className="mt-2">
            <Link
              href="/ai-course"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-[#4a2fa8]"
            >
              {t("downloadApp")}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <div className="flex min-h-44 items-center justify-center bg-white/10 px-8 text-center text-xs text-violet-100">
          {t("appPreview")}
        </div>
      </div>
    </section>
  );
}
