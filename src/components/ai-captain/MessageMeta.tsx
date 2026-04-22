import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronRight, AlertTriangle, ExternalLink } from "lucide-react";
import type { Intent, SourceCitation } from "@/lib/aiCaptainPayload";

interface Props {
    intent?: Intent;
    confidence?: number;
    sources?: SourceCitation[];
}

const INTENT_EMOJI: Record<Intent, string> = {
    SEARCH_MOORING: "⚓",
    DIAGNOSE_ENGINE: "🛠️",
    CHECK_WEATHER: "🌬️",
    EMERGENCY: "🆘",
    BOOKING_HELP: "📝",
    NAVIGATION_ROUTE: "🧭",
    GENERAL_CHAT: "💬",
};

const SOURCE_EMOJI: Record<SourceCitation["type"], string> = {
    rpc: "🗄️",
    kb: "📚",
    windy: "🌦️",
    system: "⚙️",
};

const MessageMeta = ({ intent, confidence, sources }: Props) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const showIntent = intent && intent !== "GENERAL_CHAT";
    const showWarning = typeof confidence === "number" && confidence < 0.5;
    const showSources = sources && sources.length > 0;

    if (!showIntent && !showWarning && !showSources) return null;

    return (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
            {showIntent && (
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2 py-0.5 text-muted-foreground">
                    <span>{INTENT_EMOJI[intent!]}</span>
                    <span>{t(`aiChat.intent.${intent}`)}</span>
                </span>
            )}
            {showWarning && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/60 bg-amber-500/10 px-2 py-0.5 text-amber-700">
                    <AlertTriangle size={11} />
                    <span>{t("aiChat.lowConfidence")}</span>
                </span>
            )}
            {showSources && (
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2 py-0.5 text-muted-foreground hover:text-foreground"
                >
                    {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                    <span>{t("aiChat.sources")} · {sources!.length}</span>
                </button>
            )}
            {showSources && open && (
                <ul className="mt-1 w-full space-y-1 rounded-md border border-border bg-background/40 p-2">
                    {sources!.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5 leading-tight">
                            <span className="shrink-0">{SOURCE_EMOJI[s.type]}</span>
                            <div className="min-w-0">
                                {s.url ? (
                                    <a
                                        href={s.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-0.5 font-medium text-foreground hover:underline"
                                    >
                                        {s.title}
                                        <ExternalLink size={9} />
                                    </a>
                                ) : (
                                    <span className="font-medium text-foreground">{s.title}</span>
                                )}
                                {s.detail && (
                                    <span className="ml-1 text-muted-foreground">— {s.detail}</span>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MessageMeta;
