import type { Metadata } from "next";
import { getDict } from "@/i18n";
import { formatMoney, formatNum, STORY_HOURS } from "@/lib/engine";
import { countryStats, fill, LANGS, PRICES, ROUTES, SITE, hreflang, pathFor, type CountryCode, type Lang } from "@/lib/site";

export function alternates(path: (l: Lang, c: CountryCode) => string, c: CountryCode, lang: Lang) {
  const languages: Record<string, string> = {};
  for (const l of LANGS) {
    for (const cc of ROUTES[l]) if (cc === c) languages[hreflang(l, cc)] = `${SITE.url}${path(l, cc)}`;
  }
  languages["x-default"] = SITE.url;
  return { canonical: `${SITE.url}${path(lang, c)}`, languages };
}

/** All template variables the SEO copy needs for a country. */
export function seoVars(lang: Lang, c: CountryCode) {
  const s = countryStats(c);
  const m = (n: number) => formatMoney(n, s.p);
  const loc = lang === "es" ? (s.p.locale.startsWith("es") ? s.p.locale : "es-US") : s.p.locale;
  const ap = (v: boolean) => (v ? "" : "≈");
  return {
    country: s.p.name,
    std: `${ap(s.p.game.verified)}${m(s.p.game.standard)}`,
    ult: `${ap(s.p.game.verified)}${m(s.p.game.ultimate)}`,
    console: s.console.label,
    cprice: `${ap(s.console.verified)}${m(s.console.price)}`,
    bundle: m(s.bundle),
    median: m(s.l.medianHourly),
    min: m(s.l.minHourly),
    hTypical: formatNum(s.hTypical, loc),
    hMin: formatNum(s.hMin, loc),
    story: STORY_HOURS,
    date: new Intl.DateTimeFormat(loc, { dateStyle: "long" }).format(new Date(s.p.lastChecked)),
  };
}

export function countryMetadata(lang: Lang, c: CountryCode): Metadata {
  const t = getDict(lang);
  const v = seoVars(lang, c);
  const title = fill(t.meta.title, v);
  const description = fill(t.meta.description, v);
  const og = `/api/og?c=${c}&l=${lang}`;
  return {
    title,
    description,
    keywords:
      lang === "es"
        ? ["precio GTA 6", `precio GTA 6 ${v.country}`, "GTA 6 horas de trabajo", "cuánto cuesta GTA 6", "GTA 6 PS5 precio", "calculadora GTA 6"]
        : ["GTA 6 price", `GTA 6 price in ${v.country}`, "GTA 6 price in hours", "how many hours to afford GTA 6", "GTA 6 PS5 price", "GTA 6 calculator", "hours to play GTA 6"],
    alternates: alternates(pathFor, c, lang),
    openGraph: {
      type: "website",
      siteName: SITE.name,
      url: `${SITE.url}${pathFor(lang, c)}`,
      title,
      description,
      locale: hreflang(lang, c).replace("-", "_"),
      images: [{ url: og, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [og] },
    robots: { index: true, follow: true, "max-image-preview": "large" },
  };
}

export function countryJsonLd(lang: Lang, c: CountryCode) {
  const t = getDict(lang);
  const v = seoVars(lang, c);
  const url = `${SITE.url}${pathFor(lang, c)}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: `${SITE.name} – ${fill(t.seo.h2, v)}`,
      url,
      applicationCategory: "EntertainmentApplication",
      operatingSystem: "Any",
      inLanguage: hreflang(lang, c),
      offers: { "@type": "Offer", price: "0", priceCurrency: PRICES[c].currency },
      description: fill(t.meta.description, v),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: t.seo.faq.map((f) => ({
        "@type": "Question",
        name: fill(f.q, v),
        acceptedAnswer: { "@type": "Answer", text: fill(f.a, v) },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE.name, item: SITE.url },
        { "@type": "ListItem", position: 2, name: fill(t.seo.h2, v), item: url },
      ],
    },
  ];
}
