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

// Phone notification scene — shows earnings/booking notifications with zoom
// Uses the phone mockup image as a background with animated overlays

export const PhoneNotificationScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Slow zoom into phone
  const phoneScale = interpolate(frame, [0, durationInFrames], [1.05, 1.25], {
    extrapolateRight: "clamp",
  });

  // Notification pulse animations
  const pulse1 = interpolate(
    frame,
    [20, 30, 40],
    [1, 1.05, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const pulse2 = interpolate(
    frame,
    [60, 70, 80],
    [1, 1.05, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Text overlays
  const textSpring = spring({
    frame: frame - 40,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const ctaSpring = spring({
    frame: frame - 90,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  // Notification count badge
  const badgeSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 6, stiffness: 300 },
  });

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: "#0a1628",
      }}
    >
      {/* Phone mockup image with zoom */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: `scale(${phoneScale})`,
          transformOrigin: "center 40%",
        }}
      >
        <Img
          src={staticFile("images/phone_mockup.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Gradient overlay for text */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "50%",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)",
        }}
      />

      {/* Notification count badge — top right */}
      <div
        style={{
          position: "absolute",
          top: 60,
          right: 70,
          width: 65,
          height: 65,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(239,68,68,0.5)",
          opacity: interpolate(badgeSpring, [0, 1], [0, 1]),
          transform: `scale(${interpolate(badgeSpring, [0, 1], [0, 1.1])})`,
          fontFamily,
          fontSize: 32,
          fontWeight: 900,
          color: "#ffffff",
        }}
      >
        3
      </div>

      {/* "Dok ti..." text */}
      <div
        style={{
          position: "absolute",
          bottom: 300,
          left: 60,
          right: 60,
          fontFamily,
          opacity: interpolate(textSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(textSpring, [0, 1], [30, 0])}px)`,
        }}
      >
        <div
          style={{
            fontSize: 38,
            fontWeight: 400,
            color: "rgba(255,255,255,0.7)",
            marginBottom: 8,
          }}
        >
          Dok ti uživaš na plaži...
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: "#ffffff",
            lineHeight: 1.2,
            textShadow: "0 3px 15px rgba(0,0,0,0.6)",
          }}
        >
          vez ti{" "}
          <span style={{ color: "#10b981" }}>zarađuje!</span>
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          position: "absolute",
          bottom: 130,
          left: 60,
          right: 60,
          fontFamily,
          opacity: interpolate(ctaSpring, [0, 1], [0, 1]),
          transform: `scale(${interpolate(ctaSpring, [0, 1], [0.8, 1])})`,
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            borderRadius: 20,
            padding: "22px 40px",
            textAlign: "center",
            boxShadow: "0 8px 30px rgba(16,185,129,0.4)",
          }}
        >
          <div
            style={{
              fontSize: 30,
              fontWeight: 900,
              color: "#ffffff",
            }}
          >
            Listaj svoj vez besplatno ⚓
          </div>
        </div>
      </div>

      {/* URL */}
      <div
        style={{
          position: "absolute",
          bottom: 70,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily,
          fontSize: 20,
          fontWeight: 700,
          color: "rgba(255,255,255,0.5)",
          opacity: interpolate(frame, [100, 120], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        mooringbooking.com
      </div>
    </AbsoluteFill>
  );
};
