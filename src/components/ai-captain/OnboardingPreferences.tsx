import { useState } from "react";
import { Button } from "@/components/ui/button";
import { saveMyPreferences } from "@/lib/aiPreferences";
import type { AnswerStyle, ExperienceLevel, AiCaptainPreferences } from "@/lib/aiCaptainPayload";

interface Props {
  onDone: (prefs: AiCaptainPreferences) => void;
  compact?: boolean;
}

const STYLE_OPTIONS: { id: AnswerStyle; label: string; hint: string; icon: string }[] = [
  { id: "bullets", label: "Bullet points", hint: "Kratko i jasno", icon: "•" },
  { id: "balanced", label: "Balansirano", hint: "Srednja dužina", icon: "≈" },
  { id: "detailed", label: "Detaljno", hint: "Opširni odgovori", icon: "¶" },
];

const LEVEL_OPTIONS: { id: ExperienceLevel; label: string; hint: string }[] = [
  { id: "beginner", label: "Početnik", hint: "Tek krećem s plovidbom" },
  { id: "intermediate", label: "Srednji nivo", hint: "Plovim povremeno" },
  { id: "advanced", label: "Iskusan", hint: "Redovito plovim" },
  { id: "professional", label: "Profesionalni kapetan", hint: "Certificirani kapetan" },
];

const OnboardingPreferences = ({ onDone, compact = false }: Props) => {
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
        <p className={`${titleSize} font-semibold text-foreground`}>Prije prve poruke</p>
        <p className={`${labelSize} text-muted-foreground mt-0.5`}>
          Podesi AI Kapetana. Pamti se samo jednom.
        </p>
      </div>

      <div>
        <p className={`${labelSize} font-medium text-muted-foreground mb-1.5 uppercase tracking-wide`}>
          Stil odgovora
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {STYLE_OPTIONS.map((opt) => (
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
              <div>{opt.label}</div>
              <div className={`text-[10px] mt-0.5 opacity-70`}>{opt.hint}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className={`${labelSize} font-medium text-muted-foreground mb-1.5 uppercase tracking-wide`}>
          Nivo iskustva
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {LEVEL_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setLevel(opt.id)}
              className={`rounded-lg border text-left transition ${btnSize} ${
                level === opt.id
                  ? "bg-primary/10 border-primary text-primary font-semibold"
                  : "bg-background border-border text-foreground hover:bg-muted"
              }`}
            >
              <div>{opt.label}</div>
              <div className="text-[10px] mt-0.5 opacity-70">{opt.hint}</div>
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
        {saving ? "Spremam…" : "Počni razgovor →"}
      </Button>
    </div>
  );
};

export default OnboardingPreferences;
