"use client";

import { useState } from "react";
import type { Dict } from "@/i18n/en";
import type { DictKey } from "@/i18n";
import { toSearch, type SharePayload } from "@/lib/engine";
import { fill, SITE } from "@/lib/site";
import { track } from "@/lib/analytics";
import { unlock } from "@/lib/game/badges";
import { sfx } from "@/lib/game/sfx";

type Tpl = "wanted" | "receipt" | "versus";

interface Props {
  t: Dict;
  lang: "en" | "es";
  dictKey: DictKey;
  payload: SharePayload;
  challenger?: SharePayload | null;
}

const Icon = {
  wa: (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.6 14.1c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1a17 17 0 0 1-1.7-.6 13.4 13.4 0 0 1-5.2-4.6 5.9 5.9 0 0 1-1.2-3.1c0-1.5.8-2.2 1.1-2.5.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .7.5l1 2.4c.1.2.1.4 0 .6l-.4.6-.5.5c-.2.2-.3.3-.1.7.2.3.9 1.5 2 2.4 1.3 1.2 2.4 1.6 2.8 1.7.3.2.5.1.7-.1l1-1.2c.2-.3.4-.3.7-.2l2.3 1.1c.3.2.5.2.6.4.1.1.1.8-.2 1.5Z" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
      <path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.2-8.3L1.9 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.3 4.7H5.5l11.2 14.5Z" />
    </svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </svg>
  ),
  vs: (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2M9.5 6.5 21 18v3h-3L6.5 9.5M5 14l-2 2M7 17l-3 3" />
    </svg>
  ),
};

export function ShareBox({ t, lang, dictKey, payload, challenger }: Props) {
  const [hide, setHide] = useState(false);
  const [tpl, setTpl] = useState<Tpl>(challenger && !challenger.x ? "versus" : "wanted");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const pl: SharePayload = { ...payload, x: hide ? 1 : undefined };
  const q = toSearch(pl) + (dictKey === "hinglish" ? "&t=hi" : "");
  const shareUrl = `${SITE.url}/${lang}/r?${q}`;
  const vsQ =
    tpl === "versus" && challenger
      ? `&vh=${Math.round(challenger.h)}&vr=${challenger.r}${challenger.n ? `&vn=${encodeURIComponent(challenger.n)}` : ""}`
      : "";
  const cardSrc = `/api/og?f=story&tpl=${tpl}&${q}&l=${dictKey}${vsQ}`;
  const rank = t.result.ranks[payload.r - 1];
  const hText = hide ? "★".repeat(payload.r) : String(Math.round(payload.h));
  const caption = fill(t.share.caption, { h: hText, title: rank.title, stars: "★".repeat(payload.r) });
  const challengeText = fill(t.share.challengeCaption, { h: hText });

  async function cardFile(): Promise<File> {
    const blob = await (await fetch(cardSrc)).blob();
    return new File([blob], `hourstoplay-${Math.round(payload.h)}h.png`, { type: "image/png" });
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      track("share_click", { via: "copy" });
    } catch {}
  }

  async function nativeShare(text: string, withImage: boolean) {
    sfx.click();
    unlock("share");
    try {
      if (withImage) {
        setBusy(true);
        const file = await cardFile();
        setBusy(false);
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], text: `${text} ${shareUrl}` });
          unlock("card");
          track("share_click", { via: "native_image", tpl });
          return;
        }
      }
      if (navigator.share) {
        await navigator.share({ text, url: shareUrl });
        track("share_click", { via: "native" });
        return;
      }
      await copy(`${text} ${shareUrl}`);
    } catch {
      setBusy(false);
    }
  }

  async function download() {
    sfx.click();
    setBusy(true);
    try {
      const file = await cardFile();
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      unlock("card");
      track("card_download", { tpl });
    } finally {
      setBusy(false);
    }
  }

  const wa = `https://wa.me/?text=${encodeURIComponent(`${caption} ${shareUrl}`)}`;
  const x = `https://x.com/intent/post?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(shareUrl)}`;
  const tpls: Tpl[] = challenger && !challenger.x ? ["versus", "wanted", "receipt"] : ["wanted", "receipt"];

  return (
    <section className="card animate-rise p-5 [animation-delay:.15s]">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold tracking-wide uppercase">{t.share.title}</h2>
        <label className="flex items-center gap-2 text-xs text-muted">
          <input type="checkbox" checked={hide} onChange={(e) => setHide(e.target.checked)} className="size-4 accent-pink" />
          {t.share.hide.split("(")[0].trim()}
        </label>
      </div>

      <button
        type="button"
        className="btn btn-primary mt-4 w-full py-4"
        onClick={() => {
          setOpen(true);
          sfx.click();
          track("card_open");
        }}
      >
        {t.share.story}
      </button>

      <div className="mt-2 grid grid-cols-4 gap-2">
        <a className="btn btn-ghost flex-col gap-1 py-3 text-[11px]" href={wa} target="_blank" rel="noopener" onClick={() => { unlock("share"); track("share_click", { via: "whatsapp" }); }}>
          {Icon.wa}
          {t.share.whatsapp}
        </a>
        <a className="btn btn-ghost flex-col gap-1 py-3 text-[11px]" href={x} target="_blank" rel="noopener" onClick={() => { unlock("share"); track("share_click", { via: "x" }); }}>
          {Icon.x}X
        </a>
        <button type="button" className="btn btn-ghost flex-col gap-1 py-3 text-[11px]" onClick={() => copy(`${caption} ${shareUrl}`)}>
          {Icon.link}
          {copied ? t.share.copied : t.share.copy}
        </button>
        <button
          type="button"
          className="btn btn-ghost flex-col gap-1 py-3 text-[11px] text-orange"
          onClick={() => {
            unlock("challenge");
            track("challenge_sent");
            void nativeShare(challengeText, false);
          }}
        >
          {Icon.vs}
          {t.share.challenge.split(" ")[0]}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/80 backdrop-blur-md sm:items-center sm:p-4" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm rounded-t-3xl border border-line bg-bg2 p-4 sm:rounded-3xl" style={{ animation: "sheet .3s cubic-bezier(.2,.8,.2,1)" }} onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center gap-2">
              <div className="seg flex-1">
                {tpls.map((k) => (
                  <button key={k} type="button" aria-pressed={tpl === k} onClick={() => setTpl(k)}>
                    {t.share.templates[k]}
                  </button>
                ))}
              </div>
              <button type="button" className="btn btn-ghost size-10 shrink-0" aria-label="Close" onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>
            <div className="relative mx-auto aspect-[9/16] max-h-[60dvh] overflow-hidden rounded-2xl border border-line bg-bg">
              <p className="absolute inset-0 grid place-items-center text-sm text-muted">{t.share.making}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img key={cardSrc} src={cardSrc} alt="" className="relative h-full w-full object-cover" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" disabled={busy} className="btn btn-primary py-3.5 disabled:opacity-60" onClick={() => nativeShare(caption, true)}>
                {busy ? "…" : t.share.shareBtn}
              </button>
              <button type="button" disabled={busy} className="btn btn-ghost py-3.5 disabled:opacity-60" onClick={download}>
                {t.share.download}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
