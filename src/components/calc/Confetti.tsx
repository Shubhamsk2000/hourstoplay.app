"use client";
// A short burst of neon sparks from the result number. CSS-only, removed after 1.6s.
import { useEffect, useState } from "react";

export function Sparkles() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setOn(false), 1600);
    return () => clearTimeout(id);
  }, []);
  if (!on) return null;
  return (
    <div className="pointer-events-none absolute top-[38%] left-1/2 z-10" aria-hidden>
      {Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * Math.PI * 2;
        const r = 110 + (i % 4) * 30;
        return (
          <span
            key={i}
            className="absolute size-1.5 rounded-full"
            style={
              {
                background: i % 3 === 0 ? "#3df5ff" : i % 2 ? "#ff3d8b" : "#ff9f1c",
                boxShadow: "0 0 10px currentColor",
                "--dx": `${Math.cos(a) * r}px`,
                "--dy": `${Math.sin(a) * r}px`,
                animation: `sparkle 1.1s ${(i % 5) * 0.03}s cubic-bezier(.2,.8,.2,1) forwards`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
