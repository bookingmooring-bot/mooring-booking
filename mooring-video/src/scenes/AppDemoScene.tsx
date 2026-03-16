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

// Scene 3: App Demo — "Besplatna prijava u 10 min"
// Duration: ~160 frames (5.3s)
// Purpose: Show how easy it is to list a mooring

export const AppDemoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phone mockup slide up
  const phoneSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });
  const phoneY = interpolate(phoneSpring, [0, 1], [400, 0]);

  // Steps appear sequentially
  const steps = [
    { icon: "📸", text: "Dodaj fotke", delay: 30 },
    { icon: "💰", text: "Postavi cijenu", delay: 55 },
    { icon: "📅", text: "Otvori kalendar", delay: 80 },
    { icon: "✅", text: "Gotovo!", delay: 105 },
  ];

  // Timer countdown 10:00 → 0:00
  const timerValue = Math.max(
    0,
    Math.round(
      interpolate(frame, [20, 140], [600, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );
  const minutes = Math.floor(timerValue / 60);
  const seconds = timerValue % 60;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: 48,
          fontWeight: 900,
          color: "#ffffff",
          textAlign: "center",
          marginBottom: 30,
          opacity: interpolate(frame, [0, 15], [0, 1], {
            extrapolateRight: "clamp",
          }),
          textShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        Listaj u samo
      </div>

      {/* Timer display */}
      <div
        style={{
          fontSize: 100,
          fontWeight: 900,
          color: "#a78bfa",
          textAlign: "center",
          marginBottom: 50,
          opacity: interpolate(frame, [10, 25], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          textShadow: "0 4px 30px rgba(167,139,250,0.5)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {minutes}:{seconds.toString().padStart(2, "0")} ⏱️
      </div>

      {/* Phone mockup */}
      <div
        style={{
          transform: `translateY(${phoneY}px)`,
          width: 340,
          height: 600,
          borderRadius: 40,
          background: "linear-gradient(180deg, #1f2937 0%, #111827 100%)",
          border: "3px solid rgba(255,255,255,0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 30,
          padding: 40,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* App header inside phone */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#a78bfa",
            textAlign: "center",
          }}
        >
          Mooring Booking
        </div>

        {/* Animated steps */}
        {steps.map((step, i) => {
          const stepSpring = spring({
            frame: frame - step.delay,
            fps,
            config: { damping: 12 },
          });
          const stepOpacity = interpolate(stepSpring, [0, 1], [0, 1]);
          const stepX = interpolate(stepSpring, [0, 1], [100, 0]);

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 15,
                opacity: stepOpacity,
                transform: `translateX(${stepX}px)`,
                width: "100%",
              }}
            >
              <div
                style={{
                  fontSize: 36,
                  width: 50,
                  textAlign: "center",
                }}
              >
                {step.icon}
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: step.text === "Gotovo!" ? "#10b981" : "#ffffff",
                }}
              >
                {step.text}
              </div>
              {stepOpacity > 0.8 && step.text !== "Gotovo!" && (
                <div style={{ fontSize: 24, color: "#10b981", marginLeft: "auto" }}>
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom text */}
      <div
        style={{
          fontSize: 36,
          fontWeight: 700,
          color: "#fbbf24",
          textAlign: "center",
          marginTop: 40,
          opacity: interpolate(frame, [120, 140], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Besplatno. Bez pretplate. 🆓
      </div>
    </AbsoluteFill>
  );
};
