import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700", "900"],
  subsets: ["latin-ext"],
});

// Reel 3, Scene 2: Math Proof — "❌ €0 vs ✅ €4.250+"
// Duration: ~180 frames (6s)
// The emotional core — destroys the objection with simple math

export const MathProofScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Left side (❌ €0) appears first
  const leftSpring = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  // VS divider
  const vsOpacity = interpolate(frame, [35, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Right side (✅ €4.250+) appears after
  const rightSpring = spring({
    frame: frame - 55,
    fps,
    config: { damping: 10, stiffness: 120 },
  });

  // Counter for right side
  const rightCounter = Math.round(
    interpolate(frame, [55, 110], [0, 4250], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    })
  );

  // "85%" reveal
  const percentSpring = spring({
    frame: frame - 115,
    fps,
    config: { damping: 8, stiffness: 150 },
  });

  // Arrow pointing right
  const arrowPulse = interpolate(
    frame,
    [130, 140, 150, 160, 170, 180],
    [0, 15, 0, 15, 0, 15],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0a1628 0%, #0f2847 50%, #0d3b2e 100%)",
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 50,
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: 36,
          fontWeight: 700,
          color: "rgba(255,255,255,0.6)",
          textAlign: "center",
          marginBottom: 40,
          opacity: interpolate(frame, [0, 15], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        Račun je jednostavan:
      </div>

      {/* Comparison cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 25,
          width: "100%",
          maxWidth: 850,
        }}
      >
        {/* ❌ WITHOUT platform */}
        <div
          style={{
            background: "rgba(239,68,68,0.15)",
            border: "2px solid rgba(239,68,68,0.4)",
            borderRadius: 25,
            padding: "30px 35px",
            transform: `translateX(${interpolate(leftSpring, [0, 1], [-300, 0])}px)`,
            opacity: interpolate(leftSpring, [0, 1], [0, 1]),
          }}
        >
          <div style={{ fontSize: 28, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
            Bez platforme:
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <span style={{ fontSize: 48 }}>❌</span>
            <span
              style={{
                fontSize: 80,
                fontWeight: 900,
                color: "#ef4444",
                textShadow: "0 2px 15px rgba(239,68,68,0.4)",
              }}
            >
              €0
            </span>
            <span style={{ fontSize: 28, color: "rgba(255,255,255,0.5)", marginLeft: 10 }}>
              zarade
            </span>
          </div>
        </div>

        {/* VS */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 900,
            color: "rgba(255,255,255,0.3)",
            textAlign: "center",
            opacity: vsOpacity,
            letterSpacing: 8,
          }}
        >
          VS
        </div>

        {/* ✅ WITH platform */}
        <div
          style={{
            background: "rgba(16,185,129,0.15)",
            border: "2px solid rgba(16,185,129,0.4)",
            borderRadius: 25,
            padding: "30px 35px",
            transform: `scale(${interpolate(rightSpring, [0, 1], [0.8, 1])})`,
            opacity: interpolate(rightSpring, [0, 1], [0, 1]),
          }}
        >
          <div style={{ fontSize: 28, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
            S Mooring Booking:
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <span style={{ fontSize: 48 }}>✅</span>
            <span
              style={{
                fontSize: 80,
                fontWeight: 900,
                color: "#10b981",
                textShadow: "0 2px 20px rgba(16,185,129,0.5)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              €{rightCounter.toLocaleString("de-DE")}+
            </span>
          </div>
          <div
            style={{
              fontSize: 26,
              color: "rgba(255,255,255,0.6)",
              marginTop: 5,
            }}
          >
            u tvom džepu
          </div>
        </div>
      </div>

      {/* 85% badge */}
      <div
        style={{
          marginTop: 35,
          transform: `scale(${interpolate(percentSpring, [0, 1], [0, 1])})`,
          opacity: interpolate(percentSpring, [0, 1], [0, 1]),
          background: "linear-gradient(135deg, #10b981, #059669)",
          borderRadius: 20,
          padding: "14px 35px",
          boxShadow: "0 10px 30px rgba(16,185,129,0.4)",
        }}
      >
        <div
          style={{
            fontSize: 30,
            fontWeight: 900,
            color: "#ffffff",
            textAlign: "center",
          }}
        >
          Ti zadržavaš <span style={{ fontSize: 38 }}>85%</span> 💰
        </div>
      </div>
    </AbsoluteFill>
  );
};
