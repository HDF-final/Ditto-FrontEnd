import { AuthShell } from "@/components/auth/auth-shell";
import { PersonaForm } from "@/components/auth/persona-form";
import { resolveLang } from "@/lib/fixtures/countries";
import { getPersonaPageCopy } from "@/lib/fixtures/personas";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("metadata");
  return { title: t("personaTitle"), description: t("personaDescription") };
}

export default async function PersonaPage({ searchParams }) {
  const params = await searchParams;
  const lang = resolveLang(params?.lang);
  const copy = getPersonaPageCopy(lang);

  return (
    <AuthShell wide title={copy.title} description={copy.subtitle}>
      <PersonaForm copy={copy} />
    </AuthShell>
  );
}
