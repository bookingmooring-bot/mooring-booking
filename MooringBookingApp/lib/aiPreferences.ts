// Mobile mirror of web src/lib/aiPreferences.ts.

import { supabase } from './supabase';
import type { AnswerStyle, ExperienceLevel, AiCaptainPreferences } from './aiCaptainPayload';

export async function fetchMyPreferences(): Promise<AiCaptainPreferences | null> {
    const { data, error } = await supabase.rpc('get_my_ai_preferences');
    if (error) {
        console.warn('fetchMyPreferences error:', error.message);
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
    const { error } = await supabase.rpc('upsert_my_ai_preferences', {
        p_answer_style: prefs.answerStyle,
        p_experience_level: prefs.experienceLevel,
    });
    if (error) {
        console.warn('saveMyPreferences error:', error.message);
        return false;
    }
    return true;
}
