import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DICTS } from "@/i18n";
import type { Dict } from "@/i18n/en";
import { Calculator } from "@/components/calc/Calculator";
import { Shell } from "@/components/Shell";
import { SeoSection } from "@/components/SeoSection";
import { Hero } from "@/components/Hero";
import { countryJsonLd, countryMetadata } from "@/lib/seo";
import { LANGS, LOCAL, PRICES, ROUTES, USD_PER, isRoute, type CountryCode, type Lang } from "@/lib/site";

type Params = { params: Promise<{ lang: string; country: string }> };

export function generateStaticParams() {
  return LANGS.flatMap((lang) => ROUTES[lang].map((country) => ({ lang, country })));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang, country } = await params;
  if (!isRoute(lang, country)) return {};
  return countryMetadata(lang, country as CountryCode);
}

export default async function CountryPage({ params }: Params) {
  const { lang, country } = await params;
  if (!isRoute(lang, country)) notFound();
  const c = country as CountryCode;
  const l = lang as Lang;
  const t = DICTS[l];
  const dicts: Partial<Record<"en" | "es" | "hinglish", Dict>> = { [l]: t };
  if (l === "en" && c === "in") dicts.hinglish = DICTS.hinglish;

  return (
    <Shell t={t} lang={l} country={c}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(countryJsonLd(l, c)).replace(/</g, "\\u003c") }}
      />
      <Hero t={t} country={PRICES[c].name} />
      <Calculator
        lang={l}
        country={c}
        prices={PRICES[c]}
        local={LOCAL[c]}
        dicts={dicts}
        defaultDict={l}
        usdPer={USD_PER[c]}
      />
      <SeoSection t={t} lang={l} country={c} />
    </Shell>
  );
}
