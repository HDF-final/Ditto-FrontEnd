import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("metadata");
  return { title: t("loginTitle"), description: t("loginDescription") };
}

export default async function LoginPage() {
  const t = await getTranslations("auth");

  return (
    <AuthShell
      title={t("welcomeBack")}
      description={t("loginDescription")}
    >
      <LoginForm />
    </AuthShell>
  );
}
