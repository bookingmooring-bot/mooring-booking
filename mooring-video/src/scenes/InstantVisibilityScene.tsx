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

// Reel 2, Scene 4: Instant Visibility — "11 zemalja, 15 jezika"
// Duration: ~150 frames (5s)

export const InstantVisibilityScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Map/radar pulse effect
  const radarPulse1 = interpolate(frame % 45, [0, 45], [0, 400], {
    extrapolateRight: "clamp",
  });
  const radarOpacity1 = interpolate(frame % 45, [0, 30, 45], [0.6, 0.2, 0], {
    extrapolateRight: "clamp",
  });

  // Flags appear orbiting
  const flags = ["🇭🇷", "🇬🇧", "🇩🇪", "🇫🇷", "🇮🇹", "🇪🇸", "🇬🇷", "🇹🇷", "🇳🇱", "🇦🇹", "🇸🇮"];
  const orbitRadius = 280;

  // "Instant" slam text
  const instantSpring = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 200 },
  });

  // Stats counters
  const countryCount = Math.round(
    interpolate(frame, [30, 70], [0, 11], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const langCount = Math.round(
    interpolate(frame, [40, 80], [0, 15], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0a0e27 0%, #0f1b4d 40%, #1a237e 100%)",
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
      }}
    >
      {/* Radar pulse rings */}
      {[0, 15, 30].map((delay, i) => {
        const adjustedFrame = (frame + delay * 3) % 45;
        const pulseSize = interpolate(adjustedFrame, [0, 45], [0, 500]);
        const pulseOp = interpolate(adjustedFrame, [0, 25, 45], [0.4, 0.15, 0]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: pulseSize,
              height: pulseSize,
              borderRadius: "50%",
              border: "2px solid rgba(66,165,245,0.5)",
              opacity: pulseOp,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}

      {/* Center point */}
      <div
        style={{
          fontSize: 60,
          marginBottom: 20,
          zIndex: 2,
          filter: "drop-shadow(0 5px 20px rgba(66,165,245,0.5))",
        }}
      >
        📡
      </div>

      {/* INSTANT text */}
      <div
        style={{
          fontSize: 50,
          fontWeight: 900,
          color: "#42a5f5",
          textAlign: "center",
          marginBottom: 10,
          transform: `scale(${interpolate(instantSpring, [0, 1], [0.3, 1])})`,
          textShadow: "0 4px 20px rgba(66,165,245,0.5)",
          zIndex: 2,
        }}
      >
        INSTANT vidljivost!
      </div>

      {/* Counters */}
      <div
        style={{
          display: "flex",
          gap: 50,
          marginBottom: 30,
          marginTop: 15,
          zIndex: 2,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: "#fbbf24",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {countryCount}
          </div>
          <div style={{ fontSize: 24, color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>
            zemalja
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: "#a78bfa",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {langCount}
          </div>
          <div style={{ fontSize: 24, color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>
            jezika
          </div>
        </div>
      </div>

      {/* Orbiting flags */}
      {flags.map((flag, i) => {
        const angle = (i / flags.length) * Math.PI * 2 + frame * 0.02;
        const flagOpacity = interpolate(
          frame,
          [20 + i * 5, 35 + i * 5],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `calc(50% + ${Math.sin(angle) * orbitRadius}px)`,
              left: `calc(50% + ${Math.cos(angle) * orbitRadius}px)`,
              fontSize: 36,
              opacity: flagOpacity * 0.8,
              transform: "translate(-50%, -50%)",
            }}
          >
            {flag}
          </div>
        );
      })}

      {/* Bottom text */}
      <div
        style={{
          fontSize: 30,
          fontWeight: 700,
          color: "rgba(255,255,255,0.8)",
          textAlign: "center",
          marginTop: 20,
          zIndex: 2,
          opacity: interpolate(frame, [90, 110], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Jedriličari dolaze do <span style={{ color: "#fbbf24" }}>TEBE</span>! ⛵
      </div>
    </AbsoluteFill>
  );
};
