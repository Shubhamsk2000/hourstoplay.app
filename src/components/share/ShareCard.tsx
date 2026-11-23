// Share card rendered with Satori (next/og). Used for BOTH dynamic OG previews (1200×630)
// and downloadable Story cards (1080×1920). Satori rules: inline styles, every multi-child div is flex.

export interface CardData {
  kind: "wanted" | "receipt" | "versus" | "landing";
  hours: number | null;
  rank: number;
  rankTitle: string;
  name: string | null;
  subtitle: string;
  hoursLabel: string;
  wanted: string;
  cta: string;
  vs: { hours: number; rank: number; name: string } | null;
  vsLabel: string;
  disclaimer: string;
}

const BG = "#0b0b10";
const TEXT = "#f5f5f7";
const MUTED = "#9a9aab";
const LINE = "rgba(255,255,255,0.12)";
const PINK = "#ff3d8b";
const ORANGE = "#ff9f1c";
const STAR = "#ffb02e";
const GRAD = `linear-gradient(100deg, ${PINK}, ${ORANGE})`;
const D = "Oswald";
const S = "Inter";

const fmt = (n: number) => n.toLocaleString("en-US");

function Star({ on, size }: { on: boolean; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M12 1.8l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 18l-6.4 3.4 1.4-7.1-5.3-5 7.2-.9z"
        fill={on ? STAR : "none"}
        stroke={on ? STAR : "rgba(255,255,255,0.22)"}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarRow({ n, size }: { n: number; size: number }) {
  return (
    <div style={{ display: "flex", gap: size * 0.2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} on={i <= n} size={size} />
      ))}
    </div>
  );
}

function Label({ text, size, color = MUTED }: { text: string; size: number; color?: string }) {
  return <div style={{ display: "flex", fontFamily: D, fontSize: size, letterSpacing: size * 0.18, textTransform: "uppercase", color }}>{text}</div>;
}

function BigNumber({ value, size }: { value: string; size: number }) {
  return (
    <div style={{ display: "flex", fontFamily: D, fontSize: size, lineHeight: 1, backgroundImage: GRAD, backgroundClip: "text", color: "transparent" }}>{value}</div>
  );
}

function Brand({ size }: { size: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.5 }}>
      <svg width={size * 1.3} height={size * 1.3} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="none" stroke={PINK} strokeWidth="2.4" />
        <path d="M12 6.5V12l3.6 2.2" fill="none" stroke={TEXT} strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <div style={{ display: "flex", fontFamily: D, fontSize: size, letterSpacing: size * 0.16, color: TEXT }}>
        <span>HOURS</span>
        <span style={{ color: PINK }}>TO</span>
        <span>PLAY</span>
      </div>
    </div>
  );
}

/** HUD corner brackets. */
function Corners({ c = 46 }: { c?: number }) {
  const s = { position: "absolute" as const, width: c, height: c, borderColor: PINK, borderStyle: "solid" as const };
  return [
    <div key="tl" style={{ ...s, top: 0, left: 0, borderWidth: "4px 0 0 4px" }} />,
    <div key="tr" style={{ ...s, top: 0, right: 0, borderWidth: "4px 4px 0 0" }} />,
    <div key="bl" style={{ ...s, bottom: 0, left: 0, borderWidth: "0 0 4px 4px" }} />,
    <div key="br" style={{ ...s, bottom: 0, right: 0, borderWidth: "0 4px 4px 0" }} />,
  ];
}

