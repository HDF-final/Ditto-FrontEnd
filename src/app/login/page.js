import { Suspense } from "react";
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
      <Suspense
        fallback={
          <div className="flex justify-center py-8">
            <span className="size-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
