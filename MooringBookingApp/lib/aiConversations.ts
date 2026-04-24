// Mobile mirror of web src/lib/aiConversations.ts.
// Keep in sync: identical RPC calls, identical shapes.

import { supabase } from './supabase';
import type { MaydayPayload, Intent, SourceCitation, WeatherData } from './aiCaptainPayload';

export interface ConversationSummary {
    id: string;
    title: string | null;
    last_message_at: string;
    message_count: number;
    created_at: string;
}

export interface StoredMessage {
    id: string;
    role: 'user' | 'assistant';
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
    const { data, error } = await supabase.rpc('list_conversations', { p_limit: limit });
    if (error) {
        console.warn('listConversations error:', error.message);
        return [];
    }
    return (data ?? []) as ConversationSummary[];
}

export async function loadConversationMessages(conversationId: string): Promise<StoredMessage[]> {
    const { data, error } = await supabase.rpc('get_conversation_messages', {
        p_conversation_id: conversationId,
    });
    if (error) {
        console.warn('loadConversationMessages error:', error.message);
        return [];
    }
    return (data ?? []) as StoredMessage[];
}

export async function deleteConversation(conversationId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('delete_conversation', {
        p_conversation_id: conversationId,
    });
    if (error) {
        console.warn('deleteConversation error:', error.message);
        return false;
    }
    return data === true;
}

// React Native ships crypto.randomUUID on Hermes; fall back otherwise.
export function newConversationId(): string {
    const g = globalThis as { crypto?: { randomUUID?: () => string } };
    if (g.crypto && typeof g.crypto.randomUUID === 'function') {
        return g.crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
