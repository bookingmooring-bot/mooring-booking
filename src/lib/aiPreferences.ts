import { supabase } from "@/lib/supabase";
import type { AnswerStyle, ExperienceLevel, AiCaptainPreferences } from "@/lib/aiCaptainPayload";

export async function fetchMyPreferences(): Promise<AiCaptainPreferences | null> {
    const { data, error } = await supabase.rpc("get_my_ai_preferences");
    if (error) {
        console.error("fetchMyPreferences error:", error);
        return null;
    }
    const row = Array.isArray(data) ? data[0] : null;
    if (!row || !row.answer_style || !row.experience_level) return null;
    return {
        answerStyle: row.answer_style as AnswerStyle,
        experienceLevel: row.experience_level as ExperienceLevel,
    };
}

export async function saveMyPreferences(prefs: AiCaptainPreferences): Promise<boolean> {
    const { error } = await supabase.rpc("upsert_my_ai_preferences", {
        p_answer_style: prefs.answerStyle,
        p_experience_level: prefs.experienceLevel,
    });
    if (error) {
        console.error("saveMyPreferences error:", error);
        return false;
    }
    return true;
}
