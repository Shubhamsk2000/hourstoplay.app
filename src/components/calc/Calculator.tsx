"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Dict } from "@/i18n/en";
import type { DictKey } from "@/i18n";
import {
  calculate,
  formatMoney,
  type AddonId,
  type CalcInput,
  type CountryLocal,
  type CountryPrices,
  type PayPeriod,
  type SharePayload,
} from "@/lib/engine";
import { fill } from "@/lib/site";
import { track } from "@/lib/analytics";
import { unlock } from "@/lib/game/badges";
import { sfx } from "@/lib/game/sfx";
import { ResultCard } from "./ResultCard";
import { ShareBox } from "./ShareBox";
import { SideMissions } from "./SideMissions";
import { BadgeToast } from "./BadgeToast";

export interface CalcProps {
  lang: "en" | "es";
  country: string;
  prices: CountryPrices;
  local: CountryLocal;
  dicts: Partial<Record<DictKey, Dict>>;
  defaultDict: DictKey;
  usdPer: number;
  challenger?: SharePayload | null;
}

const PERIODS: PayPeriod[] = ["hour", "day", "week", "month", "year", "stipend", "pocket"];
const ADDONS: AddonId[] = ["controller", "onlineSub", "tv", "headset", "chair", "energy"];

type FormState = Omit<CalcInput, "amount"> & { amount: string; name: string; job: string | null };

