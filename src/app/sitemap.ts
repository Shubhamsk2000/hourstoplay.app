import type { MetadataRoute } from "next";
import { LANGS, PRICES, ROUTES, SITE, hreflang, pathFor } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [];
  for (const lang of LANGS) {
    for (const c of ROUTES[lang]) {
      const languages: Record<string, string> = {};
      for (const l of LANGS) if ((ROUTES[l] as string[]).includes(c)) languages[hreflang(l, c)] = `${SITE.url}${pathFor(l, c)}`;
      pages.push({
        url: `${SITE.url}${pathFor(lang, c)}`,
        lastModified: new Date(PRICES[c].lastChecked),
        changeFrequency: "daily",
        priority: 1,
        alternates: { languages },
      });
    }
    pages.push({
      url: `${SITE.url}/${lang}/world`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: { languages: Object.fromEntries(LANGS.map((l) => [l, `${SITE.url}/${l}/world`])) },
    });
  }
  return pages;
}
