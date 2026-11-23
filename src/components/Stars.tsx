// HUD-style wanted stars. SVG so they render identically on every device.
const PATH = "M12 1.8l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 18l-6.4 3.4 1.4-7.1-5.3-5 7.2-.9z";

export function Stars({ n, size = 28, animate = false }: { n: number; size?: number; animate?: boolean }) {
  return (
    <span className="inline-flex gap-1.5" role="img" aria-label={`${n} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const on = i <= n;
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            aria-hidden
            style={{
              animation: animate && on ? `starIn .45s ${0.12 * i + 0.9}s cubic-bezier(.2,.8,.2,1) both` : undefined,
              filter: on ? "drop-shadow(0 0 8px rgb(255 159 28 / .55))" : undefined,
            }}
          >
            <path d={PATH} fill={on ? "#ffb02e" : "none"} stroke={on ? "#ffb02e" : "rgb(255 255 255 / .18)"} strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        );
      })}
    </span>
  );
}
