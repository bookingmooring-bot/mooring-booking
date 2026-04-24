import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { saveMyPreferences } from "@/lib/aiPreferences";
import type { AnswerStyle, ExperienceLevel, AiCaptainPreferences } from "@/lib/aiCaptainPayload";

interface Props {
  onDone: (prefs: AiCaptainPreferences) => void;
  compact?: boolean;
}

const STYLE_IDS: { id: AnswerStyle; icon: string }[] = [
  { id: "bullets", icon: "•" },
  { id: "balanced", icon: "≈" },
  { id: "detailed", icon: "¶" },
];

const LEVEL_IDS: ExperienceLevel[] = ["beginner", "intermediate", "advanced", "professional"];

const OnboardingPreferences = ({ onDone, compact = false }: Props) => {
  const { t } = useTranslation();
  const [style, setStyle] = useState<AnswerStyle | null>(null);
  const [level, setLevel] = useState<ExperienceLevel | null>(null);
  const [saving, setSaving] = useState(false);

  const canSubmit = style !== null && level !== null && !saving;

  const handleSubmit = async () => {
    if (!style || !level) return;
    setSaving(true);
    const prefs: AiCaptainPreferences = { answerStyle: style, experienceLevel: level };
    const ok = await saveMyPreferences(prefs);
    setSaving(false);
    if (ok) onDone(prefs);
  };

  const padding = compact ? "p-3" : "p-4";
  const titleSize = compact ? "text-sm" : "text-base";
  const labelSize = compact ? "text-[11px]" : "text-xs";
  const btnSize = compact ? "px-2.5 py-1.5 text-[11px]" : "px-3 py-2 text-xs";

  return (
    <div className={`${padding} space-y-4 overflow-y-auto`}>
      <div>
        <p className={`${titleSize} font-semibold text-foreground`}>
          {t("aiChat.onboarding.title")}
        </p>
        <p className={`${labelSize} text-muted-foreground mt-0.5`}>
          {t("aiChat.onboarding.subtitle")}
        </p>
      </div>

      <div>
        <p className={`${labelSize} font-medium text-muted-foreground mb-1.5 uppercase tracking-wide`}>
          {t("aiChat.onboarding.styleLabel")}
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {STYLE_IDS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setStyle(opt.id)}
              className={`rounded-lg border text-center transition ${btnSize} ${
                style === opt.id
                  ? "bg-primary/10 border-primary text-primary font-semibold"
                  : "bg-background border-border text-foreground hover:bg-muted"
              }`}
            >
              <div className="text-base leading-none mb-1">{opt.icon}</div>
              <div>{t(`aiChat.onboarding.styles.${opt.id}.label`)}</div>
              <div className="text-[10px] mt-0.5 opacity-70">
                {t(`aiChat.onboarding.styles.${opt.id}.hint`)}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className={`${labelSize} font-medium text-muted-foreground mb-1.5 uppercase tracking-wide`}>
          {t("aiChat.onboarding.levelLabel")}
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {LEVEL_IDS.map((id) => (
            <button
              key={id}
              onClick={() => setLevel(id)}
              className={`rounded-lg border text-left transition ${btnSize} ${
                level === id
                  ? "bg-primary/10 border-primary text-primary font-semibold"
                  : "bg-background border-border text-foreground hover:bg-muted"
              }`}
            >
              <div>{t(`aiChat.onboarding.levels.${id}.label`)}</div>
              <div className="text-[10px] mt-0.5 opacity-70">
                {t(`aiChat.onboarding.levels.${id}.hint`)}
              </div>
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full bg-gradient-ocean font-semibold"
        size={compact ? "sm" : "default"}
      >
        {saving ? t("aiChat.onboarding.saving") : t("aiChat.onboarding.submit")}
      </Button>
    </div>
  );
};

export default OnboardingPreferences;
