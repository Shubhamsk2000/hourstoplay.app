"use client";

import { useEffect, useState } from "react";
import type { Dict } from "@/i18n/en";
import { cheapestConsoleId, formatNum, type CalcResult, type CountryLocal, type CountryPrices } from "@/lib/engine";
import { fill, SITE } from "@/lib/site";
import { BADGES, unlock, useBadges, useStreak, type BadgeId } from "@/lib/game/badges";
import { isMuted, setMuted, sfx } from "@/lib/game/sfx";
import { track } from "@/lib/analytics";

type Tab = "parents" | "squad" | "excuse" | "roast" | "billionaire" | "pc" | "cheats" | "badges";
const TABS: { id: Tab; icon: string; badge?: BadgeId }[] = [
  { id: "parents", icon: "✉", badge: "parents" },
  { id: "squad", icon: "⚇", badge: "squad" },
  { id: "excuse", icon: "✚", badge: "excuse" },
  { id: "roast", icon: "🔥", badge: "roast" },
  { id: "billionaire", icon: "$" },
  { id: "pc", icon: "⌨" },
  { id: "cheats", icon: "▣" },
  { id: "badges", icon: "★" },
];

interface Props {
  t: Dict;
  result: CalcResult;
  prices: CountryPrices;
  local: CountryLocal;
  money: (n: number) => string;
  name: string;
  usdPer: number;
  fmtLocale: string;
}

