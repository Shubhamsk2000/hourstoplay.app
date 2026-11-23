"use client";

import { useEffect } from "react";
import type { Dict } from "@/i18n/en";
import { useLastUnlocked } from "@/lib/game/badges";
import { sfx } from "@/lib/game/sfx";

export function BadgeToast({ t }: { t: Dict }) {
  const [last, clear] = useLastUnlocked();
  useEffect(() => {
    if (!last) return;
    sfx.badge();
    const id = setTimeout(clear, 2600);
    return () => clearTimeout(id);
  }, [last, clear]);
  if (!last) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-50 flex justify-center px-4" role="status">
      <div className="card flex animate-rise items-center gap-3 border-orange/40! bg-bg2/95! px-4 py-2.5 shadow-2xl shadow-black">
        <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-pink to-orange text-lg">★</span>
        <div>
          <p className="label">{t.game.unlocked}</p>
          <p className="text-sm font-semibold">{t.game.list[last].name}</p>
        </div>
      </div>
    </div>
  );
}
