import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DICTS } from "@/i18n";
import { Shell } from "@/components/Shell";
import { formatNum } from "@/lib/engine";
import { COUNTRIES, LANGS, PRICES, SITE, bestRoute, countryStats, type Lang } from "@/lib/site";

type Params = { params: Promise<{ lang: string }> };

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params;
  const t = DICTS[(lang as Lang) ?? "en"];
  const languages = Object.fromEntries(LANGS.map((l) => [l, `${SITE.url}/${l}/world`]));
  return {
    title: t.meta.worldTitle,
    description: t.meta.worldDescription,
    alternates: { canonical: `${SITE.url}/${lang}/world`, languages: { ...languages, "x-default": `${SITE.url}/en/world` } },
    openGraph: { title: t.meta.worldTitle, description: t.meta.worldDescription, images: [`/api/og?c=us&l=${lang}`] },
  };
}

export default async function World({ params }: Params) {
  const { lang } = await params;
  if (!(LANGS as string[]).includes(lang)) notFound();
  const l = lang as Lang;
  const t = DICTS[l];
  const rows = COUNTRIES.map((c) => ({ c, ...countryStats(c) })).sort((a, b) => a.hTypical - b.hTypical);
  const max = Math.max(...rows.map((r) => r.hMin));
  const nf = (n: number) => formatNum(n, l === "es" ? "es-MX" : "en-US");

  return (
    <Shell t={t} lang={l}>
      <div>
        <p className="label">GTA 6 · PS5 · Xbox Series X|S</p>
        <h1 className="font-display text-[clamp(2.2rem,10vw,3.2rem)] leading-none font-bold uppercase">
          {t.world.h1}
        </h1>
        <p className="mt-3 text-sm text-muted">{t.world.sub}</p>
      </div>
      <ol className="card mt-6 divide-y divide-line p-0">
        {rows.map((r, i) => (
          <li key={r.c} className="px-5 py-4">
            <Link href={bestRoute(l, r.c)} className="block">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-display text-base font-bold tracking-wide uppercase">
                  {i + 1}. {r.p.flag} {r.p.name}
                </span>
                <span className="text-xs text-dim">GTA 6 + {r.console.label}</span>
              </div>
              <Bar label={t.world.typical} value={r.hTypical} max={max} color="bg-cyan" text={`${nf(r.hTypical)}${t.world.hoursShort}`} />
              <Bar label={t.world.min} value={r.hMin} max={max} color="bg-gradient-to-r from-pink to-orange" text={`${nf(r.hMin)}${t.world.hoursShort}`} />
            </Link>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-dim">{t.world.note}</p>
      <div className="mt-5 text-center">
        <Link href={bestRoute(l, l === "es" ? "mx" : "us")} className="btn btn-primary w-full py-4">
          {t.world.cta} →
        </Link>
      </div>
      <p className="sr-only">{Object.values(PRICES).map((p) => p.name).join(", ")}</p>
    </Shell>
  );
}

function Bar({ label, value, max, color, text }: { label: string; value: number; max: number; color: string; text: string }) {
  return (
    <div className="mt-2 flex items-center gap-2 text-xs text-muted">
      <span className="w-24 shrink-0">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(4, (Math.log1p(value) / Math.log1p(max)) * 100)}%` }} />
      </div>
      <span className="w-14 shrink-0 text-right font-display text-sm text-text">{text}</span>
    </div>
  );
}
