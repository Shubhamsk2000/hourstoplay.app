# hourstoplay.app

How many hours of work does GTA 6 (+ a console) cost you? A fan-made, mobile-first, cartoon-styled calculator with
wanted-level ranks, story cards, challenge links, dynamic OG previews and side missions. English (+ Hinglish) and Spanish.

## Run

```bash
npm install --no-bin-links   # this drive is FAT32: no symlinks, so --no-bin-links is required here
npm run dev                  # http://localhost:3000
npm run build && npm start
```

## Edit prices (one-line changes)

- `src/data/prices.json`: game, console and add-on prices per country. `verified: false` shows an "≈" in the UI.
  Update `lastChecked` when you re-check prices (it's shown on the page and used in the sitemap).
  Set `"sale": { "label": "Black Friday", "consoles": { "ps5": 49999 }, "game": { "standard": 4999 } }` to show a sale toggle.
- `src/data/local.json`: chai/taco/latte prices, job presets and **approximate** wage references
  (used by the World Index and the "typical worker" comparison). Verify before promoting the World Index to press.

## Structure (reusable for sibling tools)

```
src/lib/engine/      pure TS calculator + share-link encoding (no React)
src/components/share ShareCard: one Satori component → OG (1200×630) and Story (1080×1920) PNGs
src/app/api/og       renders ShareCard, cached at the edge
src/lib/game/        badges, streaks, 8-bit sound effects (localStorage + WebAudio)
src/i18n/            en.ts (base), es.ts, hinglish.ts; same shape, typed
src/app/[lang]/[country]   static, indexable pages: /en/us /en/in /en/gb /en/ca /en/au /es/mx /es/es /es/us
src/app/[lang]/world       GTA 6 Affordability Index
src/app/[lang]/r           shared result / challenge landing (dynamic OG, noindex)
src/proxy.ts               "/" → redirects by IP country (Vercel header) + Accept-Language
```

## Deploy (Vercel)

1. Push to GitHub and import it in Vercel. In Project Settings, set Install Command to `npm install`
   (Vercel's Linux filesystem supports symlinks, so `--no-bin-links` isn't needed there).
2. Add the domain `hourstoplay.app`.
3. Optional analytics: create a Plausible site and set the `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=hourstoplay.app` env var.
   Events tracked: calculate, card_open, card_download, share_click, challenge_sent, mode_used, cheat, job_preset, locale_switch.
4. Google Search Console: verify the domain and submit `https://hourstoplay.app/sitemap.xml`. Do the same in Bing Webmaster Tools.
5. Set up the `hello@hourstoplay.app` mailbox (used for "report a wrong price").

## Legal

Fan-made, not affiliated with Rockstar Games or Take-Two. No Rockstar logos, artwork or official fonts
(Bungee + Baloo 2 are OFL Google Fonts; all art is original SVG).
