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

// Scene 5: Reach — "Gosti iz 11 zemalja, 15 jezika"
// Duration: ~132 frames (4.4s)
// Purpose: Show international reach

export const ReachScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Globe appears
  const globeSpring = spring({
    frame,
    fps,
    config: { damping: 12 },
  });

  // Country flags appear one by one
  const flags = [
    { emoji: "🇭🇷", name: "Hrvatska", delay: 15 },
    { emoji: "🇬🇷", name: "Grčka", delay: 25 },
    { emoji: "🇹🇷", name: "Turska", delay: 35 },
    { emoji: "🇮🇹", name: "Italija", delay: 45 },
    { emoji: "🇪🇸", name: "Španjolska", delay: 55 },
    { emoji: "🇫🇷", name: "Francuska", delay: 65 },
  ];

  // Counter for countries
  const countryCount = Math.round(
    interpolate(frame, [10, 70], [0, 11], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Counter for languages
  const langCount = Math.round(
    interpolate(frame, [30, 80], [0, 15], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Globe rotation
  const globeRotation = interpolate(frame, [0, 132], [0, 360], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0c1445 0%, #1a237e 50%, #283593 100%)",
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
      }}
    >
      {/* Spinning globe */}
      <div
        style={{
          fontSize: 120,
          transform: `scale(${interpolate(globeSpring, [0, 1], [0, 1])}) rotate(${globeRotation * 0.1}deg)`,
          marginBottom: 30,
          filter: "drop-shadow(0 10px 30px rgba(66,165,245,0.4))",
        }}
      >
        🌍
      </div>

      {/* Stats counters */}
      <div
        style={{
          display: "flex",
          gap: 60,
          marginBottom: 40,
        }}
      >
        {/* Countries counter */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: "#42a5f5",
              textShadow: "0 4px 20px rgba(66,165,245,0.5)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {countryCount}
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            zemalja
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            width: 2,
            background: "rgba(255,255,255,0.2)",
            borderRadius: 1,
          }}
        />

        {/* Languages counter */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: "#ab47bc",
              textShadow: "0 4px 20px rgba(171,71,188,0.5)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {langCount}
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            jezika
          </div>
        </div>
      </div>

      {/* Flags row */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 15,
          justifyContent: "center",
          maxWidth: 800,
        }}
      >
        {flags.map((flag, i) => {
          const flagSpring = spring({
            frame: frame - flag.delay,
            fps,
            config: { damping: 10, stiffness: 200 },
          });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 30,
                padding: "10px 20px",
                transform: `scale(${interpolate(flagSpring, [0, 1], [0, 1])})`,
                opacity: interpolate(flagSpring, [0, 1], [0, 1]),
              }}
            >
              <span style={{ fontSize: 32 }}>{flag.emoji}</span>
              <span
                style={{ fontSize: 20, fontWeight: 700, color: "#ffffff" }}
              >
                {flag.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom message */}
      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: "#fbbf24",
          textAlign: "center",
          marginTop: 40,
          opacity: interpolate(frame, [90, 110], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Jedriličari dolaze DO TEBE! ⛵
      </div>
    </AbsoluteFill>
  );
};
