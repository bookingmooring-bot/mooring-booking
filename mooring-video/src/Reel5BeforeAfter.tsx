import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { BeforeAfterRevealScene } from "./scenes/BeforeAfterRevealScene";
import { PhoneNotificationScene } from "./scenes/PhoneNotificationScene";
import { EarningsDashboardScene } from "./scenes/EarningsDashboardScene";
import { CTAScene } from "./scenes/CTAScene";

// Reel #5: "Prije vs Poslije" — Before/After Transformation — 25s @ 30fps = 750 frames
// Uses generated before/after images with wipe reveals + phone mockup + earnings dashboard

const TRANSITION_DURATION = 12;

export const Reel5BeforeAfter: React.FC = () => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        {/* Scene 1: Before/After dock wipe (0-7s = 210 frames) */}
        <TransitionSeries.Sequence durationInFrames={215}>
          <BeforeAfterRevealScene
            beforeImage="images/before_after.png"
            afterImage="images/croatia.png"
            beforeLabel="PRIJE ❌"
            afterLabel="POSLIJE ✅"
            earningsText="€5.000+"
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 2: Phone notifications — "Dok ti uživaš..." (7-13s = 180 frames) */}
        <TransitionSeries.Sequence durationInFrames={185}>
          <PhoneNotificationScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 3: Earnings dashboard (13-19s = 180 frames) */}
        <TransitionSeries.Sequence durationInFrames={185}>
          <EarningsDashboardScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 4: CTA (19-25s) */}
        <TransitionSeries.Sequence durationInFrames={213}>
          <CTAScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
