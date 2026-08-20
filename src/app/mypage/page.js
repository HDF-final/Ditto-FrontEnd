import { MypageView } from "@/components/mypage/mypage-view";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("mypage");
  return { title: t("title") };
}

export default function MyPage() {
  return <MypageView />;
}
