import pricesJson from "@/data/prices.json";
import localJson from "@/data/local.json";
import type { CountryLocal, CountryPrices } from "@/lib/engine";
import { cheapestConsoleId, hoursAt } from "@/lib/engine";

export const SITE = {
  name: "Hours to Play",
  domain: "hourstoplay.app",
  url: "https://hourstoplay.app",
  launch: "2026-11-19",
};

export type Lang = "en" | "es";
export type CountryCode = "in" | "us" | "gb" | "ca" | "au" | "mx" | "es";

const { _readme: _p, ...pricesRaw } = pricesJson as unknown as Record<string, unknown>;
const { _readme: _l, ...localRaw } = localJson as unknown as Record<string, unknown>;
export const PRICES = pricesRaw as Record<CountryCode, CountryPrices>;
export const LOCAL = localRaw as Record<CountryCode, CountryLocal>;
export const COUNTRIES = Object.keys(PRICES) as CountryCode[];

/** Which country pages exist for which language (each one is a static, indexable page). */
export const ROUTES: Record<Lang, CountryCode[]> = {
  en: ["us", "in", "gb", "ca", "au"],
  es: ["mx", "es", "us"],
};

export const LANGS = Object.keys(ROUTES) as Lang[];

export const DEFAULT_COUNTRY: Record<Lang, CountryCode> = { en: "us", es: "mx" };

/** Rough USD value of one unit of local currency (billionaire joke + world index sorting only). */
export const USD_PER: Record<CountryCode, number> = {
  in: 0.0113,
  us: 1,
  gb: 1.31,
  ca: 0.71,
  au: 0.65,
  mx: 0.054,
  es: 1.15,
};

export const hreflang = (lang: Lang, c: CountryCode) => `${lang}-${c === "gb" ? "GB" : c.toUpperCase()}`;

export function isRoute(lang: string, c: string): lang is Lang {
  return (LANGS as string[]).includes(lang) && (ROUTES[lang as Lang] as string[]).includes(c);
}

export function pathFor(lang: Lang, c: CountryCode) {
  return `/${lang}/${c}`;
}

/** Best page for a country in a given language (falls back to that language's default). */
export function bestRoute(lang: Lang, c: string): string {
  if ((ROUTES[lang] as string[]).includes(c)) return pathFor(lang, c as CountryCode);
  const other = LANGS.find((l) => (ROUTES[l] as string[]).includes(c));
  if (other) return pathFor(other, c as CountryCode);
  return pathFor(lang, DEFAULT_COUNTRY[lang]);
}

export function countryStats(c: CountryCode) {
  const p = PRICES[c];
  const l = LOCAL[c];
  const consoleId = cheapestConsoleId(p);
  const con = p.consoles[consoleId];
  const bundle = p.game.standard + con.price;
  return {
    p,
    l,
    consoleId,
    console: con,
    bundle,
    hMin: hoursAt(p, l.minHourly, consoleId),
    hTypical: hoursAt(p, l.medianHourly, consoleId),
  };
}

export function fill(s: string, vars: Record<string, string | number>) {
  return s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}
