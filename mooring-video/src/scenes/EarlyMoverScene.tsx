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

// Reel 2, Scene 2: Early Mover — "Rani korisnici = prioritetni prikaz! ⭐"
// Duration: ~160 frames (5.3s)

export const EarlyMoverScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Medal/trophy appears
  const trophySpring = spring({
    frame,
    fps,
    config: { damping: 10 },
  });

  // Leaderboard rows slide in
  const rows = [
    { rank: "🥇", name: "Ti", highlight: true, delay: 20 },
    { rank: "🥈", name: "Konkurent A", highlight: false, delay: 35 },
    { rank: "🥉", name: "Konkurent B", highlight: false, delay: 50 },
    { rank: "4.", name: "Konkurent C", highlight: false, delay: 65 },
  ];

  // "Prioritetni prikaz" badge appears
  const badgeSpring = spring({
    frame: frame - 80,
    fps,
    config: { damping: 8, stiffness: 150 },
  });

  // Urgency pulse
  const urgencyPulse = interpolate(
    frame,
    [100, 110, 120, 130, 140, 150, 160],
    [1, 1.05, 1, 1.05, 1, 1.05, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #1a0533 0%, #2d1b69 40%, #4a1a8a 100%)",
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
      }}
    >
      {/* Star icon */}
      <div
        style={{
          fontSize: 90,
          transform: `scale(${interpolate(trophySpring, [0, 1], [0, 1])}) rotate(${interpolate(trophySpring, [0, 1], [-180, 0])}deg)`,
          marginBottom: 30,
          filter: "drop-shadow(0 10px 30px rgba(255,215,0,0.5))",
        }}
      >
        ⭐
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 42,
          fontWeight: 900,
          color: "#ffffff",
          textAlign: "center",
          marginBottom: 40,
          opacity: interpolate(frame, [5, 20], [0, 1], {
            extrapolateRight: "clamp",
          }),
          textShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        Budi među <span style={{ color: "#fbbf24" }}>prvima!</span>
      </div>

      {/* Leaderboard */}
      <div
        style={{
          width: "100%",
          maxWidth: 750,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {rows.map((row, i) => {
          const rowSpring = spring({
            frame: frame - row.delay,
            fps,
            config: { damping: 15 },
          });
          const rowX = interpolate(rowSpring, [0, 1], [500, 0]);
          const rowOpacity = interpolate(rowSpring, [0, 1], [0, 1]);

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                background: row.highlight
                  ? "linear-gradient(135deg, rgba(255,215,0,0.3), rgba(255,165,0,0.2))"
                  : "rgba(255,255,255,0.06)",
                borderRadius: 20,
                padding: "18px 25px",
                border: row.highlight
                  ? "2px solid rgba(255,215,0,0.6)"
                  : "1px solid rgba(255,255,255,0.1)",
                transform: `translateX(${rowX}px) scale(${row.highlight ? urgencyPulse : 1})`,
                opacity: rowOpacity,
              }}
            >
              <div style={{ fontSize: 36, width: 50, textAlign: "center" }}>
                {row.rank}
              </div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: row.highlight ? 900 : 400,
                  color: row.highlight ? "#fbbf24" : "rgba(255,255,255,0.5)",
                  flex: 1,
                }}
              >
                {row.name}
              </div>
              {row.highlight && (
                <div style={{ fontSize: 24, color: "#10b981" }}>
                  PRIORITET ✅
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Badge */}
      <div
        style={{
          marginTop: 40,
          transform: `scale(${interpolate(badgeSpring, [0, 1], [0, 1])})`,
          opacity: interpolate(badgeSpring, [0, 1], [0, 1]),
          background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
          borderRadius: 25,
          padding: "15px 35px",
          boxShadow: "0 10px 30px rgba(251,191,36,0.4)",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: "#1a0533",
            textAlign: "center",
          }}
        >
          Rani korisnici = prioritetni prikaz!
        </div>
      </div>
    </AbsoluteFill>
  );
};
