"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dict } from "@/i18n/en";
import { formatNum, niceHours, STORY_HOURS, type CalcResult, type CountryLocal, type CountryPrices, type SharePayload } from "@/lib/engine";
import { fill } from "@/lib/site";
import { sfx } from "@/lib/game/sfx";
import { Stars } from "../Stars";
import { Sparkles } from "./Confetti";

interface Props {
  t: Dict;
  result: CalcResult;
  prices: CountryPrices;
  local: CountryLocal;
  isPocket: boolean;
  fmtLocale: string;
  challenger?: SharePayload | null;
  money: (n: number) => string;
}

function useCountUp(target: number, ms = 1100) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    let lastTick = 0;
    const start = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / ms);
      setV(target * (1 - Math.pow(1 - k, 4)));
      if (now - lastTick > 80 && k < 1) {
        sfx.tick();
        lastTick = now;
      }
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return v;
}

export function ResultCard({ t, result, prices: p, local, isPocket, fmtLocale, challenger, money }: Props) {
  const main = isPocket ? result.weeks : result.hours;
  const counted = useCountUp(main);
  const [done, setDone] = useState(false);
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => {
      setDone(true);
      if (result.rank <= 2) sfx.win();
      else if (result.rank === 5) sfx.siren();
      else sfx.badge();
    }, 1150);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rank = t.result.ranks[result.rank - 1];
  const items = useMemo(() => {
    const arr = [...local.items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (i * 7 + seed * 3 + 1) % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, 3);
  }, [local.items, seed]);

  const nf = (n: number, d = 0) => formatNum(n, fmtLocale, d);
  const date = new Intl.DateTimeFormat(fmtLocale, { day: "numeric", month: "short", year: "numeric" }).format(result.playDate);
  const vs = result.vsMedian;
  const diff = challenger && !challenger.x ? Math.round(challenger.h - result.hours) : null;
  const challengerName = challenger?.n || t.challenge.someone;
  const shown = done ? niceHours(main) : Math.floor(counted);

  return (
    <section aria-live="polite" className="card hud-corners relative animate-rise overflow-hidden">
      {result.rank <= 2 && done && <Sparkles />}
      {/* scanline sweep on reveal */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-pink/10 to-transparent" style={{ animation: "scan 1.1s ease-out both" }} />

      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <span className="label">{t.result.wanted}</span>
        <span className={`label rounded-md px-2 py-0.5 ${result.rank >= 4 ? "bg-lose/15 text-lose!" : result.rank <= 2 ? "bg-win/15 text-win!" : "bg-orange/15 text-orange!"}`}>
          {t.result.stamps[result.rank - 1]}
        </span>
      </div>

      <div className="px-5 pt-6 pb-6 text-center">
        <Stars n={result.rank} size={30} animate />
        <p className="glow mt-4 font-display text-[clamp(5rem,26vw,8.5rem)] leading-[0.9] font-bold tabular-nums">
          <span className="grad-text">{nf(shown, main < 10 ? 1 : 0)}</span>
        </p>
        <p className="label mt-2 text-text!">{isPocket ? t.result.weeksOfPocket : t.result.hoursOfLife}</p>

        <div className={`mt-6 transition-all duration-500 ${done ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
          <p className="font-display text-2xl font-bold uppercase">“{rank.title}”</p>
          <p className="mt-1 text-sm text-muted">{rank.quip}</p>
        </div>

        {diff !== null && (
          <p
            className={`mt-5 rounded-xl border px-3 py-2.5 text-sm font-semibold ${
              diff > 0 ? "border-win/30 bg-win/10 text-win" : diff < 0 ? "border-lose/30 bg-lose/10 text-lose" : "border-orange/30 bg-orange/10 text-orange"
            }`}
          >
            {diff > 0
              ? fill(t.challenge.youWin, { d: nf(diff), name: challengerName })
              : diff < 0
                ? fill(t.challenge.youLose, { d: nf(-diff), name: challengerName })
                : fill(t.challenge.tie, { name: challengerName })}
          </p>
        )}
      </div>

      {/* stat grid */}
      <dl className="grid grid-cols-2 border-t border-line">
        <Stat k={t.result.total} v={money(result.total)} />
        <Stat k="📅" v={fill(t.result.workDays, { n: nf(result.workDays, 1) })} small />
        <Stat k="🎮" v={fill(t.result.playDate, { date })} small />
        <Stat k="🐷" v={fill(t.result.save, { money: money(result.dailySave90) })} small />
        <Stat k="⏱" v={fill(t.result.gameplay, { n: nf(result.perGameplayHour, 1), story: STORY_HOURS })} small />
        <Stat
          k="📊"
          v={vs >= 1 ? fill(t.result.vsMedianMore, { n: nf(vs, 1), country: p.name }) : fill(t.result.vsMedianLess, { n: nf(1 / vs, 1), country: p.name })}
          small
        />
      </dl>

      {/* that's also… */}
      <div className="border-t border-line px-5 py-4">
        <ul className="space-y-2.5">
          {items.map((it) => (
            <li key={it.id + seed} className="flex animate-rise items-baseline justify-between gap-3">
              <span className="text-sm text-muted">
                <span className="mr-2">{it.emoji}</span>
                {t.items[it.id] ?? it.id}
              </span>
              <span className="font-display text-lg font-bold tabular-nums">{nf(result.total / it.price)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between">
          <button type="button" onClick={() => { sfx.click(); setSeed((s) => s + 1); }} className="text-xs font-semibold text-muted hover:text-text">
            ↻ {t.result.shuffle}
          </button>
          <details className="text-right">
            <summary className="cursor-pointer list-none text-xs font-semibold text-muted hover:text-text">{t.result.breakdown} ⌄</summary>
            <div className="mt-2 space-y-1 text-left font-mono text-xs text-muted">
              {result.lines.map((l) => (
                <div key={l.label} className="flex justify-between gap-6">
                  <span>{t.result.lines[l.label]}</span>
                  <span>{money(l.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between gap-6 border-t border-line pt-1 text-text">
                <span>{t.result.total}</span>
                <span>{money(result.total)}</span>
              </div>
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}

function Stat({ k, v, small }: { k: string; v: string; small?: boolean }) {
  return (
    <div className="border-line px-4 py-3.5 odd:border-r [&:nth-child(n+3)]:border-t">
      <dt className={small ? "text-base" : "label"}>{k}</dt>
      <dd className={`mt-1 ${small ? "text-[13px] leading-snug text-muted" : "font-display text-xl font-bold"}`}>{v}</dd>
    </div>
  );
}
