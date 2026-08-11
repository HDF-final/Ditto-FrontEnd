import { AuthShell } from "@/components/auth/auth-shell";
import { CountryForm } from "@/components/auth/country-form";

export const metadata = {
  title: "국가 선택",
  description: "국가를 고르면 언어와 추천 코스가 맞춰집니다.",
};

export default function CountryPage() {
  return (
    <AuthShell
      wide
      title="어디에서 오셨나요?"
      description="국가를 고르면 언어와 추천 코스가 맞춰집니다."
    >
      <CountryForm />
    </AuthShell>
  );
}
