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

// Reel 3, Scene 4: Zero Risk CTA — "Nula rizika. 👇 Klikni i prijavi vez!"
// Duration: ~150 frames (5s)
// Confident and direct — close the sale

export const ZeroRiskCTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Checkmark slam
  const checkSpring = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 200 },
  });

  // CTA button pulse
  const buttonPulse = interpolate(
    frame % 25,
    [0, 12, 25],
    [1, 1.08, 1]
  );

  // Arrow bounce
  const arrowBounce = interpolate(
    frame % 25,
    [0, 12, 25],
    [0, 18, 0]
  );

  // Confidence glow
  const glowIntensity = interpolate(
    frame,
    [40, 60, 80, 100, 120],
    [0.2, 0.5, 0.2, 0.5, 0.3],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Summary stats appear
  const stats = [
    { text: "€4.250+ zarade", delay: 20 },
    { text: "85% za tebe", delay: 35 },
    { text: "0 rizika", delay: 50 },
  ];

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #064e3b 0%, #065f46 30%, #047857 60%, #10b981 100%)",
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
      }}
    >
      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(16,185,129,${glowIntensity}) 0%, transparent 70%)`,
          top: "25%",
        }}
      />

      {/* Big checkmark */}
      <div
        style={{
          fontSize: 100,
          transform: `scale(${interpolate(checkSpring, [0, 1], [0, 1])}) rotate(${interpolate(checkSpring, [0, 1], [-90, 0])}deg)`,
          marginBottom: 20,
          filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.3))",
        }}
      >
        ✅
      </div>

      {/* "NULA RIZIKA" */}
      <div
        style={{
          fontSize: 60,
          fontWeight: 900,
          color: "#ffffff",
          textAlign: "center",
          marginBottom: 25,
          opacity: interpolate(frame, [8, 22], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          textShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}
      >
        NULA RIZIKA.
      </div>

      {/* Quick stats row */}
      <div
        style={{
          display: "flex",
          gap: 15,
          marginBottom: 35,
          flexWrap: "wrap",
          justifyContent: "center",
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
                background: "rgba(255,255,255,0.15)",
                borderRadius: 15,
                padding: "10px 22px",
                border: "1px solid rgba(255,255,255,0.2)",
                transform: `scale(${interpolate(statSpring, [0, 1], [0, 1])})`,
                opacity: interpolate(statSpring, [0, 1], [0, 1]),
              }}
            >
              <span style={{ fontSize: 24, fontWeight: 700, color: "#ffffff" }}>
                {stat.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* CTA Button */}
      <div
        style={{
          transform: `scale(${buttonPulse})`,
          opacity: interpolate(frame, [35, 50], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)",
            borderRadius: 30,
            padding: "25px 55px",
            boxShadow: `0 10px 40px rgba(255,255,255,${glowIntensity + 0.1})`,
          }}
        >
          <div
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: "#065f46",
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
          opacity: interpolate(frame, [50, 65], [0, 1], {
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
          opacity: interpolate(frame, [55, 70], [0, 1], {
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
