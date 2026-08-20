import { AuthShell } from "@/components/auth/auth-shell";
import { CountryForm } from "@/components/auth/country-form";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("metadata");
  return { title: t("countryTitle"), description: t("countryDescription") };
}

export default async function CountryPage() {
  const t = await getTranslations("preferences");

  return (
    <AuthShell
      wide
      title={t("selectTitle")}
      description={t("selectDescription")}
    >
      <CountryForm />
    </AuthShell>
  );
}
