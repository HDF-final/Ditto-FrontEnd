import { ScanMapView } from "@/components/navigation/scan-map-view";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("aiCourse");
  return { title: t("scanMapTitle") };
}

export default function ScanMapPage() {
  return <ScanMapView />;
}
