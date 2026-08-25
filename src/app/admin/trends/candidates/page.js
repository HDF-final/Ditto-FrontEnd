import { CountryRankingView } from "@/components/admin/country-ranking-view";

export const metadata = {
  title: "국가별 후보군",
};

export default function AdminTrendCandidatesPage() {
  return <CountryRankingView mode="candidates" />;
}