export function SideMissions({ t, result, prices: p, local, money, name, usdPer, fmtLocale }: Props) {
  const [tab, setTab] = useState<Tab | null>(null);
  const [squad, setSquad] = useState(3);
  const [excuseI, setExcuseI] = useState(0);
  const [roastI, setRoastI] = useState(0);
  const [copied, setCopied] = useState(false);
  const [muted, setM] = useState(false);
  const badges = useBadges();
  const streak = useStreak();
  const nf = (n: number, d = 0) => formatNum(n, fmtLocale, d);

  useEffect(() => setM(isMuted()), []);

  const label = (id: Tab) => (id === "cheats" ? t.game.cheatBtn : id === "badges" ? t.game.badges : t.fun.tabs[id]);

  function open(id: Tab) {
    sfx.click();
    setTab((cur) => (cur === id ? null : id));
    const b = TABS.find((x) => x.id === id)?.badge;
    if (b) unlock(b);
    track("mode_used", { mode: id });
    if (id === "excuse") setExcuseI(Math.floor(Math.random() * t.fun.excuse.list.length));
    if (id === "roast") setRoastI(Math.floor(Math.random() * 3));
  }

  const daily = result.dailySave90;
  const item = local.items[0];
  const letter = fill(t.fun.parents.letter, {
    daily: money(daily),
    k: nf(Math.ceil(daily / item.price)),
    item: t.items[item.id] ?? item.id,
    name: name || t.fun.parents.you,
  });
  const billionSecs = (result.total * usdPer) / (1_000_000 / 3600);
  const pcHours = (p.consoles[cheapestConsoleId(p)].price + p.game.standard) / result.hourly;

  return (
    <section className="card animate-rise p-5 [animation-delay:.2s]">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-lg font-bold tracking-wide uppercase">{t.fun.title}</h2>
        <div className="flex items-center gap-1.5">
          {streak > 1 && <span className="pill">🔥 {streak}</span>}
          <button type="button" className="pill" onClick={() => open("badges")}>
            ★ {badges.length}/{BADGES.length}
          </button>
          <button type="button" className="pill" aria-label={t.game.sound} aria-pressed={!muted} onClick={() => { setMuted(!muted); setM(!muted); }}>
            {muted ? "🔇" : "🔊"}
          </button>
        </div>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/8">
        <div className="h-full bg-gradient-to-r from-pink to-orange transition-all duration-700" style={{ width: `${(badges.length / BADGES.length) * 100}%` }} />
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {TABS.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => open(x.id)}
            aria-pressed={tab === x.id}
            className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border px-1 text-center text-[10.5px] leading-tight font-semibold transition ${
              tab === x.id ? "border-pink/60 bg-pink/12 text-text" : "border-line bg-white/[0.03] text-muted hover:text-text"
            }`}
          >
            <span className="font-display text-lg leading-none">{x.icon}</span>
            {label(x.id)}
          </button>
        ))}
      </div>

      {tab && (
        <div key={tab} className="mt-4 animate-rise rounded-2xl border border-line bg-black/30 p-4">
          {tab === "parents" && (
            <>
              <p className="text-sm leading-relaxed whitespace-pre-line text-text/90">{letter}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="btn btn-ghost py-2.5 text-sm"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(letter);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    } catch {}
                  }}
                >
                  {copied ? t.share.copied : t.fun.parents.copy}
                </button>
                <a
                  className="btn btn-primary py-2.5 text-xs"
                  target="_blank"
                  rel="noopener"
                  href={`https://wa.me/?text=${encodeURIComponent(`${letter}\n\n${SITE.url}`)}`}
                  onClick={() => track("share_click", { via: "parents_whatsapp" })}
                >
                  {t.fun.parents.send}
                </a>
              </div>
            </>
          )}

          {tab === "squad" && (
            <div className="text-center">
              <label className="label" htmlFor="sq">
                {t.fun.squad.label}: <span className="text-text">{squad}</span>
              </label>
              <input id="sq" type="range" min={2} max={8} value={squad} onChange={(e) => setSquad(Number(e.target.value))} className="mt-2 w-full accent-pink" />
              <p className="mt-3 font-display text-5xl font-bold">
                <span className="grad-text">{nf(result.hours / squad, 1)}h</span>
              </p>
              <p className="mt-2 text-sm">{fill(t.fun.squad.result, { n: squad, h: nf(result.hours / squad, 1) })}</p>
              <p className="mt-1 text-xs text-muted">{t.fun.squad.fine}</p>
            </div>
          )}

          {tab === "excuse" && (
            <div className="text-center">
              <p className="font-display text-xl leading-snug">“{t.fun.excuse.list[excuseI % t.fun.excuse.list.length]}”</p>
              <button type="button" className="btn btn-ghost mt-4 px-5 py-2.5 text-sm" onClick={() => { sfx.click(); setExcuseI((i) => i + 1); }}>
                ↻ {t.fun.excuse.btn}
              </button>
            </div>
          )}

          {tab === "roast" && (
            <div className="text-center">
              <p className="font-display text-xl leading-snug">{t.fun.roast.byRank[result.rank - 1][roastI % 3]}</p>
              <button type="button" className="btn btn-ghost mt-4 px-5 py-2.5 text-sm" onClick={() => { sfx.click(); setRoastI((i) => i + 1); }}>
                ↻ {t.fun.roast.btn}
              </button>
            </div>
          )}

          {tab === "billionaire" && (
            <div className="text-center">
              <p className="font-display text-6xl font-bold">
                <span className="grad-text">{nf(billionSecs, billionSecs < 10 ? 1 : 0)}s</span>
              </p>
              <p className="mt-2 text-sm">{fill(t.fun.billionaire.text, { s: nf(billionSecs, 1) })}</p>
              <p className="mt-1 text-sm text-muted">{fill(t.fun.billionaire.you, { h: nf(result.hours) })}</p>
              <p className="mt-3 text-[11px] text-dim">{t.fun.billionaire.note}</p>
            </div>
          )}

          {tab === "pc" && <PcRoom t={t} hours={pcHours} nf={nf} />}
          {tab === "cheats" && <Cheats t={t} symbol={p.symbol} />}

          {tab === "badges" && (
            <ul className="grid grid-cols-2 gap-2">
              {BADGES.map((b) => {
                const got = badges.includes(b);
                return (
                  <li key={b} className={`rounded-xl border p-2.5 ${got ? "border-orange/40 bg-orange/10" : "border-line opacity-50"}`}>
                    <p className="text-sm font-semibold">
                      {got ? "★" : "☆"} {t.game.list[b].name}
                    </p>
                    <p className="text-[11px] text-muted">{t.game.list[b].desc}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

function Cheats({ t, symbol }: { t: Dict; symbol: string }) {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  function fire(c: string) {
    const m = t.game.cheats[c];
    if (m) {
      setMsg(fill(m, { sym: symbol }));
      unlock("cheat");
      sfx.win();
      track("cheat", { code: c });
    } else {
      setMsg(t.game.cheatUnknown);
      sfx.siren();
    }
  }
  return (
    <div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          fire(code.trim().toUpperCase());
          setCode("");
        }}
      >
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t.game.cheatPh} className="field min-w-0 flex-1 font-mono text-sm tracking-widest uppercase" />
        <button className="btn btn-primary px-4 text-xs">OK</button>
      </form>
      <p className="mt-2 text-[11px] text-dim">{t.game.cheatHint}</p>
      {msg && <p className="mt-3 animate-rise rounded-xl border border-cyan/30 bg-cyan/10 p-3 font-mono text-sm text-cyan">{msg}</p>}
    </div>
  );
}

function PcRoom({ t, hours, nf }: { t: Dict; hours: number; nf: (n: number, d?: number) => string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const ms = now - new Date(`${SITE.launch}T00:00:00Z`).getTime();
  const pad = (n: number) => String(n).padStart(2, "0");
  const parts = [Math.floor(ms / 864e5), pad(Math.floor((ms % 864e5) / 36e5)), pad(Math.floor((ms % 36e5) / 6e4)), pad(Math.floor((ms % 6e4) / 1e3))];
  return (
    <div className="text-center">
      <p className="font-display text-4xl font-bold tabular-nums text-cyan" style={{ textShadow: "0 0 24px rgb(61 245 255 / .5)" }}>
        {parts[0]}d {parts[1]}:{parts[2]}:{parts[3]}
      </p>
      <p className="label mt-1">{t.fun.pc.days}</p>
      <p className="mt-4 text-sm">
        {t.fun.pc.release}: <span className="text-pink">{t.fun.pc.unknown}</span>
      </p>
      <p className="mt-2 text-sm text-muted">{fill(t.fun.pc.instead, { h: nf(hours) })}</p>
    </div>
  );
}
