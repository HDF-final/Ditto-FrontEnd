import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "로그인",
  description: "DITTO 계정으로 로그인하고 저장한 코스를 이어서 확인하세요.",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="다시 오셨네요"
      description="로그인하고 저장한 코스를 이어서 확인하세요."
    >
      <LoginForm />
    </AuthShell>
  );
}
