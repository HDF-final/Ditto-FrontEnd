import { AuthShell } from "@/components/auth/auth-shell";
import { PersonaForm } from "@/components/auth/persona-form";
import { resolveLang } from "@/lib/fixtures/countries";
import { getPersonaPageCopy } from "@/lib/fixtures/personas";

export const metadata = {
  title: "쇼핑 타입 선택",
  description: "캐릭터를 고르면 딱 맞는 코스를 추천해드려요.",
};

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
