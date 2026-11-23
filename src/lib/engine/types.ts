// Pure, framework-free types. Reusable by sibling tools (backlog calculator, Steam hours…).

export type PayPeriod = "hour" | "day" | "week" | "month" | "year" | "stipend" | "pocket";

export type AddonId = "controller" | "onlineSub" | "tv" | "headset" | "chair" | "energy";

export interface PriceTag {
  price: number;
  verified: boolean;
  label: string;
}

export interface CountryPrices {
  name: string;
  flag: string;
  currency: string;
  symbol: string;
  locale: string;
  lastChecked: string;
  hoursPerWeek: number;
  game: { standard: number; ultimate: number; verified: boolean };
  consoles: Record<string, PriceTag>;
  addons: Record<AddonId, number>;
  sale: null | { label: string; consoles?: Record<string, number>; game?: { standard?: number; ultimate?: number } };
}

export interface LocalItem {
  id: string;
  emoji: string;
  price: number;
}

export interface CountryLocal {
  items: LocalItem[];
  medianHourly: number;
  minHourly: number;
  jobs: Record<string, number>;
}

export interface CalcInput {
  amount: number;
  period: PayPeriod;
  hoursPerWeek: number;
  consoleId: string;
  ownsConsole: boolean;
  ultimate: boolean;
  addons: AddonId[];
  useSale: boolean;
}

export interface CalcResult {
  total: number;
  hourly: number;
  hours: number;
  /** For pocket-money mode: weeks of allowance. */
  weeks: number;
  workDays: number;
  playDate: Date;
  rank: 1 | 2 | 3 | 4 | 5;
  vsMedian: number;
  perGameplayHour: number;
  dailySave90: number;
  lines: { label: "game" | "console" | AddonId; amount: number }[];
}