export function ShareCard({ data, format, domain }: { data: CardData; format: "og" | "story"; domain: string }) {
  const story = format === "story";
  const root = {
    width: story ? 1080 : 1200,
    height: story ? 1920 : 630,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: BG,
    backgroundImage:
      "radial-gradient(ellipse 80% 45% at 50% 0%, rgba(255,61,139,0.38), rgba(11,11,16,0) 70%), radial-gradient(ellipse 60% 35% at 50% 100%, rgba(255,159,28,0.16), rgba(11,11,16,0) 70%)",
    fontFamily: S,
    color: TEXT,
    padding: story ? "90px 80px 80px" : "40px 56px",
  };
  const hoursStr = data.hours !== null ? fmt(data.hours) : "???";
  const big = (base: number) => (data.hours !== null && data.hours >= 10000 ? base * 0.7 : base);

  const cta = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: story ? 18 : 8 }}>
      <div
        style={{
          display: "flex",
          fontFamily: D,
          fontSize: story ? 34 : 24,
          letterSpacing: 3,
          color: "#120610",
          backgroundImage: GRAD,
          borderRadius: 22,
          padding: story ? "22px 40px" : "10px 30px",
          textTransform: "uppercase",
        }}
      >
        {`${data.cta} → ${domain}`}
      </div>
      <div style={{ display: "flex", fontSize: story ? 22 : 14, color: MUTED }}>{data.disclaimer}</div>
    </div>
  );

  // ---------------- OG 1200×630 ----------------
  if (!story) {
    const landing = data.kind === "landing";
    return (
      <div style={root}>
        <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
          <Brand size={26} />
          <Label text="GTA 6 · PS5 · Xbox Series X|S" size={18} />
        </div>
        <div style={{ display: "flex", width: "100%", alignItems: "center", gap: 56 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <BigNumber value={landing ? `≈${hoursStr}` : hoursStr} size={big(190)} />
            <Label text={data.hoursLabel} size={24} color={TEXT} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
            {!landing && data.name && <Label text={data.name} size={22} />}
            {!landing && <StarRow n={data.rank} size={48} />}
            <div style={{ display: "flex", fontFamily: D, fontSize: landing ? 50 : 48, lineHeight: 1.08, textTransform: "uppercase" }}>
              {landing ? data.rankTitle : `“${data.rankTitle}”`}
            </div>
            <div style={{ display: "flex", fontSize: 24, color: MUTED }}>{data.subtitle}</div>
          </div>
        </div>
        {cta}
      </div>
    );
  }

  // ---------------- STORY 1080×1920 ----------------
  const header = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <Brand size={40} />
      <Label text="GTA 6 · PS5 · Xbox Series X|S" size={22} />
    </div>
  );

  if (data.kind === "versus" && data.vs) {
    const me = data.hours ?? 0;
    const side = (name: string, hours: number, rank: number, win: boolean) => (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: 880,
          padding: "40px 30px",
          gap: 12,
          borderRadius: 40,
          border: `2px solid ${win ? "rgba(61,255,162,0.55)" : LINE}`,
          backgroundColor: win ? "rgba(61,255,162,0.07)" : "rgba(255,255,255,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Label text={name} size={34} color={TEXT} />
          {win ? (
            <div style={{ display: "flex", fontFamily: D, fontSize: 24, letterSpacing: 4, color: BG, backgroundColor: "#3dffa2", borderRadius: 10, padding: "4px 14px" }}>
              WINNER
            </div>
          ) : null}
        </div>
        <BigNumber value={fmt(hours)} size={hours >= 10000 ? 140 : 190} />
        <Label text={data.hoursLabel} size={24} />
        <StarRow n={rank} size={54} />
      </div>
    );
    return (
      <div style={root}>
        {header}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", fontFamily: D, fontSize: 84, letterSpacing: 4 }}>GTA 6 SHOWDOWN</div>
          {side(data.vs.name, data.vs.hours, data.vs.rank, data.vs.hours < me)}
          <div style={{ display: "flex", fontFamily: D, fontSize: 60, color: PINK, letterSpacing: 8 }}>{data.vsLabel}</div>
          {side(data.name ?? "ME", me, data.rank, me <= data.vs.hours)}
        </div>
        {cta}
      </div>
    );
  }

  if (data.kind === "receipt") {
    const row = (a: string, b: string) => (
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", fontSize: 34, color: MUTED }}>
        <span>{a}</span>
        <span style={{ color: TEXT }}>{b}</span>
      </div>
    );
    return (
      <div style={root}>
        {header}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 900,
            padding: "60px 64px",
            gap: 24,
            borderRadius: 40,
            border: `2px solid ${LINE}`,
            backgroundColor: "rgba(255,255,255,0.04)",
          }}
        >
          <Label text="Receipt of life" size={34} color={TEXT} />
          <div style={{ display: "flex", fontSize: 26, color: MUTED }}>{data.subtitle}</div>
          <div style={{ display: "flex", width: "100%", borderTop: `2px dashed ${LINE}` }} />
          {row("Customer", data.name ?? "You")}
          {row("Item", "GTA 6")}
          {row("Paid with", "Time")}
          <div style={{ display: "flex", width: "100%", borderTop: `2px dashed ${LINE}` }} />
          <BigNumber value={hoursStr} size={big(220)} />
          <Label text={data.hoursLabel} size={28} color={TEXT} />
          <StarRow n={data.rank} size={62} />
          <div style={{ display: "flex", fontFamily: D, fontSize: 50, textTransform: "uppercase", textAlign: "center" }}>{`“${data.rankTitle}”`}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            {Array.from({ length: 44 }, (_, i) => (
              <div key={i} style={{ display: "flex", width: i % 3 === 0 ? 8 : 4, height: 80, backgroundColor: i % 7 === 0 ? PINK : "rgba(255,255,255,0.7)" }} />
            ))}
          </div>
          <Label text="No refunds on time spent" size={22} />
        </div>
        {cta}
      </div>
    );
  }

  // default: WANTED (HUD frame)
  return (
    <div style={root}>
      {header}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", width: 920, padding: "80px 40px", gap: 20 }}>
        {Corners({})}
        <Label text={data.wanted} size={32} color={PINK} />
        <StarRow n={data.rank} size={90} />
        {data.name ? <div style={{ display: "flex", fontFamily: D, fontSize: 58, letterSpacing: 6, marginTop: 20, textTransform: "uppercase" }}>{data.name}</div> : null}
        <BigNumber value={hoursStr} size={big(320)} />
        <Label text={data.hoursLabel} size={36} color={TEXT} />
        <div style={{ display: "flex", width: 200, height: 3, backgroundImage: GRAD, marginTop: 20, marginBottom: 10 }} />
        <div style={{ display: "flex", fontFamily: D, fontSize: 68, lineHeight: 1.05, textTransform: "uppercase", textAlign: "center" }}>{`“${data.rankTitle}”`}</div>
        <div style={{ display: "flex", fontSize: 30, color: MUTED }}>{data.subtitle}</div>
      </div>
      {cta}
    </div>
  );
}
