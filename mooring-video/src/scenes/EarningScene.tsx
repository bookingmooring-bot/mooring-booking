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

// Scene 2: Earning — "€5.000+ po sezoni" 
// Duration: ~160 frames (5.3s)
// Purpose: Show the transformation from €0 to €5.000+

export const EarningScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // €0 appears then crosses out
  const zeroOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const strikeProgress = interpolate(frame, [30, 50], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // €5.000+ springs in after strike
  const earningSpring = spring({
    frame: frame - 55,
    fps,
    config: { damping: 10, stiffness: 120 },
  });
  const earningScale = interpolate(earningSpring, [0, 1], [0.2, 1]);

  // Counter animation from 0 to 5000
  const counterValue = Math.round(
    interpolate(frame, [55, 110], [0, 5000], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    })
  );

  // "po sezoni" text fades in
  const seasonOpacity = interpolate(frame, [100, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Coin rain emoji animation
  const coinPositions = [
    { x: 100, delay: 60 },
    { x: 300, delay: 70 },
    { x: 500, delay: 65 },
    { x: 700, delay: 75 },
    { x: 900, delay: 80 },
  ];

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0f2847 0%, #0a3d2e 50%, #064e3b 100%)",
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
      }}
    >
      {/* Floating coins */}
      {coinPositions.map((coin, i) => {
        const coinFall = interpolate(
          frame,
          [coin.delay, coin.delay + 40],
          [-100, 1920],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: coin.x,
              top: coinFall,
              fontSize: 48,
              opacity: 0.4,
            }}
          >
            💶
          </div>
        );
      })}

      {/* €0 — crossed out */}
      <div
        style={{
          position: "relative",
          opacity: zeroOpacity,
          marginBottom: 60,
        }}
      >
        <div
          style={{
            fontSize: 100,
            fontWeight: 900,
            color: "#ef4444",
            textShadow: "0 4px 20px rgba(239,68,68,0.4)",
          }}
        >
          ❌ €0
        </div>
        {/* Strikethrough line */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            height: 6,
            width: `${strikeProgress}%`,
            background: "#ef4444",
            borderRadius: 3,
          }}
        />
      </div>

      {/* Arrow down */}
      <div
        style={{
          fontSize: 60,
          opacity: interpolate(frame, [45, 55], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          marginBottom: 40,
        }}
      >
        ⬇️
      </div>

      {/* €5.000+ counter */}
      <div
        style={{
          transform: `scale(${earningScale})`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 400,
            color: "rgba(255,255,255,0.7)",
            marginBottom: 10,
          }}
        >
          ✅ Zarađuj
        </div>
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            color: "#10b981",
            textShadow: "0 4px 30px rgba(16,185,129,0.5)",
            lineHeight: 1,
          }}
        >
          €{counterValue.toLocaleString("de-DE")}+
        </div>
      </div>

      {/* "po sezoni" caption */}
      <div
        style={{
          fontSize: 42,
          fontWeight: 700,
          color: "#fbbf24",
          marginTop: 20,
          opacity: seasonOpacity,
          textShadow: "0 2px 10px rgba(251,191,36,0.4)",
        }}
      >
        po sezoni! 💰
      </div>
    </AbsoluteFill>
  );
};
