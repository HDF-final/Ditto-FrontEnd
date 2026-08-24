import { CountryRankingView } from "@/components/admin/country-ranking-view";

export const metadata = {
  title: "후보 TOP 20",
};

export default function AdminTrendCandidatesPage() {
  return <CountryRankingView mode="candidates" />;
}
