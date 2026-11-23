import type { CalcInput, CalcResult, CountryLocal, CountryPrices } from "./types";

/** Assumed length of the main story, used for "work hours per hour of gameplay". */
export const STORY_HOURS = 60;

export function hourlyFrom(amount: number, period: CalcInput["period"], hoursPerWeek: number): number {
  const hpw = Math.max(1, hoursPerWeek);
  const daysPerWeek = hpw >= 45 ? 6 : 5;
  switch (period) {
    case "hour":
      return amount;
    case "day":
      return amount / (hpw / daysPerWeek);
    case "week":
    case "pocket":
      return amount / hpw;
    case "month":
    case "stipend":
      return (amount * 12) / 52 / hpw;
    case "year":
      return amount / 52 / hpw;
  }
}

export function totalCost(p: CountryPrices, i: Pick<CalcInput, "consoleId" | "ownsConsole" | "ultimate" | "addons" | "useSale">) {
  const sale = i.useSale ? p.sale : null;
  const game = i.ultimate
    ? sale?.game?.ultimate ?? p.game.ultimate
    : sale?.game?.standard ?? p.game.standard;
  const lines: CalcResult["lines"] = [{ label: "game", amount: game }];
  if (!i.ownsConsole) {
    const c = p.consoles[i.consoleId] ?? Object.values(p.consoles)[0];
    lines.push({ label: "console", amount: sale?.consoles?.[i.consoleId] ?? c.price });
  }
  for (const a of i.addons) lines.push({ label: a, amount: p.addons[a] });
  return { total: lines.reduce((s, l) => s + l.amount, 0), lines };
}

export function rankFor(hours: number): CalcResult["rank"] {
  if (hours < 10) return 1;
  if (hours < 40) return 2;
  if (hours < 120) return 3;
  if (hours < 400) return 4;
  return 5;
}

export function addWorkDays(from: Date, workDays: number, daysPerWeek: number): Date {
  // Convert working days to calendar days (weekends off) and add them.
  const calendar = Math.ceil((workDays / daysPerWeek) * 7);
  const d = new Date(from);
  d.setDate(d.getDate() + calendar);
  return d;
}

export function calculate(p: CountryPrices, local: CountryLocal, i: CalcInput, now = new Date()): CalcResult | null {
  if (!(i.amount > 0)) return null;
  const hourly = hourlyFrom(i.amount, i.period, i.hoursPerWeek);
  const { total, lines } = totalCost(p, i);
  const hours = total / hourly;
  const daysPerWeek = i.hoursPerWeek >= 45 ? 6 : 5;
  const hoursPerDay = i.hoursPerWeek / daysPerWeek;
  const workDays = hours / hoursPerDay;
  const medianHours = total / local.medianHourly;
  return {
    total,
    hourly,
    hours,
    weeks: i.period === "pocket" ? total / i.amount : hours / i.hoursPerWeek,
    workDays,
    playDate: addWorkDays(now, workDays, daysPerWeek),
    rank: rankFor(hours),
    vsMedian: hours / medianHours,
    perGameplayHour: hours / STORY_HOURS,
    dailySave90: total / 90,
    lines,
  };
}

/** Hours for a reference hourly wage — used by the World Index and job presets. */
export function hoursAt(p: CountryPrices, hourly: number, consoleId?: string) {
  const cheapest = consoleId
    ? p.consoles[consoleId]?.price
    : Math.min(...Object.values(p.consoles).map((c) => c.price));
  return (p.game.standard + (cheapest ?? 0)) / hourly;
}

export function cheapestConsoleId(p: CountryPrices): string {
  return Object.entries(p.consoles).sort((a, b) => a[1].price - b[1].price)[0][0];
}

export function formatMoney(amount: number, p: Pick<CountryPrices, "currency" | "locale">, digits?: number) {
  return new Intl.NumberFormat(p.locale, {
    style: "currency",
    currency: p.currency,
    maximumFractionDigits: digits ?? (amount >= 100 ? 0 : 2),
  }).format(amount);
}

export function formatNum(n: number, locale: string, digits = 0) {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(n);
}

/** Human-friendly hour count: 0.4 → "0.4", 12.3 → "12", 711.2 → "711". */
export function niceHours(h: number) {
  if (h < 1) return Math.round(h * 10) / 10;
  if (h < 10) return Math.round(h * 10) / 10;
  return Math.round(h);
}