export function Calculator(props: CalcProps) {
  const { prices: p, local, country, lang } = props;
  const [dictKey, setDictKey] = useState<DictKey>(props.defaultDict);
  const t = props.dicts[dictKey] ?? props.dicts[props.defaultDict]!;
  const storageKey = `htp:last:${country}`;
  const consoleIds = Object.keys(p.consoles);

  const [f, setF] = useState<FormState>(() => ({
    amount: "",
    period: country === "in" || country === "mx" || country === "es" ? "month" : "hour",
    hoursPerWeek: p.hoursPerWeek,
    consoleId: consoleIds[0],
    ownsConsole: false,
    ultimate: false,
    addons: [],
    useSale: false,
    name: "",
    job: null,
  }));
  const [revealed, setRevealed] = useState(false);
  const [revealKey, setRevealKey] = useState(0);
  const triedConsoles = useRef(new Set<string>());
  const resultRef = useRef<HTMLDivElement>(null);

  // Restore last session (per country) and language-flavour preference.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (saved && typeof saved === "object") {
        setF((cur) => ({ ...cur, ...saved, consoleId: p.consoles[saved.consoleId] ? saved.consoleId : cur.consoleId }));
        if (saved.amount && !props.challenger) setRevealed(true);
      }
      const pref = localStorage.getItem("htp:dict") as DictKey | null;
      if (pref && props.dicts[pref]) setDictKey(pref);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!revealed) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(f));
    } catch {}
  }, [f, revealed, storageKey]);

  const input: CalcInput = { ...f, amount: Number(f.amount.replace(/[^\d.]/g, "")) };
  const result = useMemo(() => calculate(p, local, input), [p, local, JSON.stringify(input)]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    sfx.click();
    setF((cur) => ({ ...cur, [k]: v, ...(k === "period" ? { job: null } : {}) }));
  };

  useEffect(() => {
    if (!revealed || f.ownsConsole) return;
    triedConsoles.current.add(f.consoleId);
    if (triedConsoles.current.size >= 3) unlock("consoles");
  }, [f.consoleId, f.ownsConsole, revealed]);

  function pickJob(id: string) {
    sfx.click();
    setF((cur) => ({ ...cur, amount: String(local.jobs[id]), period: "hour", job: id }));
    track("job_preset", { job: id, country });
  }

  function go(e?: React.FormEvent) {
    e?.preventDefault();
    if (!result) return;
    setRevealed(true);
    setRevealKey((k) => k + 1);
    unlock("first");
    if (result.rank === 1) unlock("rich");
    if (result.rank === 5) unlock("wanted");
    track("calculate", { country, rank: result.rank, period: f.period, lang: dictKey });
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function toggleDict(k: DictKey) {
    setDictKey(k);
    try {
      localStorage.setItem("htp:dict", k);
    } catch {}
    track("locale_switch", { to: k });
  }

  const money = (n: number) => formatMoney(n, p);
  const fmtLocale = lang === "es" ? (p.locale.startsWith("es") ? p.locale : "es-US") : p.locale;
  const approx = (v: boolean) => (v ? "" : "≈ ");

  const payload: SharePayload | null = result
    ? { h: result.hours, c: country, r: result.rank, n: f.name || undefined, k: f.ownsConsole ? "own" : f.consoleId, u: f.ultimate ? 1 : undefined }
    : null;

  return (
    <div className="flex flex-col gap-5">
      <BadgeToast t={t} />

      {props.challenger && (
        <div className="card animate-rise border-pink/40! p-4">
          <p className="label text-pink!">{t.challenge.vs} · {props.challenger.n || t.challenge.someone}</p>
          <p className="mt-1 font-display text-2xl leading-tight font-bold uppercase">
            {props.challenger.x
              ? fill(t.challenge.bannerHidden, { name: props.challenger.n || t.challenge.someone, stars: "★".repeat(props.challenger.r) })
              : fill(t.challenge.banner, { name: props.challenger.n || t.challenge.someone, h: Math.round(props.challenger.h) })}
          </p>
          <p className="mt-1 text-sm text-muted">{t.challenge.cta}</p>
        </div>
      )}

      {/* ---------- FORM ---------- */}
      <form onSubmit={go} className="card hud-corners p-5" aria-label="Calculator">
        {props.dicts.hinglish && props.dicts.en && (
          <div className="seg mb-5" role="group" aria-label="Language">
            {(["en", "hinglish"] as DictKey[]).map((k) => (
              <button key={k} type="button" aria-pressed={dictKey === k} onClick={() => toggleDict(k)}>
                {k === "en" ? "English" : "Hinglish"}
              </button>
            ))}
          </div>
        )}

        <label htmlFor="pay" className="label">
          {t.form.pay}
        </label>
        <div className="mt-2 flex gap-2">
          <div className="field flex flex-1 items-center gap-2 py-0! pr-2!">
            <span className="font-display text-xl text-muted">{p.symbol}</span>
            <input
              id="pay"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0"
              className="w-full min-w-0 bg-transparent py-3 font-display text-2xl font-medium tracking-wide outline-none placeholder:text-dim"
              value={f.amount}
              onChange={(e) => setF((c) => ({ ...c, amount: e.target.value.replace(/[^\d.,]/g, ""), job: null }))}
            />
          </div>
          <select
            aria-label="Pay period"
            className="field w-[42%] text-sm font-semibold"
            value={f.period}
            onChange={(e) => set("period", e.target.value as PayPeriod)}
          >
            {PERIODS.map((k) => (
              <option key={k} value={k}>
                {t.form.period[k]}
              </option>
            ))}
          </select>
        </div>

        <p className="mt-4 text-xs text-muted">{t.form.orJob}</p>
        <div className="-mx-5 mt-2 flex gap-1.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
          {Object.keys(local.jobs).map((id) => (
            <button key={id} type="button" className="pill shrink-0" aria-pressed={f.job === id} onClick={() => pickJob(id)}>
              {t.form.jobs[id as keyof Dict["form"]["jobs"]] ?? id}
            </button>
          ))}
        </div>

        <div className="mt-5 h-px bg-line" />

        <div className={`mt-5 transition-opacity ${f.ownsConsole ? "pointer-events-none opacity-35" : ""}`}>
          <label htmlFor="console" className="label">
            {t.form.console}
          </label>
          <select id="console" className="field mt-2 font-semibold" value={f.consoleId} onChange={(e) => set("consoleId", e.target.value)} disabled={f.ownsConsole}>
            {consoleIds.map((id) => (
              <option key={id} value={id}>
                {p.consoles[id].label} — {approx(p.consoles[id].verified)}
                {money(p.consoles[id].price)}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 divide-y divide-line rounded-[0.9rem] border border-line bg-black/25">
          <Toggle on={f.ownsConsole} onChange={(v) => set("ownsConsole", v)} label={t.form.own} />
          <Toggle on={f.ultimate} onChange={(v) => set("ultimate", v)} label={t.form.ultimate} hint={`${approx(p.game.verified)}${money(p.game.ultimate)}`} />
          {p.sale && <Toggle on={f.useSale} onChange={(v) => set("useSale", v)} label={t.form.sale} hint={p.sale.label} />}
        </div>

        <details className="group mt-4">
          <summary className="flex cursor-pointer list-none items-center justify-between py-1 text-sm font-semibold text-muted hover:text-text">
            <span>
              {t.form.addonsTitle}
              {f.addons.length > 0 && <span className="ml-2 rounded-full bg-pink/20 px-2 py-0.5 text-xs text-pink">+{f.addons.length}</span>}
            </span>
            <span className="transition group-open:rotate-180">⌄</span>
          </summary>
          <div className="mt-3 space-y-5">
            <div>
              <label htmlFor="hpw" className="flex items-center justify-between">
                <span className="label">{t.form.hpw}</span>
                <span className="font-display text-sm">{f.hoursPerWeek}h</span>
              </label>
              <input
                id="hpw"
                type="range"
                min={5}
                max={80}
                value={f.hoursPerWeek}
                onChange={(e) => setF((c) => ({ ...c, hoursPerWeek: Number(e.target.value) }))}
                className="mt-2 w-full accent-pink"
              />
            </div>
            <div>
              <p className="label">{t.form.fullSetup}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ADDONS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    className="pill"
                    aria-pressed={f.addons.includes(a)}
                    onClick={() => set("addons", f.addons.includes(a) ? f.addons.filter((x) => x !== a) : [...f.addons, a])}
                  >
                    {t.form.addons[a]} <span className="text-dim">{money(p.addons[a])}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="nm" className="label">
                {t.form.name}
              </label>
              <input id="nm" className="field mt-2" maxLength={18} placeholder={t.form.namePh} value={f.name} onChange={(e) => setF((c) => ({ ...c, name: e.target.value }))} />
            </div>
          </div>
        </details>

        <button type="submit" disabled={!result} className="btn btn-primary mt-5 w-full py-4 text-base disabled:opacity-40 disabled:shadow-none">
          {t.form.go} →
        </button>
      </form>

      {/* ---------- RESULT ---------- */}
      <div ref={resultRef} className="scroll-mt-20" />
      {revealed && result && payload && (
        <>
          <ResultCard
            key={revealKey}
            t={t}
            result={result}
            prices={p}
            local={local}
            isPocket={f.period === "pocket"}
            fmtLocale={fmtLocale}
            challenger={props.challenger}
            money={money}
          />
          <ShareBox t={t} lang={lang} dictKey={dictKey} payload={payload} challenger={props.challenger} />
          <SideMissions t={t} result={result} prices={p} local={local} money={money} name={f.name} usdPer={props.usdPer} fmtLocale={fmtLocale} />
        </>
      )}
    </div>
  );
}

function Toggle({ on, onChange, label, hint }: { on: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
      <span className="text-sm font-semibold">
        {label}
        {hint && <span className="ml-2 text-xs font-normal text-muted">{hint}</span>}
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-gradient-to-r from-pink to-orange" : "bg-white/12"}`}>
        <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${on ? "left-[1.4rem]" : "left-0.5"}`} />
      </span>
    </button>
  );
}
