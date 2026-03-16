import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700", "900"],
  subsets: ["latin-ext"],
});

// Scene 4: Trust — "15% provizije. Nula rizika!"
// Duration: ~132 frames (4.4s)
// Purpose: Address the commission objection

export const TrustScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Shield appears with spring
  const shieldSpring = spring({
    frame,
    fps,
    config: { damping: 10 },
  });

  // Checkmarks appear sequentially
  const checks = [
    { text: "Nema pretplate", delay: 25 },
    { text: "Nema registracijske naknade", delay: 45 },
    { text: "Plaćaš samo kad zaradiš", delay: 65 },
  ];

  // Bottom emphasis text
  const emphasisSpring = spring({
    frame: frame - 85,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
      }}
    >
      {/* Shield icon */}
      <div
        style={{
          fontSize: 100,
          transform: `scale(${interpolate(shieldSpring, [0, 1], [0, 1])})`,
          marginBottom: 40,
          filter: "drop-shadow(0 10px 30px rgba(16,185,129,0.4))",
        }}
      >
        🛡️
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 52,
          fontWeight: 900,
          color: "#ffffff",
          textAlign: "center",
          marginBottom: 10,
          opacity: interpolate(frame, [5, 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          textShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        15% provizije
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: 30,
          fontWeight: 400,
          color: "rgba(255,255,255,0.6)",
          textAlign: "center",
          marginBottom: 50,
          opacity: interpolate(frame, [15, 30], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        po uspješnoj rezervaciji
      </div>

      {/* Checklist */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 25,
          width: "100%",
          maxWidth: 800,
        }}
      >
        {checks.map((check, i) => {
          const checkSpring = spring({
            frame: frame - check.delay,
            fps,
            config: { damping: 15 },
          });
          const checkOpacity = interpolate(checkSpring, [0, 1], [0, 1]);
          const checkX = interpolate(checkSpring, [0, 1], [-80, 0]);

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                opacity: checkOpacity,
                transform: `translateX(${checkX}px)`,
                background: "rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: "20px 30px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div style={{ fontSize: 36, color: "#10b981" }}>✅</div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#ffffff",
                }}
              >
                {check.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Emphasis bottom text */}
      <div
        style={{
          fontSize: 40,
          fontWeight: 900,
          color: "#fbbf24",
          textAlign: "center",
          marginTop: 50,
          transform: `scale(${interpolate(emphasisSpring, [0, 1], [0.5, 1])})`,
          opacity: interpolate(emphasisSpring, [0, 1], [0, 1]),
          textShadow: "0 2px 15px rgba(251,191,36,0.4)",
        }}
      >
        NULA RIZIKA! 💪
      </div>
    </AbsoluteFill>
  );
};
