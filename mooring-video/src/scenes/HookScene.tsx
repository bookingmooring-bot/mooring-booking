import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700", "900"],
  subsets: ["latin-ext"],
});

// Scene 1: Hook — "Tvoj vez stoji prazan? ⚓"
// Duration: ~100 frames (3.3s)
// Purpose: Stop the scroll with a powerful question

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background wave animation
  const waveOffset = interpolate(frame, [0, 100], [0, 30], {
    extrapolateRight: "clamp",
  });

  // Main text entrance — spring bounce
  const textSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 150 },
  });
  const textScale = interpolate(textSpring, [0, 1], [0.3, 1]);
  const textOpacity = interpolate(textSpring, [0, 1], [0, 1]);

  // Anchor emoji bounces in after text
  const anchorSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 8 },
  });
  const anchorScale = interpolate(anchorSpring, [0, 1], [0, 1.2]);
  const anchorRotation = interpolate(anchorSpring, [0, 1], [-45, 0]);

  // Subtle pulse on the question mark
  const pulse = interpolate(
    frame,
    [60, 70, 80, 90, 100],
    [1, 1.1, 1, 1.1, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, #0a1628 0%, #0f2847 40%, #1a4a6e ${50 + waveOffset}%, #1e5a8a 100%)`,
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
      }}
    >
      {/* Decorative top waves */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 200,
          background:
            "linear-gradient(180deg, rgba(13,148,136,0.3) 0%, transparent 100%)",
          opacity: 0.5,
        }}
      />

      {/* Anchor emoji */}
      <div
        style={{
          fontSize: 120,
          transform: `scale(${anchorScale}) rotate(${anchorRotation}deg)`,
          marginBottom: 40,
          filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.5))",
        }}
      >
        ⚓
      </div>

      {/* Main question text */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 900,
          color: "#ffffff",
          textAlign: "center",
          lineHeight: 1.2,
          transform: `scale(${textScale * pulse})`,
          opacity: textOpacity,
          textShadow: "0 4px 20px rgba(0,0,0,0.6)",
          maxWidth: 900,
        }}
      >
        Tvoj vez stoji
        <br />
        <span style={{ color: "#fbbf24" }}>prazan?</span>
      </div>

      {/* Subtext fades in later */}
      <div
        style={{
          fontSize: 32,
          fontWeight: 400,
          color: "rgba(255,255,255,0.7)",
          textAlign: "center",
          marginTop: 30,
          opacity: interpolate(frame, [40, 60], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          transform: `translateY(${interpolate(frame, [40, 60], [30, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}px)`,
        }}
      >
        Dok tvog broda nema, gubiš novac.
      </div>
    </AbsoluteFill>
  );
};
