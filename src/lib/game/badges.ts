"use client";
// Tiny client-side progress layer: badges + daily streak. Stored per-browser; safe if storage is blocked.
import { useEffect, useState, useSyncExternalStore } from "react";

export const BADGES = [
  "first", "share", "card", "challenge", "parents", "squad",
  "excuse", "roast", "cheat", "consoles", "rich", "wanted",
] as const;
export type BadgeId = (typeof BADGES)[number];

const KEY = "htp:badges";
const STREAK = "htp:streak";
let cache: BadgeId[] | null = null;
const listeners = new Set<() => void>();
let lastUnlocked: BadgeId | null = null;

function read(): BadgeId[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    cache = [];
  }
  return cache!;
}

export function unlock(id: BadgeId) {
  const cur = read();
  if (cur.includes(id)) return false;
  cache = [...cur, id];
  lastUnlocked = id;
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {}
  listeners.forEach((l) => l());
  return true;
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const EMPTY: BadgeId[] = [];

export function useBadges() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

/** Last badge unlocked (for the toast). */
export function useLastUnlocked() {
  const [id, setId] = useState<BadgeId | null>(null);
  useEffect(
    () =>
      subscribe(() => {
        if (lastUnlocked) {
          setId(lastUnlocked);
          lastUnlocked = null;
        }
      }),
    [],
  );
  return [id, () => setId(null)] as const;
}

/** Counts consecutive days visited. */
export function useStreak() {
  const [n, setN] = useState(0);
  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const s = JSON.parse(localStorage.getItem(STREAK) || "{}") as { d?: string; n?: number };
      const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      const next = s.d === today ? s.n ?? 1 : s.d === y ? (s.n ?? 0) + 1 : 1;
      localStorage.setItem(STREAK, JSON.stringify({ d: today, n: next }));
      setN(next);
    } catch {
      setN(1);
    }
  }, []);
  return n;
}
