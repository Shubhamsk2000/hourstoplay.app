import { ImageResponse } from "next/og";
import { getDict, type DictKey } from "@/i18n";
import { fromSearch } from "@/lib/engine";
import { countryStats, fill, PRICES, SITE, type CountryCode } from "@/lib/site";
import { ShareCard, type CardData } from "@/components/share/ShareCard";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

const FONT_DIR = join(process.cwd(), "src/assets/fonts");
const fontsP = Promise.all([
  readFile(join(FONT_DIR, "Oswald-Bold.ttf")),
  readFile(join(FONT_DIR, "Inter-Medium.ttf")),
]);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams;
  const format = q.get("f") === "story" ? "story" : "og";
  const lKey = (["en", "es", "hinglish"].includes(q.get("l") ?? "") ? q.get("l") : "en") as DictKey;
  const t = getDict(lKey);
  const payload = fromSearch(q);
  const tplRaw = q.get("tpl");
  const tpl = tplRaw === "receipt" || tplRaw === "versus" ? tplRaw : "wanted";

  let data: CardData;
  const cc = (payload?.c ?? q.get("c") ?? "us") as CountryCode;
  const p = PRICES[cc] ?? PRICES.us;

  if (payload) {
    const consoleLabel = payload.k === "own" ? null : p.consoles[payload.k ?? ""]?.label ?? null;
    const vh = Number(q.get("vh"));
    data = {
      kind: tpl,
      hours: payload.x ? null : Math.round(payload.h),
      rank: payload.r,
      rankTitle: t.result.ranks[payload.r - 1].title,
      name: payload.n ?? null,
      subtitle: `GTA 6${payload.u ? " Ultimate" : ""}${consoleLabel ? ` + ${consoleLabel}` : ""} · ${p.name}`,
      hoursLabel: t.result.hoursOfLife,
      wanted: t.result.wanted,
      cta: lKey === "es" ? "¿Y tú cuántas horas?" : lKey === "hinglish" ? "Tumhare kitne ghante?" : "How many hours for you?",
      vs:
        tpl === "versus" && Number.isFinite(vh) && vh > 0
          ? { hours: Math.round(vh), rank: Math.min(5, Math.max(1, Number(q.get("vr")) || 1)), name: (q.get("vn") ?? t.challenge.someone).slice(0, 18) }
          : null,
      vsLabel: t.challenge.vs,
      disclaimer: t.footer.disclaimer,
    };
  } else {
    const s = countryStats(cc in PRICES ? cc : "us");
    data = {
      kind: "landing",
      hours: Math.round(s.hTypical),
      rank: 0,
      rankTitle: t.hero.h1,
      name: null,
      subtitle: fill(lKey === "es" ? "GTA 6 + {c} en {country} con sueldo típico" : "GTA 6 + {c} in {country} on a typical wage", {
        c: s.console.label,
        country: p.name,
      }),
      hoursLabel: lKey === "es" ? "horas de trabajo" : "hours of work",
      wanted: "",
      cta: lKey === "es" ? "Calcula las tuyas" : "Calculate yours",
      vs: null,
      vsLabel: "",
      disclaimer: t.footer.disclaimer,
    };
  }

  const [oswald, inter] = await fontsP;
  const size = format === "story" ? { width: 1080, height: 1920 } : { width: 1200, height: 630 };
  return new ImageResponse(<ShareCard data={data} format={format} domain={SITE.domain} />, {
    ...size,
    fonts: [
      { name: "Oswald", data: oswald, weight: 700, style: "normal" },
      { name: "Inter", data: inter, weight: 500, style: "normal" },
    ],
    headers: { "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable" },
  });
}
