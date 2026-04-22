import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/authContext';
import { buildAiCaptainPayload, type MaydayPayload, type Intent, type SourceCitation, type WeatherData } from '../../lib/aiCaptainPayload';
import MaydayAlert from '../../components/MaydayAlert';
import MessageMeta from '../../components/MessageMeta';
import WeatherCard from '../../components/WeatherCard';
import FeedbackButtons from '../../components/FeedbackButtons';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mayday?: MaydayPayload | null;
  intent?: Intent;
  confidence?: number;
  sources?: SourceCitation[];
  weather?: WeatherData | null;
  qualityId?: string | null;
}

const MAYDAY_RE = /\b(mayday|sos|potapam|tonem|distress|tonemo|prepo+mo[cć]|u opasnosti|help us|sinking)\b/i;

export default function AICaptainScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: '⚓ Ahoy! I\'m your AI Captain — your personal Mediterranean sailing advisor.\n\nAsk me about:\n🌊 Weather & sea conditions\n⚓ Best moorings nearby\n🗺️ Route planning\n💡 Sailing tips & safety',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 1) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    const currentMessages = [...messages, userMsg];
    setMessages(currentMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Fetch user profile for tier/role checks
      let profileData: any = null;
      if (user) {
        const { data } = await supabase.from('profiles').select('role, subscription_tier, subscription_expires_at, ai_questions_used, boat_name, boat_length').eq('id', user.id).single();
        profileData = data;
      }

      const role = profileData?.role || 'user';
      const tier = profileData?.subscription_tier || 'basic';
      const isAdmin = role === 'admin';
      const isPremiumUser = isAdmin || tier === 'premium-monthly' || tier === 'premium-annual';
      const aiUsed = profileData?.ai_questions_used ?? 0;
      const AI_BASIC_LIMIT = 5;

      // Enforce limit for basic (non-admin, non-premium) users
      if (!isPremiumUser && aiUsed >= AI_BASIC_LIMIT) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⭐ You've used all ${AI_BASIC_LIMIT} free AI Captain questions.\n\nUpgrade to **Premium** for unlimited access, 7-day forecasts, storm alerts and much more! 🚢`,
        }]);
        setIsLoading(false);
        return;
      }

      // Increment counter for non-admin, non-premium users
      if (!isPremiumUser && user) {
        await supabase.from('profiles').update({ ai_questions_used: aiUsed + 1 }).eq('id', user.id);
      }

      // Fetch default vessel (FAZA 2) — ok if table empty, edge fn handles missing
      let vesselRow: any = null;
      if (user) {
        const { data: vessels } = await supabase
          .from('user_vessel_profiles')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(1);
        vesselRow = vessels?.[0] ?? null;
      }

      const payload = buildAiCaptainPayload({
        messages: currentMessages.map(m => ({ role: m.role, content: m.content })),
        location: { lat: 43.5, lng: 16.4 },
        profile: profileData,
        tier: (isAdmin ? 'premium-annual' : tier) as 'basic' | 'premium-monthly' | 'premium-annual',
        vessel: vesselRow,
        searchDates: null,
        isProviderContext: false,
      });

      const { data, error } = await supabase.functions.invoke('ai-captain', {
        body: payload,
      });

      if (error) throw error;

      // FAZA 6: edge function gates quota server-side. If blocked, surface paywall message.
      if (data?.paywall) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data?.reply ?? `⭐ You've used all ${AI_BASIC_LIMIT} free AI Captain questions.\n\nUpgrade to **Premium** for unlimited access. 🚢`,
        }]);
        setIsLoading(false);
        return;
      }

      const reply = data?.reply || '⚓ AI Captain is temporarily unavailable. Please try again.';
      const mayday: MaydayPayload | null = data?.mayday ?? null;
      const isMaydayTurn = MAYDAY_RE.test(userMsg.content);

      const replyIntent = data?.intent as Intent | undefined;
      const weather: WeatherData | null = data?.weather ?? null;

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        mayday: isMaydayTurn ? mayday : null,
        intent: replyIntent,
        confidence: typeof data?.confidence === 'number' ? data.confidence : undefined,
        sources: Array.isArray(data?.sources) ? (data.sources as SourceCitation[]) : undefined,
        weather: replyIntent === 'CHECK_WEATHER' ? weather : null,
        qualityId: typeof data?.qualityId === 'string' ? data.qualityId : null,
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚓ Connection error. Please check your internet and try again.',
      }]);
    }

    setIsLoading(false);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && (
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarEmoji}>🧑‍✈️</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
          <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAssistant]}>
            {item.content}
          </Text>
          {item.weather && <WeatherCard weather={item.weather} />}
          {item.mayday && <MaydayAlert mayday={item.mayday} />}
          {!isUser && (
            <MessageMeta intent={item.intent} confidence={item.confidence} sources={item.sources} />
          )}
          {!isUser && item.qualityId && <FeedbackButtons qualityId={item.qualityId} />}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isLoading ? (
            <View style={[styles.msgRow]}>
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarEmoji}>🧑‍✈️</Text>
              </View>
              <View style={[styles.bubble, styles.bubbleAssistant]}>
                <View style={styles.typingDots}>
                  <ActivityIndicator color={COLORS.primary} size="small" />
                  <Text style={styles.typingText}>Captain is thinking...</Text>
                </View>
              </View>
            </View>
          ) : null}
        />

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask the Captain anything..."
            placeholderTextColor={COLORS.textDim}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || isLoading) && { opacity: 0.4 }]}
            onPress={handleSend}
            disabled={!input.trim() || isLoading}
            activeOpacity={0.85}
          >
            <Ionicons name="send" size={18} color={COLORS.bg} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  chatList: { padding: SPACING.md, paddingBottom: SPACING.md },
  msgRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    marginBottom: SPACING.md, gap: SPACING.sm,
  },
  msgRowUser: { justifyContent: 'flex-end' },
  avatarWrap: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.primaryGlow,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarEmoji: { fontSize: 16 },
  bubble: {
    maxWidth: '78%', borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2,
  },
  bubbleUser: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: RADIUS.xs,
    ...SHADOWS.sm,
  },
  bubbleAssistant: {
    backgroundColor: COLORS.card,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    borderBottomLeftRadius: RADIUS.xs,
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextUser: { color: COLORS.bg, fontWeight: '500' },
  bubbleTextAssistant: { color: COLORS.textSecondary },
  typingDots: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typingText: { ...FONTS.caption, color: COLORS.textMuted },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    padding: SPACING.md, paddingBottom: Platform.OS === 'ios' ? SPACING.lg : SPACING.md,
    borderTopWidth: 1, borderTopColor: COLORS.cardBorder,
    backgroundColor: COLORS.bgSecondary,
    gap: SPACING.sm,
  },
  textInput: {
    flex: 1, backgroundColor: COLORS.card,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    color: COLORS.text, fontSize: 14, maxHeight: 100,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.glow(COLORS.primary),
  },
});
