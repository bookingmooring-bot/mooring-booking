import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { LaunchHookScene } from "./scenes/LaunchHookScene";
import { EarlyMoverScene } from "./scenes/EarlyMoverScene";
import { CompetitionScene } from "./scenes/CompetitionScene";
import { InstantVisibilityScene } from "./scenes/InstantVisibilityScene";
import { LaunchCTAScene } from "./scenes/LaunchCTAScene";

// Reel #2: "Airbnb za vezove" — Launch/FOMO — 25s @ 30fps
const TRANSITION_DURATION = 12;

export const Reel2Launch: React.FC = () => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        {/* Scene 1: Launch Hook — "NOVO: Airbnb za vezove!" (0-3s) */}
        <TransitionSeries.Sequence durationInFrames={100}>
          <LaunchHookScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 2: Early Mover — "Prioritetni prikaz" (3-8s) */}
        <TransitionSeries.Sequence durationInFrames={165}>
          <EarlyMoverScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 3: Competition — "Preduhitri konkurenciju!" (8-14s) */}
        <TransitionSeries.Sequence durationInFrames={175}>
          <CompetitionScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 4: Instant Visibility — "11 zemalja" (14-20s) */}
        <TransitionSeries.Sequence durationInFrames={155}>
          <InstantVisibilityScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 5: Launch CTA — "Budi prvi!" (20-25s) */}
        <TransitionSeries.Sequence durationInFrames={203}>
          <LaunchCTAScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
