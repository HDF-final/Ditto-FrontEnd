import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("metadata");
  return { title: t("signupTitle"), description: t("signupDescription") };
}

export default async function SignupPage() {
  const t = await getTranslations("auth");

  return (
    <AuthShell
      title={t("startDitto")}
      description={t("signupDescription")}
    >
      <SignupForm />
    </AuthShell>
  );
}
