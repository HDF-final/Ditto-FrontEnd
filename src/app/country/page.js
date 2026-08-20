import { AuthShell } from "@/components/auth/auth-shell";
import { CountryForm } from "@/components/auth/country-form";

export const metadata = {
  title: "국가·언어 선택",
  description: "콘텐츠를 볼 국가와 사용할 언어를 각각 선택합니다.",
};

export default function CountryPage() {
  return (
    <AuthShell
      wide
      title="국가와 언어를 선택해 주세요"
      description="콘텐츠 기준 국가와 화면 언어는 서로 다르게 선택할 수 있어요."
    >
      <CountryForm />
    </AuthShell>
  );
}
