import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { KenBurnsImageScene } from "./scenes/KenBurnsImageScene";
import { CTAScene } from "./scenes/CTAScene";

// Reel #4: "Mediteran te čeka" — Mediterranean Journey — 25s @ 30fps = 750 frames
// Uses generated lifestyle images with Ken Burns motion control
// Flow: Croatia → Greece → Montenegro → Turkey → CTA

const TRANSITION_DURATION = 15;

export const Reel4MediterranJourney: React.FC = () => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        {/* Scene 1: Croatia — slow zoom out, pan right (0-5s) */}
        <TransitionSeries.Sequence durationInFrames={155}>
          <KenBurnsImageScene
            imageSrc="images/croatia.png"
            headline="Tvoj vez može zarađivati"
            subtext="Listiraj ga besplatno. Zarađuj od prvog dana."
            country="Hrvatska"
            flag="🇭🇷"
            zoomDirection="top-right"
            startScale={1.35}
            endScale={1.05}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 2: Greece — zoom in toward center (5-10s) */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <KenBurnsImageScene
            imageSrc="images/greece.png"
            headline="Gosti iz cijelog svijeta"
            subtext="15 jezika. 11 zemalja. Instant vidljivost."
            country="Grčka"
            flag="🇬🇷"
            zoomDirection="bottom-left"
            startScale={1.0}
            endScale={1.3}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 3: Montenegro — slow pan left (10-15s) */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <KenBurnsImageScene
            imageSrc="images/montenegro.png"
            headline="€5.000+ po sezoni"
            subtext="Prosječna zarada od jednog veza."
            country="Crna Gora"
            flag="🇲🇪"
            zoomDirection="top-left"
            startScale={1.3}
            endScale={1.1}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 4: Turkey — dramatic zoom (15-20s) */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <KenBurnsImageScene
            imageSrc="images/turkey.png"
            headline="Nula rizika"
            subtext="Plaćaš samo 15% kad zaradiš. Besplatno listanje."
            country="Turska"
            flag="🇹🇷"
            zoomDirection="bottom-right"
            startScale={1.0}
            endScale={1.4}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 5: CTA — reuse existing (20-25s) */}
        <TransitionSeries.Sequence durationInFrames={205}>
          <CTAScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
