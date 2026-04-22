import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";

interface Props {
    qualityId: string;
}

const FeedbackButtons = ({ qualityId }: Props) => {
    const { t } = useTranslation();
    const [rating, setRating] = useState<1 | -1 | null>(null);
    const [sending, setSending] = useState(false);

    const send = async (value: 1 | -1) => {
        if (sending || rating !== null) return;
        setSending(true);
        setRating(value);
        const { error } = await supabase.rpc("rate_ai_response", { p_quality_id: qualityId, p_rating: value });
        setSending(false);
        if (error) {
            setRating(null);
        }
    };

    if (rating !== null) {
        return (
            <div className="mt-1.5 text-[10px] text-muted-foreground">
                {t("aiChat.feedbackThanks", "Hvala na povratnoj informaciji!")}
            </div>
        );
    }

    return (
        <div className="mt-1.5 flex items-center gap-1.5 text-muted-foreground">
            <button
                type="button"
                onClick={() => send(1)}
                disabled={sending}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border transition-colors hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-50"
                aria-label={t("aiChat.feedbackUp", "Koristan odgovor")}
            >
                <ThumbsUp size={11} />
            </button>
            <button
                type="button"
                onClick={() => send(-1)}
                disabled={sending}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border transition-colors hover:border-rose-500 hover:text-rose-600 disabled:opacity-50"
                aria-label={t("aiChat.feedbackDown", "Nekoristan odgovor")}
            >
                <ThumbsDown size={11} />
            </button>
        </div>
    );
};

export default FeedbackButtons;
