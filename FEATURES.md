# hourstoplay.app: Feature Spec (v0.2, Nov 23 2026)

GTA 6 launched Nov 19, 2026 (PS5 + Xbox Series X|S only). Interest peaks over the next 2–3 weeks, and then
Black Friday (Nov 27) and the Christmas gift season follow. **Ship P0 fast, then add P1 features every 1–2 days.**
Each new feature is a new reason to post again.

Priority: **P0** = launch · **P1** = week 1 drops · **P2** = later / evergreen

---

## 1. Languages and countries

Language and country are **separate choices**. A Spanish speaker in the US gets Spanish text with US prices.

| Locale | Flavour | Countries (prices) | Priority |
|---|---|---|---|
| `en` | Spelling/jokes per region (colour vs color, "mate", "bro") | 🇮🇳 IN, 🇺🇸 US, 🇬🇧 UK, 🇨🇦 CA, 🇦🇺 AU | P0 |
| `en-IN` + **Hinglish mode** toggle | "Bhai, 711 ghante?!" | 🇮🇳 IN | P0 |
| `es` (neutral LatAm, with ES variants for slang) | "Wey" (MX) / "tío" (ES) | 🇲🇽 MX, 🇪🇸 ES | P0 |
| `es` | | 🇨🇴 CO, 🇨🇱 CL, 🇦🇷 AR (prices change fast, flag them) | P1 |
| `pt-BR` | Brazil is a huge GTA market | 🇧🇷 BR | P2 |

- Auto-detect country from Vercel's geo header and language from `Accept-Language`. Both can be overridden in the header.
- URLs: `/{locale}/{country}`, e.g. `/en/in`, `/es/mx`, which also serve as SEO landing pages. Use `hreflang` tags.
- Jokes, local "cost in stuff" items, and rank titles are **written per locale**, not machine-translated.
- Library: `next-intl`, with messages in `messages/{locale}.json`.

## 2. Core calculator (P0)

- **Pay input:** hourly / daily / monthly / yearly / **stipend** / **pocket money** (weekly allowance, aimed at teens).
- **Hours per week** slider (default 40; 48 for IN).
- **"I'm a…" job presets** (minimum wage, barista, nurse, teacher, software dev, intern…), using public average wages.
  Users can get a result without typing their salary, which lowers friction and keeps it private.
- **Console picker:** PS5 · PS5 Pro · Xbox Series X · Xbox Series S (Series S is the "cheapest legal way" joke).
- Toggles: **I already own a console** · **Ultimate Edition**.
- **"Full setup" add-ons** checklist: extra controller, PS Plus / Game Pass (needed for GTA Online), 4K TV,
  gaming chair, headset, "energy drinks for launch week". Ticking more items makes the number climb, which is fun.
- Sale mode (Black Friday / Diwali / Christmas prices), driven from a toggle in prices.json. **P1, ready by Nov 27**

## 3. The result (P0)

- **One big number:** "**711 hours** of your life", revealed with a dramatic count-up animation.
- **Wanted level from 1 to 5 stars** with a localized joke title (e.g. ★ "Vice City CEO" … ★★★★★ "Just replay GTA 5").
- An original "MISSION PASSED / BUSTED" style banner, with no official font or assets.
- **Breakdowns** (3–4 shown, with a 🔄 shuffle button):
  - Local cost in stuff: IN chai / biryani / Maggi · US lattes / Chipotle · UK Greggs / pints · MX tacos · ES cañas…
  - Working days, plus a **"you'll be playing by Mar 3, 2027"** date.
  - **Savings plan:** "save ₹X/day" and an EMI-style monthly plan, merged into one line.
  - **Work hours per hour of gameplay** (assumes ~X hours of story).
- **Roast me** button: a random roast based on your rank. **P0**

## 4. Sharing (P0, the growth engine)

- **Story cards (1080×1920)** via html-to-image, in several templates:
  1. Wanted poster (default) 2. Receipt 3. Mission passed 4. Versus (from a challenge)
  5. Parents pitch letter 6. Squad split
