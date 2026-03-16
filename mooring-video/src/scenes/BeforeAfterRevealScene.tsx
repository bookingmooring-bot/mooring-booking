import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  staticFile,
  Easing,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700", "900"],
  subsets: ["latin-ext"],
});

// Before/After reveal scene — wipe transition from "before" to "after" image
// Shows empty mooring → full mooring with booking numbers

interface BeforeAfterRevealSceneProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel: string;
  afterLabel: string;
  earningsText: string;
}

export const BeforeAfterRevealScene: React.FC<BeforeAfterRevealSceneProps> = ({
  beforeImage,
  afterImage,
  beforeLabel,
  afterLabel,
  earningsText,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Phase 1: Show "before" with slow zoom (0-80 frames)
  const beforeScale = interpolate(frame, [0, 80], [1.0, 1.1], {
    extrapolateRight: "clamp",
  });

  // Phase 2: Wipe reveal (80-130 frames) — the "after" image slides in from right
  const wipeProgress = interpolate(frame, [80, 130], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Phase 3: "After" zoom (130+)
  const afterScale = interpolate(frame, [130, durationInFrames], [1.1, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Before label
  const beforeOpacity = interpolate(frame, [10, 25, 70, 85], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "PRIJE" stamp
  const stamSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 8, stiffness: 200 },
  });

  // After label
  const afterOpacity = interpolate(frame, [135, 150], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "POSLIJE" stamp
  const afterStampSpring = spring({
    frame: frame - 140,
    fps,
    config: { damping: 8, stiffness: 200 },
  });

  // Earnings counter
  const earningsSpring = spring({
    frame: frame - 155,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // € flash
  const flashOpacity = interpolate(
    frame,
    [125, 130, 135],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: "#0a1628",
      }}
    >
      {/* BEFORE image — always showing, below */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: `scale(${beforeScale})`,
        }}
      >
        <Img
          src={staticFile(beforeImage)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "saturate(0.4) brightness(0.7)",
          }}
        />
      </div>

      {/* AFTER image — clips in from right via wipe */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          clipPath: `inset(0 ${wipeProgress}% 0 0)`,
          transform: `scale(${afterScale})`,
        }}
      >
        <Img
          src={staticFile(afterImage)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "saturate(1.2) brightness(1.05)",
          }}
        />
      </div>

      {/* Wipe edge line */}
      {wipeProgress > 0 && wipeProgress < 100 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${100 - wipeProgress}%`,
            width: 4,
            background: "rgba(255,255,255,0.8)",
            boxShadow: "0 0 20px rgba(255,255,255,0.5)",
          }}
        />
      )}

      {/* White flash on transition */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "white",
          opacity: flashOpacity * 0.4,
        }}
      />

      {/* Dark overlay for text */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "45%",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)",
        }}
      />

      {/* BEFORE stamp */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${interpolate(stamSpring, [0, 1], [2, 1])}) rotate(${interpolate(stamSpring, [0, 1], [-15, -8])}deg)`,
          opacity: beforeOpacity,
          fontFamily,
        }}
      >
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: "#ef4444",
            border: "5px solid #ef4444",
            borderRadius: 12,
            padding: "12px 40px",
            textShadow: "0 3px 15px rgba(0,0,0,0.8)",
            boxShadow: "0 5px 30px rgba(239,68,68,0.3)",
          }}
        >
          {beforeLabel}
        </div>
      </div>

      {/* AFTER stamp */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${interpolate(afterStampSpring, [0, 1], [2, 1])}) rotate(${interpolate(afterStampSpring, [0, 1], [15, 5])}deg)`,
          opacity: afterOpacity,
          fontFamily,
        }}
      >
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: "#10b981",
            border: "5px solid #10b981",
            borderRadius: 12,
            padding: "12px 40px",
            textShadow: "0 3px 15px rgba(0,0,0,0.8)",
            boxShadow: "0 5px 30px rgba(16,185,129,0.3)",
          }}
        >
          {afterLabel}
        </div>
      </div>

      {/* Earnings display — bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          left: 60,
          right: 60,
          textAlign: "center",
          fontFamily,
          opacity: interpolate(earningsSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(earningsSpring, [0, 1], [40, 0])}px)`,
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: "#10b981",
            textShadow: "0 4px 25px rgba(16,185,129,0.5)",
          }}
        >
          {earningsText}
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            color: "rgba(255,255,255,0.8)",
            marginTop: 8,
          }}
        >
          po sezoni na tvom vezu 💰
        </div>
      </div>

      {/* Brand watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily,
          fontSize: 22,
          fontWeight: 700,
          color: "rgba(255,255,255,0.5)",
          opacity: interpolate(frame, [150, 170], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        ⚓ mooringbooking.com
      </div>
    </AbsoluteFill>
  );
};
