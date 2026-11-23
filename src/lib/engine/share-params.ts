// Encode/decode the public part of a result for share links. NEVER includes pay.

export interface SharePayload {
  h: number; // hours (rounded)
  c: string; // country code
  r: number; // rank 1-5
  n?: string; // optional nickname
  k?: string; // console id ("own" if they own one)
  u?: 1; // ultimate edition
  x?: 1; // hide exact hours (rank only)
}

const clampName = (s: string) => s.replace(/[^\p{L}\p{N} _.-]/gu, "").trim().slice(0, 18);

export function toSearch(p: SharePayload): string {
  const q = new URLSearchParams();
  q.set("h", String(Math.round(p.h * 10) / 10));
  q.set("c", p.c);
  q.set("r", String(p.r));
  if (p.n) q.set("n", clampName(p.n));
  if (p.k) q.set("k", p.k);
  if (p.u) q.set("u", "1");
  if (p.x) q.set("x", "1");
  return q.toString();
}

export function fromSearch(q: URLSearchParams | Record<string, string | string[] | undefined>): SharePayload | null {
  const get = (k: string) => {
    if (q instanceof URLSearchParams) return q.get(k) ?? undefined;
    const v = q[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const h = Number(get("h"));
  const c = (get("c") ?? "").toLowerCase();
  const r = Number(get("r"));
  if (!Number.isFinite(h) || h <= 0 || h > 1e7 || !/^[a-z]{2}$/.test(c) || !(r >= 1 && r <= 5)) return null;
  const n = get("n");
  return {
    h,
    c,
    r: Math.round(r),
    n: n ? clampName(n) : undefined,
    k: get("k")?.slice(0, 10),
    u: get("u") === "1" ? 1 : undefined,
    x: get("x") === "1" ? 1 : undefined,
  };
}
