import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { ObjectionHookScene } from "./scenes/ObjectionHookScene";
import { MathProofScene } from "./scenes/MathProofScene";
import { FreeListingScene } from "./scenes/FreeListingScene";
import { ZeroRiskCTAScene } from "./scenes/ZeroRiskCTAScene";

// Reel #3: "Nula rizika" — Zero Risk — 20s @ 30fps = 600 frames
const TRANSITION_DURATION = 12;

export const Reel3ZeroRisk: React.FC = () => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        {/* Scene 1: Objection Hook — "15% je previše?" (0-4s) */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <ObjectionHookScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 2: Math Proof — "❌ €0 vs ✅ €4.250+" (4-10s) */}
        <TransitionSeries.Sequence durationInFrames={186}>
          <MathProofScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 3: Free Listing — "Plaćaš samo kad zaradiš" (10-15s) */}
        <TransitionSeries.Sequence durationInFrames={156}>
          <FreeListingScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 4: Zero Risk CTA — "Nula rizika. Prijavi vez!" (15-20s) */}
        <TransitionSeries.Sequence durationInFrames={174}>
          <ZeroRiskCTAScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
