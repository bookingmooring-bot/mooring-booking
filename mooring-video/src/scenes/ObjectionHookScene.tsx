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

// Reel 3, Scene 1: Objection Hook — "15% provizije je previše? 🤔"
// Duration: ~120 frames (4s)
// Energy: Confident, direct

export const ObjectionHookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Question mark slam
  const questionSpring = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 200 },
  });

  // Text reveal
  const textSpring = spring({
    frame: frame - 8,
    fps,
    config: { damping: 12 },
  });

  // Thinking emoji wobble
  const wobble = interpolate(
    frame,
    [30, 40, 50, 60, 70, 80],
    [0, -15, 15, -10, 10, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // "15%" grows big
  const percentSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 10 },
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #1a1a2e 0%, #2d2d44 40%, #3d3d5c 100%)",
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
      }}
    >
      {/* Thinking emoji */}
      <div
        style={{
          fontSize: 100,
          transform: `rotate(${wobble}deg) scale(${interpolate(questionSpring, [0, 1], [0, 1])})`,
          marginBottom: 40,
          filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.4))",
        }}
      >
        🤔
      </div>

      {/* "15%" big number */}
      <div
        style={{
          fontSize: 130,
          fontWeight: 900,
          color: "#ef4444",
          textAlign: "center",
          lineHeight: 1,
          transform: `scale(${interpolate(percentSpring, [0, 1], [0.3, 1])})`,
          opacity: interpolate(percentSpring, [0, 1], [0, 1]),
          textShadow: "0 4px 30px rgba(239,68,68,0.5)",
        }}
      >
        15%
      </div>

      {/* "provizije je previše?" */}
      <div
        style={{
          fontSize: 44,
          fontWeight: 700,
          color: "rgba(255,255,255,0.8)",
          textAlign: "center",
          marginTop: 15,
          opacity: interpolate(textSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(textSpring, [0, 1], [30, 0])}px)`,
        }}
      >
        provizije je previše?
      </div>

      {/* Subtle "Hajde da vidimo..." */}
      <div
        style={{
          fontSize: 30,
          fontWeight: 400,
          color: "rgba(255,255,255,0.4)",
          textAlign: "center",
          marginTop: 30,
          opacity: interpolate(frame, [70, 90], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Hajde da izračunamo... 🧮
      </div>
    </AbsoluteFill>
  );
};
