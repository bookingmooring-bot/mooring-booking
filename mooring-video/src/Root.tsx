import { Composition, Folder } from "remotion";
import { Reel1Zarada } from "./Reel1Zarada";
import { Reel2Launch } from "./Reel2Launch";
import { Reel3ZeroRisk } from "./Reel3ZeroRisk";
import { Reel4MediterranJourney } from "./Reel4MediterranJourney";
import { Reel5BeforeAfter } from "./Reel5BeforeAfter";

export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="Croatian-Ads">
      <Composition
        id="Reel1Zarada"
        component={Reel1Zarada}
        durationInFrames={750}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Reel2Launch"
        component={Reel2Launch}
        durationInFrames={750}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Reel3ZeroRisk"
        component={Reel3ZeroRisk}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Reel4MediterranJourney"
        component={Reel4MediterranJourney}
        durationInFrames={750}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Reel5BeforeAfter"
        component={Reel5BeforeAfter}
        durationInFrames={750}
        fps={30}
        width={1080}
        height={1920}
      />
    </Folder>
  );
};
