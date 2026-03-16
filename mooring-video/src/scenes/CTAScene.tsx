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

// Scene 6: CTA — "Budi prvi u HR! 🇭🇷"
// Duration: ~126 frames (4.2s)
// Purpose: Final call to action

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo/Brand entrance
  const brandSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // CTA button pulse
  const pulsePhase = interpolate(frame, [50, 60, 70, 80, 90, 100, 110, 126], [1, 1.08, 1, 1.08, 1, 1.08, 1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Arrow bounce
  const arrowBounce = interpolate(
    frame % 30,
    [0, 15, 30],
    [0, 15, 0]
  );

  // Glow animation
  const glowIntensity = interpolate(
    frame,
    [40, 60, 80, 100, 120],
    [0.3, 0.6, 0.3, 0.6, 0.3],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0a1628 0%, #0d3b66 40%, #0d9488 80%, #14b8a6 100%)",
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
      }}
    >
      {/* Radial glow behind CTA */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(20,184,166,${glowIntensity}) 0%, transparent 70%)`,
          top: "30%",
        }}
      />

      {/* Brand name */}
      <div
        style={{
          fontSize: 36,
          fontWeight: 700,
          color: "rgba(255,255,255,0.6)",
          letterSpacing: 4,
          textTransform: "uppercase",
          marginBottom: 20,
          opacity: interpolate(brandSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(brandSpring, [0, 1], [-30, 0])}px)`,
        }}
      >
        Mooring Booking
      </div>

      {/* Anchor icon */}
      <div
        style={{
          fontSize: 80,
          marginBottom: 30,
          opacity: interpolate(brandSpring, [0, 1], [0, 1]),
          filter: "drop-shadow(0 5px 20px rgba(20,184,166,0.5))",
        }}
      >
        ⚓
      </div>

      {/* Main CTA text */}
      <div
        style={{
          fontSize: 62,
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
        Budi među
        <br />
        <span style={{ color: "#fbbf24" }}>prvima!</span> 🇭🇷
      </div>

      {/* CTA Button */}
      <div
        style={{
          marginTop: 40,
          transform: `scale(${pulsePhase})`,
          opacity: interpolate(frame, [25, 40], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            borderRadius: 30,
            padding: "25px 60px",
            boxShadow: `0 10px 40px rgba(16,185,129,${glowIntensity + 0.2})`,
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: 900,
              color: "#ffffff",
              textAlign: "center",
            }}
          >
            REGISTRIRAJ SE BESPLATNO
          </div>
        </div>
      </div>

      {/* Arrow pointing down */}
      <div
        style={{
          fontSize: 50,
          marginTop: 20,
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
          fontSize: 26,
          fontWeight: 700,
          color: "rgba(255,255,255,0.7)",
          marginTop: 20,
          opacity: interpolate(frame, [45, 60], [0, 1], {
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
