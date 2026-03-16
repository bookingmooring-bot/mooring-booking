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

// Reel 3, Scene 3: Free Listing — "Besplatno! Plaćaš samo kad zaradiš."
// Duration: ~150 frames (5s)

export const FreeListingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Shield grows
  const shieldSpring = spring({
    frame,
    fps,
    config: { damping: 10 },
  });

  // Benefits appear
  const benefits = [
    { icon: "🆓", text: "Besplatno listanje", color: "#10b981", delay: 15 },
    { icon: "🚫", text: "Nema pretplate", color: "#3b82f6", delay: 35 },
    { icon: "🤝", text: "Plaćaš samo kad zaradiš", color: "#fbbf24", delay: 55 },
  ];

  // Lock emoji transforms to unlock
  const lockProgress = interpolate(frame, [75, 95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Bottom message
  const bottomSpring = spring({
    frame: frame - 100,
    fps,
    config: { damping: 8, stiffness: 150 },
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0a1628 0%, #1e3a5f 40%, #0d4f4f 100%)",
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
      }}
    >
      {/* Shield + lock */}
      <div
        style={{
          fontSize: 90,
          transform: `scale(${interpolate(shieldSpring, [0, 1], [0, 1])})`,
          marginBottom: 30,
          filter: "drop-shadow(0 10px 25px rgba(16,185,129,0.4))",
        }}
      >
        {lockProgress < 0.5 ? "🔒" : "🔓"}
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 46,
          fontWeight: 900,
          color: "#ffffff",
          textAlign: "center",
          marginBottom: 40,
          opacity: interpolate(frame, [5, 18], [0, 1], {
            extrapolateRight: "clamp",
          }),
          textShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        Potpuno <span style={{ color: "#10b981" }}>besplatno</span>
      </div>

      {/* Benefits list */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          width: "100%",
          maxWidth: 750,
        }}
      >
        {benefits.map((b, i) => {
          const bSpring = spring({
            frame: frame - b.delay,
            fps,
            config: { damping: 12, stiffness: 180 },
          });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                background: "rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: "20px 28px",
                border: `1px solid ${b.color}33`,
                transform: `translateX(${interpolate(bSpring, [0, 1], [-200, 0])}px)`,
                opacity: interpolate(bSpring, [0, 1], [0, 1]),
              }}
            >
              <div style={{ fontSize: 40 }}>{b.icon}</div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 700,
                  color: b.color,
                }}
              >
                {b.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom emphasis */}
      <div
        style={{
          marginTop: 45,
          transform: `scale(${interpolate(bottomSpring, [0, 1], [0.5, 1])})`,
          opacity: interpolate(bottomSpring, [0, 1], [0, 1]),
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 38,
            fontWeight: 900,
            color: "#fbbf24",
            textShadow: "0 2px 15px rgba(251,191,36,0.4)",
          }}
        >
          Doslovno nula rizika! 🛡️
        </div>
      </div>
    </AbsoluteFill>
  );
};
