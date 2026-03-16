import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { HookScene } from "./scenes/HookScene";
import { EarningScene } from "./scenes/EarningScene";
import { AppDemoScene } from "./scenes/AppDemoScene";
import { TrustScene } from "./scenes/TrustScene";
import { ReachScene } from "./scenes/ReachScene";
import { CTAScene } from "./scenes/CTAScene";

// Reel #1: "Tvoj vez zarađuje" — 25s @ 30fps
// Scene durations account for transition overlaps
const TRANSITION_DURATION = 12;

export const Reel1Zarada: React.FC = () => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        {/* Scene 1: Hook — "Tvoj vez stoji prazan?" (0-3s = ~90 frames) */}
        <TransitionSeries.Sequence durationInFrames={100}>
          <HookScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 2: Earning — "€5.000+ po sezoni" (3-8s = ~150 frames) */}
        <TransitionSeries.Sequence durationInFrames={160}>
          <EarningScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 3: App Demo — "Besplatna prijava u 10 min" (8-13s = ~150 frames) */}
        <TransitionSeries.Sequence durationInFrames={160}>
          <AppDemoScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 4: Trust — "15% provizije. Nula rizika!" (13-17s = ~120 frames) */}
        <TransitionSeries.Sequence durationInFrames={132}>
          <TrustScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 5: Reach — "Gosti iz 11 zemalja" (17-21s = ~120 frames) */}
        <TransitionSeries.Sequence durationInFrames={132}>
          <ReachScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 6: CTA — "Budi prvi u HR! 🇭🇷" (21-25s = ~120 frames) */}
        <TransitionSeries.Sequence durationInFrames={126}>
          <CTAScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
