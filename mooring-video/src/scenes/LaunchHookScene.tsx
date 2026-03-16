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

// Reel 2, Scene 1: Launch Hook — "NOVO: Airbnb za vezove u HR! 🚀"
// Duration: ~100 frames (3.3s)
// Energy: HIGH — excitement, urgency

export const LaunchHookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "NOVO" badge slams in
  const novoSpring = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 200 },
  });
  const novoScale = interpolate(novoSpring, [0, 1], [3, 1]);

  // Main text slides up
  const textSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 12 },
  });
  const textY = interpolate(textSpring, [0, 1], [200, 0]);
  const textOpacity = interpolate(textSpring, [0, 1], [0, 1]);

  // Rocket emoji launches upward
  const rocketY = interpolate(frame, [20, 70], [300, -50], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rocketOpacity = interpolate(frame, [20, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Particle burst effect
  const particles = Array.from({ length: 8 }, (_, i) => ({
    angle: (i * 45 * Math.PI) / 180,
    delay: 5 + i * 2,
  }));

  // Pulsing background
  const bgPulse = interpolate(
    frame % 30,
    [0, 15, 30],
    [1, 1.02, 1]
  );

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, #ff6b35 0%, #f7c948 30%, #ff4757 60%, #c44569 100%)`,
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
        transform: `scale(${bgPulse})`,
      }}
    >
      {/* Sparkle particles */}
      {particles.map((p, i) => {
        const dist = interpolate(
          frame,
          [p.delay, p.delay + 30],
          [0, 300],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const pOpacity = interpolate(
          frame,
          [p.delay, p.delay + 15, p.delay + 30],
          [0, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `calc(50% + ${Math.sin(p.angle) * dist}px)`,
              left: `calc(50% + ${Math.cos(p.angle) * dist}px)`,
              fontSize: 24,
              opacity: pOpacity,
            }}
          >
            ✨
          </div>
        );
      })}

      {/* "NOVO" badge */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: 20,
          padding: "12px 40px",
          marginBottom: 30,
          transform: `scale(${novoScale})`,
          boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 900,
            color: "#ff4757",
            letterSpacing: 6,
          }}
        >
          🚀 NOVO
        </div>
      </div>

      {/* Main text */}
      <div
        style={{
          transform: `translateY(${textY}px)`,
          opacity: textOpacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: "#ffffff",
            lineHeight: 1.15,
            textShadow: "0 4px 20px rgba(0,0,0,0.4)",
          }}
        >
          „Airbnb za
          <br />
          <span style={{ fontSize: 72 }}>vezove"</span>
        </div>

        <div
          style={{
            fontSize: 42,
            fontWeight: 700,
            color: "rgba(255,255,255,0.9)",
            marginTop: 20,
            textShadow: "0 2px 10px rgba(0,0,0,0.3)",
          }}
        >
          u Hrvatskoj! 🇭🇷
        </div>
      </div>

      {/* Rocket */}
      <div
        style={{
          position: "absolute",
          right: 80,
          bottom: rocketY,
          fontSize: 80,
          opacity: rocketOpacity,
          transform: "rotate(-45deg)",
          filter: "drop-shadow(0 5px 15px rgba(0,0,0,0.3))",
        }}
      >
        🚀
      </div>
    </AbsoluteFill>
  );
};
