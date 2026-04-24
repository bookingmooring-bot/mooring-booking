// Thin wrapper around Supabase RPCs for AI Captain conversation history.
// Both AIChatWidget and MiniCaptainWidget import from here so history
// behaviour stays identical across the two web clients.

import { supabase } from "@/lib/supabase";
import type { MaydayPayload, Intent, SourceCitation, WeatherData } from "@/lib/aiCaptainPayload";

export interface ConversationSummary {
    id: string;
    title: string | null;
    last_message_at: string;
    message_count: number;
    created_at: string;
}

export interface StoredMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    intent: Intent | null;
    confidence: number | null;
    metadata: {
        sources?: SourceCitation[];
        weather?: WeatherData | null;
        mayday?: MaydayPayload | null;
        flags?: string[];
        qualityId?: string | null;
    } | null;
    created_at: string;
}

export async function listConversations(limit = 30): Promise<ConversationSummary[]> {
    const { data, error } = await supabase.rpc("list_conversations", { p_limit: limit });
    if (error) {
        console.error("listConversations error:", error);
        return [];
    }
    return (data ?? []) as ConversationSummary[];
}

export async function loadConversationMessages(conversationId: string): Promise<StoredMessage[]> {
    const { data, error } = await supabase.rpc("get_conversation_messages", {
        p_conversation_id: conversationId,
    });
    if (error) {
        console.error("loadConversationMessages error:", error);
        return [];
    }
    return (data ?? []) as StoredMessage[];
}

export async function deleteConversation(conversationId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc("delete_conversation", {
        p_conversation_id: conversationId,
    });
    if (error) {
        console.error("deleteConversation error:", error);
        return false;
    }
    return data === true;
}

// Client-side UUID v4 generator. Browsers ship crypto.randomUUID; falls back
// to a manual polyfill for ancient Safari. We never pass the resulting id to
// the edge fn under an anonymous session — the server ignores it there anyway.
export function newConversationId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
