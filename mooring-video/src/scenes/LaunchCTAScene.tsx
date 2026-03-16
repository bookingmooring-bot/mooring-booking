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

// Reel 2, Scene 5: Launch CTA — "Budi prvi! Klikni i prijavi se 👇"
// Duration: ~130 frames (4.3s)
// Even more urgent than Reel 1 CTA

export const LaunchCTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Brand entrance
  const brandSpring = spring({
    frame,
    fps,
    config: { damping: 15 },
  });

  // Countdown spots remaining
  const spotsLeft = Math.max(
    0,
    Math.round(
      interpolate(frame, [30, 100], [50, 3], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );

  // CTA button pulse — faster than Reel 1
  const buttonPulse = interpolate(
    frame % 20,
    [0, 10, 20],
    [1, 1.1, 1]
  );

  // Arrow bounce — faster
  const arrowBounce = interpolate(
    frame % 20,
    [0, 10, 20],
    [0, 20, 0]
  );

  // Urgency red glow
  const urgencyGlow = interpolate(
    frame,
    [60, 70, 80, 90, 100, 110, 120, 130],
    [0.2, 0.5, 0.2, 0.5, 0.2, 0.6, 0.3, 0.6],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #1a0533 0%, #c44569 40%, #ff6348 70%, #ff4757 100%)",
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
      }}
    >
      {/* Urgency glow */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255,71,87,${urgencyGlow}) 0%, transparent 70%)`,
          top: "20%",
        }}
      />

      {/* Clock icon */}
      <div
        style={{
          fontSize: 70,
          marginBottom: 20,
          opacity: interpolate(brandSpring, [0, 1], [0, 1]),
          filter: "drop-shadow(0 5px 20px rgba(0,0,0,0.3))",
        }}
      >
        ⏳
      </div>

      {/* Spots remaining counter */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 20,
          opacity: interpolate(frame, [20, 35], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          Prioritetnih mjesta:
        </div>
        <div
          style={{
            fontSize: 90,
            fontWeight: 900,
            color: spotsLeft <= 10 ? "#fbbf24" : "#ffffff",
            fontVariantNumeric: "tabular-nums",
            textShadow: "0 4px 20px rgba(0,0,0,0.4)",
          }}
        >
          {spotsLeft}
        </div>
      </div>

      {/* Main CTA text */}
      <div
        style={{
          fontSize: 52,
          fontWeight: 900,
          color: "#ffffff",
          textAlign: "center",
          lineHeight: 1.2,
          marginBottom: 15,
          opacity: interpolate(frame, [10, 25], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          textShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        Iskoristi
        <br />
        <span style={{ color: "#fbbf24", fontSize: 58 }}>prednost!</span> 🏆
      </div>

      {/* CTA Button — more urgent styling */}
      <div
        style={{
          marginTop: 30,
          transform: `scale(${buttonPulse})`,
          opacity: interpolate(frame, [30, 45], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
            borderRadius: 30,
            padding: "25px 55px",
            boxShadow: "0 10px 40px rgba(251,191,36,0.5)",
          }}
        >
          <div
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: "#1a0533",
              textAlign: "center",
            }}
          >
            PRIJAVI VEZ BESPLATNO
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div
        style={{
          fontSize: 50,
          marginTop: 15,
          transform: `translateY(${arrowBounce}px)`,
          opacity: interpolate(frame, [40, 55], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        👇
      </div>

      {/* URL */}
      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: "rgba(255,255,255,0.7)",
          marginTop: 15,
          opacity: interpolate(frame, [50, 65], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          letterSpacing: 1,
        }}
      >
        mooringbooking.com
      </div>
    </AbsoluteFill>
  );
};
