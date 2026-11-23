import { permanentRedirect } from "next/navigation";
import { DEFAULT_COUNTRY, LANGS, pathFor, type Lang } from "@/lib/site";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export default async function LangRoot({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = ((LANGS as string[]).includes(lang) ? lang : "en") as Lang;
  permanentRedirect(pathFor(l, DEFAULT_COUNTRY[l]));
}
