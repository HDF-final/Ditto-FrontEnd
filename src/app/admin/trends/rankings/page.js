import { CountryRankingView } from "@/components/admin/country-ranking-view";

export const metadata = {
  title: "국가별 TOP 4",
};

export default function AdminTrendRankingsPage() {
  return <CountryRankingView mode="top4" />;
}
