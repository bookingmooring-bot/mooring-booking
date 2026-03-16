import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  staticFile,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700", "900"],
  subsets: ["latin-ext"],
});

// Earnings dashboard scene — shows the calculator/dashboard image with animated overlays
export const EarningsDashboardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Slow zoom
  const imgScale = interpolate(frame, [0, durationInFrames], [1.1, 1.0], {
    extrapolateRight: "clamp",
  });

  // Stats counter animation
  const counterValue = Math.round(
    interpolate(frame, [30, 90], [0, 5000], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Bottom text
  const textOpacity = interpolate(frame, [50, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ctaSpring = spring({
    frame: frame - 80,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: "#0a1628",
      }}
    >
      {/* Dashboard image */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: `scale(${imgScale})`,
        }}
      >
        <Img
          src={staticFile("images/earnings.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "55%",
          background:
            "linear-gradient(to top, rgba(10,22,40,1) 0%, rgba(10,22,40,0.8) 40%, transparent 100%)",
        }}
      />

      {/* Animated counter overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 280,
          left: 60,
          right: 60,
          textAlign: "center",
          fontFamily,
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontWeight: 400,
            color: "rgba(255,255,255,0.7)",
            marginBottom: 8,
          }}
        >
          Prosječna zarada po sezoni
        </div>
        <div
          style={{
            fontSize: 90,
            fontWeight: 900,
            color: "#10b981",
            textShadow: "0 4px 30px rgba(16,185,129,0.5)",
            lineHeight: 1,
          }}
        >
          €{counterValue.toLocaleString("de-DE")}+
        </div>
      </div>

      {/* Bottom text */}
      <div
        style={{
          position: "absolute",
          bottom: 130,
          left: 60,
          right: 60,
          textAlign: "center",
          fontFamily,
          opacity: textOpacity,
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#fbbf24",
            marginBottom: 15,
          }}
        >
          Nula ulaganja. 100% zarađeno. 💰
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 400,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          Besplatno listanje • 15% provizija samo kad zaradiš
        </div>
      </div>

      {/* URL */}
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
          opacity: interpolate(ctaSpring, [0, 1], [0, 1]),
        }}
      >
        ⚓ mooringbooking.com
      </div>
    </AbsoluteFill>
  );
};
