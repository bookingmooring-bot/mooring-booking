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

// Reusable Ken Burns image scene with slow zoom + pan + text overlay
// Used in Reel 4 for the Mediterranean lifestyle journey

interface KenBurnsImageSceneProps {
  imageSrc: string;
  headline: string;
  subtext: string;
  country: string;
  flag: string;
  // Ken Burns direction: which corner to zoom toward
  zoomDirection?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
  // Starting scale (should be > 1 for zoom-out, < endScale for zoom-in)
  startScale?: number;
  endScale?: number;
}

export const KenBurnsImageScene: React.FC<KenBurnsImageSceneProps> = ({
  imageSrc,
  headline,
  subtext,
  country,
  flag,
  zoomDirection = "center",
  startScale = 1.3,
  endScale = 1.0,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Ken Burns: slow zoom over entire duration
  const scale = interpolate(
    frame,
    [0, durationInFrames],
    [startScale, endScale],
    { extrapolateRight: "clamp" }
  );

  // Ken Burns: slow pan based on direction
  const panX = (() => {
    switch (zoomDirection) {
      case "top-left":
      case "bottom-left":
        return interpolate(frame, [0, durationInFrames], [5, -5], {
          extrapolateRight: "clamp",
        });
      case "top-right":
      case "bottom-right":
        return interpolate(frame, [0, durationInFrames], [-5, 5], {
          extrapolateRight: "clamp",
        });
      default:
        return 0;
    }
  })();

  const panY = (() => {
    switch (zoomDirection) {
      case "top-left":
      case "top-right":
        return interpolate(frame, [0, durationInFrames], [3, -3], {
          extrapolateRight: "clamp",
        });
      case "bottom-left":
      case "bottom-right":
        return interpolate(frame, [0, durationInFrames], [-3, 3], {
          extrapolateRight: "clamp",
        });
      default:
        return interpolate(frame, [0, durationInFrames], [2, -2], {
          extrapolateRight: "clamp",
        });
    }
  })();

  // Text animations
  const flagSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const headlineOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headlineY = interpolate(frame, [15, 35], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const subtextOpacity = interpolate(frame, [35, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtextY = interpolate(frame, [35, 55], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Country badge
  const badgeSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: "#0a1628",
      }}
    >
      {/* Ken Burns image — full bleed, covers entire frame */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: `scale(${scale}) translate(${panX}%, ${panY}%)`,
          transformOrigin: zoomDirection === "center" ? "center" : zoomDirection.replace("-", " "),
        }}
      >
        <Img
          src={staticFile(imageSrc)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Dark gradient overlay for text readability */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "60%",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
        }}
      />

      {/* Top vignette */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "25%",
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)",
        }}
      />

      {/* Country flag badge — top right */}
      <div
        style={{
          position: "absolute",
          top: 80,
          right: 50,
          fontSize: 80,
          opacity: interpolate(badgeSpring, [0, 1], [0, 1]),
          transform: `scale(${interpolate(badgeSpring, [0, 1], [0.3, 1])})`,
          filter: "drop-shadow(0 4px 15px rgba(0,0,0,0.5))",
        }}
      >
        {flag}
      </div>

      {/* Text content — bottom area */}
      <div
        style={{
          position: "absolute",
          bottom: 180,
          left: 60,
          right: 60,
          fontFamily,
        }}
      >
        {/* Country name */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#14b8a6",
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 12,
            opacity: interpolate(flagSpring, [0, 1], [0, 1]),
            transform: `translateX(${interpolate(flagSpring, [0, 1], [-30, 0])}px)`,
          }}
        >
          {country}
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: "#ffffff",
            lineHeight: 1.15,
            opacity: headlineOpacity,
            transform: `translateY(${headlineY}px)`,
            textShadow: "0 3px 15px rgba(0,0,0,0.6)",
          }}
        >
          {headline}
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: 30,
            fontWeight: 400,
            color: "rgba(255,255,255,0.8)",
            marginTop: 16,
            opacity: subtextOpacity,
            transform: `translateY(${subtextY}px)`,
            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
          }}
        >
          {subtext}
        </div>
      </div>

      {/* Bottom branding bar */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 60,
          right: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: interpolate(frame, [40, 60], [0, 0.8], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "rgba(255,255,255,0.7)",
            fontFamily,
            letterSpacing: 1,
          }}
        >
          ⚓ mooringbooking.com
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 400,
            color: "rgba(255,255,255,0.5)",
            fontFamily,
          }}
        >
          Besplatno listanje
        </div>
      </div>
    </AbsoluteFill>
  );
};
