import Link from "next/link";
import type { Dict } from "@/i18n/en";
import { formatMoney, formatNum } from "@/lib/engine";
import { countryStats, fill, PRICES, ROUTES, pathFor, type CountryCode, type Lang } from "@/lib/site";
import { seoVars } from "@/lib/seo";

// Crawlable, server-rendered content: what Google reads and ranks.
export function SeoSection({ t, lang, country }: { t: Dict; lang: Lang; country: CountryCode }) {
  const v = seoVars(lang, country);
  const s = countryStats(country);
  const loc = lang === "es" && !s.p.locale.startsWith("es") ? "es-US" : s.p.locale;
  const m = (n: number) => formatMoney(n, s.p);
  const h = (price: number, wage: number) => formatNum(price / wage, loc);
  const rows: [string, number, boolean][] = [
    [t.seo.std, s.p.game.standard, s.p.game.verified],
    [t.seo.ult, s.p.game.ultimate, s.p.game.verified],
    ...Object.values(s.p.consoles).map((c) => [c.label, c.price, c.verified] as [string, number, boolean]),
  ];

  return (
    <section className="mt-14 space-y-4">
      <article className="card p-5">
        <h2 className="font-display text-xl font-bold tracking-wide uppercase">{fill(t.seo.h2, v)}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{fill(t.seo.intro, v)}</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line label">
                <th className="py-2 pr-2">{t.seo.table.item}</th>
                <th className="py-2 pr-2">{t.seo.table.price}</th>
                <th className="py-2 pr-2">{t.seo.table.hoursMin}</th>
                <th className="py-2">{t.seo.table.hoursTypical}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, price, ok]) => (
                <tr key={label} className="border-b border-line/60">
                  <td className="py-2 pr-2">{label}</td>
                  <td className="py-2 pr-2 whitespace-nowrap">
                    {ok ? "" : "≈"}
                    {m(price)}
                  </td>
                  <td className="py-2 pr-2">{h(price, s.l.minHourly)}h</td>
                  <td className="py-2">{h(price, s.l.medianHourly)}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-dim">{fill(t.seo.checked, v)}</p>
      </article>

      <article className="card p-5">
        <h2 className="font-display text-xl font-bold tracking-wide uppercase">{t.seo.faqTitle}</h2>
        <div className="mt-2">
          {t.seo.faq.map((f) => (
            <details key={f.q} className="group border-b border-line py-3 last:border-0">
              <summary className="flex cursor-pointer list-none justify-between gap-3 text-sm font-semibold">{fill(f.q, v)}<span className="text-muted transition group-open:rotate-45">+</span></summary>
              <p className="mt-2 text-sm leading-relaxed text-muted">{fill(f.a, v)}</p>
            </details>
          ))}
        </div>
      </article>

      <nav aria-label={t.seo.others} className="card p-5">
        <h2 className="font-display text-lg font-bold tracking-wide uppercase">{t.seo.others}</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(ROUTES) as Lang[]).flatMap((l) =>
            ROUTES[l]
              .filter((c) => !(l === lang && c === country))
              .map((c) => (
                <li key={`${l}-${c}`}>
                  <Link className="pill hover:text-text" href={pathFor(l, c)} hrefLang={`${l}-${c.toUpperCase()}`}>
                    {PRICES[c].flag} {l === "es" ? `GTA 6 ${PRICES[c].name}` : `GTA 6 price ${PRICES[c].name}`}
                  </Link>
                </li>
              )),
          )}
          <li>
            <Link className="pill text-text!" href={`/${lang}/world`}>
              {t.world.nav} →
            </Link>
          </li>
        </ul>
      </nav>
    </section>
  );
}
