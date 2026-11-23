import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DICTS } from "@/i18n";
import type { Dict } from "@/i18n/en";
import { Calculator } from "@/components/calc/Calculator";
import { Shell } from "@/components/Shell";
import { Hero } from "@/components/Hero";
import { fromSearch, toSearch } from "@/lib/engine";
import { fill, LANGS, LOCAL, PRICES, SITE, USD_PER, bestRoute, type CountryCode, type Lang } from "@/lib/site";

// Shared result / challenge landing. Dynamic so each link gets its own OG preview.
type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { lang } = await params;
  const sp = await searchParams;
  const p = fromSearch(sp);
  if (!p || !(LANGS as string[]).includes(lang)) return { robots: { index: false } };
  const hinglish = sp.t === "hi" && lang === "en";
  const t = DICTS[hinglish ? "hinglish" : (lang as Lang)];
  const name = p.n || t.challenge.someone;
  const title = p.x
    ? fill(t.challenge.bannerHidden, { name, stars: "★".repeat(p.r) })
    : fill(t.challenge.banner, { name, h: Math.round(p.h) });
  const og = `/api/og?${toSearch(p)}&l=${hinglish ? "hinglish" : lang}`;
  return {
    title: `${title} – ${SITE.name}`,
    description: t.challenge.cta,
    robots: { index: false, follow: true },
    alternates: { canonical: `${SITE.url}${bestRoute(lang as Lang, p.c)}` },
    openGraph: { title, description: t.challenge.cta, images: [{ url: og, width: 1200, height: 630 }], siteName: SITE.name, type: "website" },
    twitter: { card: "summary_large_image", title, description: t.challenge.cta, images: [og] },
  };
}

export default async function SharedResult({ params, searchParams }: Props) {
  const { lang } = await params;
  if (!(LANGS as string[]).includes(lang)) notFound();
  const sp = await searchParams;
  const payload = fromSearch(sp);
  const l = lang as Lang;
  const c = (payload && payload.c in PRICES ? payload.c : l === "es" ? "mx" : "us") as CountryCode;
  const hinglish = sp.t === "hi" && l === "en";
  const dicts: Partial<Record<"en" | "es" | "hinglish", Dict>> = { [l]: DICTS[l] };
  if (l === "en" && c === "in") dicts.hinglish = DICTS.hinglish;
  const t = DICTS[hinglish ? "hinglish" : l];

  return (
    <Shell t={t} lang={l} country={c}>
      <Hero t={t} country={PRICES[c].name} />
      <Calculator
        lang={l}
        country={c}
        prices={PRICES[c]}
        local={LOCAL[c]}
        dicts={dicts}
        defaultDict={hinglish ? "hinglish" : l}
        usdPer={USD_PER[c]}
        challenger={payload}
      />
    </Shell>
  );
}
