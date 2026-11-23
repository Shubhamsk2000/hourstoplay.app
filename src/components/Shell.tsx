import Link from "next/link";
import type { Dict } from "@/i18n/en";
import { PRICES, ROUTES, SITE, pathFor, type CountryCode, type Lang } from "@/lib/site";

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <defs>
          <linearGradient id="lg" x1="0" x2="1">
            <stop offset="0" stopColor="#ff3d8b" />
            <stop offset="1" stopColor="#ff9f1c" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="10" fill="none" stroke="url(#lg)" strokeWidth="2.4" />
        <path d="M12 6.5V12l3.6 2.2" fill="none" stroke="#f5f5f7" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <span className="font-display text-[15px] font-bold tracking-[0.14em] uppercase">
        Hours<span className="grad-text">to</span>Play
      </span>
    </span>
  );
}

// Server-rendered chrome: header, country/language switcher, footer. Zero client JS.
export function Shell({ t, lang, country, children }: { t: Dict; lang: Lang; country?: CountryCode; children: React.ReactNode }) {
  const home = pathFor(lang, country && (ROUTES[lang] as string[]).includes(country) ? country : ROUTES[lang][0]);
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-10">
      <header className="sticky top-0 z-30 -mx-4 flex items-center justify-between gap-2 border-b border-line bg-bg/75 px-4 py-3 backdrop-blur-xl">
        <Link href={home} aria-label={SITE.name}>
          <Logo />
        </Link>
        <nav className="flex items-center gap-2">
          <Link href={`/${lang}/world`} className="pill hover:text-text">
            {t.world.nav}
          </Link>
          <details className="relative">
            <summary className="pill cursor-pointer list-none hover:text-text">
              {country ? PRICES[country].flag : "🌐"} {lang.toUpperCase()}
            </summary>
            <div className="card absolute right-0 z-40 mt-2 w-60 bg-bg2/95 p-2 shadow-2xl shadow-black">
              {(Object.keys(ROUTES) as Lang[]).map((l) => (
                <div key={l} className="mb-1">
                  <p className="label px-2 pt-2 pb-1">{l === "en" ? "English" : "Español"}</p>
                  {ROUTES[l].map((c) => (
                    <Link
                      key={c}
                      href={pathFor(l, c)}
                      hrefLang={`${l}-${c.toUpperCase()}`}
                      className={`block rounded-lg px-2 py-2 text-sm hover:bg-white/5 ${l === lang && c === country ? "bg-white/10 text-text" : "text-muted"}`}
                    >
                      {PRICES[c].flag} {PRICES[c].name}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </details>
        </nav>
      </header>

      <main className="flex-1 pt-8">{children}</main>

      <footer className="mt-16 space-y-2 border-t border-line pt-6 text-center text-xs text-dim">
        <Logo />
        <p className="pt-2">{t.footer.privacy}</p>
        <p>
          {t.footer.report}{" "}
          <a className="text-muted underline underline-offset-2" href={`mailto:hello@${SITE.domain}?subject=Wrong%20price`}>
            hello@{SITE.domain}
          </a>
        </p>
        <p className="text-muted">{t.footer.disclaimer}</p>
      </footer>
    </div>
  );
}
