import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "회원가입",
  description: "DITTO에 가입하고 코스 저장과 공유를 시작하세요.",
};

export default function SignupPage() {
  return (
    <AuthShell
      title="디토 시작하기"
      description="30초면 충분해요. 코스 저장과 공유가 열립니다."
    >
      <SignupForm />
    </AuthShell>
  );
}
