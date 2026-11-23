import type { Dict } from "@/i18n/en";
import { fill } from "@/lib/site";

export function Hero({ t, country }: { t: Dict; country: string }) {
  return (
    <div className="relative mb-7">
      <p className="label flex items-center gap-2">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-pink opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-pink" />
        </span>
        {t.hero.kicker}
      </p>
      <h1 className="mt-3 font-display text-[clamp(2.3rem,10.5vw,3.4rem)] leading-[0.98] font-bold tracking-tight uppercase">
        {t.hero.h1}
      </h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">{fill(t.hero.sub, { country })}</p>
    </div>
  );
}
