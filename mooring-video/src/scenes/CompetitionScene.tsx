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

// Reel 2, Scene 3: Competition — "Preduhitri konkurenciju!"
// Duration: ~170 frames (5.7s)

export const CompetitionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Clock ticking animation
  const clockRotation = interpolate(frame, [0, 170], [0, 360 * 3], {
    extrapolateRight: "clamp",
  });

  // Timer countdown
  const timerSpring = spring({
    frame,
    fps,
    config: { damping: 15 },
  });

  // Progress bar fills up
  const progressWidth = interpolate(frame, [30, 130], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Stats appear
  const stats = [
    { icon: "⏱️", text: "10 min prijava", delay: 40 },
    { icon: "🆓", text: "Potpuno besplatno", delay: 65 },
    { icon: "📸", text: "Samo dodaj fotke", delay: 90 },
  ];

  // Warning text pulses
  const warningOpacity = interpolate(
    frame,
    [110, 120, 130, 140, 150, 160, 170],
    [0, 1, 0.5, 1, 0.5, 1, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0c1220 0%, #1a1a3e 40%, #2d1450 100%)",
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
      }}
    >
      {/* Ticking clock */}
      <div
        style={{
          fontSize: 80,
          transform: `scale(${interpolate(timerSpring, [0, 1], [0, 1])})`,
          marginBottom: 20,
          filter: "drop-shadow(0 5px 20px rgba(239,68,68,0.4))",
        }}
      >
        ⏰
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 48,
          fontWeight: 900,
          color: "#ef4444",
          textAlign: "center",
          marginBottom: 10,
          opacity: interpolate(frame, [5, 20], [0, 1], {
            extrapolateRight: "clamp",
          }),
          textShadow: "0 4px 20px rgba(239,68,68,0.4)",
        }}
      >
        Ne čekaj!
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: "rgba(255,255,255,0.7)",
          textAlign: "center",
          marginBottom: 40,
          opacity: interpolate(frame, [10, 25], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        Konkurencija već gleda 👀
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: "85%",
          maxWidth: 700,
          height: 16,
          borderRadius: 8,
          background: "rgba(255,255,255,0.1)",
          marginBottom: 40,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progressWidth}%`,
            height: "100%",
            borderRadius: 8,
            background: "linear-gradient(90deg, #10b981, #34d399, #fbbf24)",
            boxShadow: "0 0 20px rgba(16,185,129,0.5)",
          }}
        />
      </div>

      {/* Steps */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          width: "100%",
          maxWidth: 700,
        }}
      >
        {stats.map((stat, i) => {
          const statSpring = spring({
            frame: frame - stat.delay,
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
                background: "rgba(255,255,255,0.07)",
                borderRadius: 18,
                padding: "16px 24px",
                border: "1px solid rgba(255,255,255,0.1)",
                transform: `translateX(${interpolate(statSpring, [0, 1], [-200, 0])}px)`,
                opacity: interpolate(statSpring, [0, 1], [0, 1]),
              }}
            >
              <div style={{ fontSize: 36 }}>{stat.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#ffffff" }}>
                {stat.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Warning */}
      <div
        style={{
          fontSize: 34,
          fontWeight: 900,
          color: "#fbbf24",
          textAlign: "center",
          marginTop: 40,
          opacity: warningOpacity,
          textShadow: "0 2px 15px rgba(251,191,36,0.5)",
        }}
      >
        Preduhitri konkurenciju! 🏃‍♂️
      </div>
    </AbsoluteFill>
  );
};
