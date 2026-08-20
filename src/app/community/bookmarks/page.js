import { CommunityBookmarksView } from "@/components/community/community-bookmarks-view";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("community");
  return {
    title: `${t("favoritesTitle")} | DITTO`,
    description: t("favoritesMetadata"),
  };
}

export default function BookmarksPage() {
  return <CommunityBookmarksView />;
}
