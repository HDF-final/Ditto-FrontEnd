import { PlaceholderPage } from "@/components/common/placeholder-page";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("courses");
  return { title: t("listTitle") };
}

export default async function CoursesPage() {
  const t = await getTranslations("courses");
  return (
    <PlaceholderPage
      eyebrow="DITTO Picks"
      title={t("listTitle")}
      description={t("listDescription")}
    />
  );
}
