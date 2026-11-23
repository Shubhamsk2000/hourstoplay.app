"use client";
// Original 8-bit-ish stings synthesized with WebAudio: zero audio files to download.
let ctx: AudioContext | null = null;
let muted = false;

try {
  muted = typeof localStorage !== "undefined" && localStorage.getItem("htp:mute") === "1";
} catch {}

export const isMuted = () => muted;
export function setMuted(m: boolean) {
  muted = m;
  try {
    localStorage.setItem("htp:mute", m ? "1" : "0");
  } catch {}
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "square", vol = 0.06) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, ctx.currentTime + start);
  g.gain.setValueAtTime(vol, ctx.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
  o.connect(g).connect(ctx.destination);
  o.start(ctx.currentTime + start);
  o.stop(ctx.currentTime + start + dur + 0.02);
}

function ensure() {
  if (muted || typeof window === "undefined") return false;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    return true;
  } catch {
    return false;
  }
}

export const sfx = {
  tick() {
    if (ensure()) tone(880, 0, 0.04, "square", 0.025);
  },
  click() {
    if (ensure()) tone(520, 0, 0.05, "triangle", 0.05);
  },
  win() {
    if (!ensure()) return;
    [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, 0.18));
  },
  siren() {
    if (!ensure()) return;
    for (let i = 0; i < 4; i++) {
      tone(660, i * 0.22, 0.11, "sawtooth", 0.03);
      tone(880, i * 0.22 + 0.11, 0.11, "sawtooth", 0.03);
    }
  },
  badge() {
    if (!ensure()) return;
    [784, 1175].forEach((f, i) => tone(f, i * 0.08, 0.16, "triangle", 0.07));
  },
};