- **Native share sheet** (Web Share API with the image file). Fallbacks: download, WhatsApp, X, copy link.
- **Share link** stores `hours, rank, country, locale, console`, **never the salary**. A "hide exact hours, show rank only" option is available.
- **Dynamic OG image** per link (`@vercel/og`), so WhatsApp and X previews show that person's numbers.
- **Challenge a friend:** the link opens "Rahul needs 711 hrs. Can you beat that?" and leads to a side-by-side Versus card.
- Pre-written captions per platform and locale.

## 5. Fun modes (P0 → P1)

| Feature | What it does | Priority |
|---|---|---|
| **Convince your parents** | Generates a letter: "Papa, it's just 2 chai a day 🙏" / "Mamá, son solo 3 tacos al día" | P0 |
| **Squad split** | Split a console with 2–6 friends and see hours each | P1 |
| **Launch-day excuse generator** | Fake sick-leave / bunk-class excuses, which are easy to share | P1 |
| **Cheat codes** | Type words like `MONEY` or `BROKE` for Easter-egg joke popups (original codes) | P1 |
| **Billionaire mode** | "A billionaire earns this in 0.4 seconds" (public estimates, labelled satire) | P1 |
| **PC players' waiting room** | A counter of days waited, or "hours to just buy a console" | P1 |
| **Sound FX toggle** | Original synthwave stings on the reveal | P2 |

## 6. Data pages (P1, for press, Reddit and SEO)

- **GTA 6 Affordability Index** (`/index`): about 30 countries ranked by hours needed at the median wage, plus
  a minimum-wage view, shown as an animated bar race and an exportable chart image. Aimed at r/dataisbeautiful and news.
- **Percentile:** "you need more hours than 72% of your country", using static public wage-distribution data.
- **Then vs now:** hours for GTA 5 in 2013 vs GTA 6 in 2026 per country. **P2**
- **Programmatic SEO pages:** `/es/mx/precio-gta-6-en-horas`, `/en/in/gta-6-price-in-india-in-hours`, … **P2**

## 7. Trust and legal (P0)

- Footer: "Fan-made, not affiliated with Rockstar Games or Take-Two." No Rockstar logos, artwork or official GTA font.
- "Prices last checked: <date>" per country, plus a "Report a wrong price" link (mailto or a form).
- No salary ever leaves the browser.

## 8. Analytics (P0)

Plausible (or similar, cookieless). Key events: `calculate`, `card_download`, `share_click`,
`challenge_opened`, `challenge_completed`, `locale_switch`, `mode_used:{parents|squad|...}`.

## 9. Architecture (reusable for sibling tools)

```
packages/ (or src/lib)
  engine/        pure TS: pay → hourly → hours, ranks, breakdowns, percentiles (unit-tested)
  share/         ShareCard templates, OG image renderer, URL encode/decode
  i18n/          locale + country resolution
data/
  prices.json    per country: currency, console prices, game editions, add-ons, sale overrides, lastChecked
  local-items.json  per country: chai/taco/latte prices + emoji
  wages.json     median/minimum wage + percentiles + job presets per country
messages/
  en.json  en-IN.json  hinglish.json  es.json  es-ES.json
```
Sibling tools (backlog calculator, Steam hours) reuse `engine` + `share` + `i18n` on subdomains.

## 10. Prices (one-line edits, all to be verified)

| Country | Console | GTA 6 Std | Ultimate | Status |
|---|---|---|---|---|
| IN | PS5 ₹69,990 | ₹5,999 | ₹7,499 | ✅ confirmed |
| US, UK, CA, AU, MX, ES | TBD | TBD | TBD | ⏳ verify before launch |

## Launch plan

1. **Day 1–3:** P0 (calculator, rank, breakdowns, story cards, OG, challenge, parents card, en/Hinglish/es, 7 countries).
2. **Nov 26:** Sale mode, ready for Black Friday.
3. **Week 1, roughly one per day:** Index page → Squad split → Excuse generator → PC waiting room → Billionaire → Cheat codes → more countries.
4. Post each drop on r/GTA6, r/IndianGaming, r/india, r/mexico, r/spain, r/pcmasterrace, r/dataisbeautiful, X, IG.
