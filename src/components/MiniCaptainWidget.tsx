import { useState, useRef, useEffect, useCallback } from "react";
import { Send, X, Crown, History, MessageSquarePlus, Settings } from "lucide-react";
import captainAvatar from "@/assets/captain-avatar.png";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { getUserLocation } from "@/services/weatherService";
import {
  isPremium,
  hasAIQuestionsRemaining,
  AI_BASIC_LIMIT,
  getUserTier,
} from "@/lib/subscription";
import { useProfile, useIncrementAIQuestions } from "@/hooks/useProfile";
import { useDefaultVessel } from "@/hooks/useVesselProfile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { buildAiCaptainPayload, type MaydayPayload, type Intent, type SourceCitation, type WeatherData, type AiCaptainPreferences } from "@/lib/aiCaptainPayload";
import { newConversationId, loadConversationMessages } from "@/lib/aiConversations";
import { fetchMyPreferences } from "@/lib/aiPreferences";
import MaydayAlert from "@/components/ai-captain/MaydayAlert";
import MessageMeta from "@/components/ai-captain/MessageMeta";
import WeatherCard from "@/components/ai-captain/WeatherCard";
import FeedbackButtons from "@/components/ai-captain/FeedbackButtons";
import ConversationHistoryPanel from "@/components/ai-captain/ConversationHistoryPanel";
import OnboardingPreferences from "@/components/ai-captain/OnboardingPreferences";
import { useNavigate } from "react-router-dom";

interface Message {
  role: string;
  content: string;
  mayday?: MaydayPayload | null;
  intent?: Intent;
  confidence?: number;
  sources?: SourceCitation[];
  weather?: WeatherData | null;
  qualityId?: string | null;
}

const MAYDAY_RE = /\b(mayday|sos|potapam|tonem|distress|tonemo|prepo+mo[cć]|u opasnosti|help us|sinking)\b/i;

const AI_ANON_KEY = "ai_captain_anon_count";
const getAnonCount = (): number =>
  parseInt(localStorage.getItem(AI_ANON_KEY) || "0", 10);
const incrementAnonCount = () =>
  localStorage.setItem(AI_ANON_KEY, String(getAnonCount() + 1));

/**
 * MiniCaptainWidget — Intercom-style chat launcher
 * Floating pill button at bottom-right. Click to open/close.
 */
const MiniCaptainWidget = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const defaultVessel = useDefaultVessel();
  const incrementAI = useIncrementAIQuestions();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: t("aiChat.welcome") },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [preferences, setPreferences] = useState<AiCaptainPreferences | null>(null);
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!user || !isOpen || prefsLoaded) return;
    setPrefsLoading(true);
    fetchMyPreferences().then((p) => {
      setPreferences(p);
      setPrefsLoaded(true);
      setPrefsLoading(false);
    });
  }, [user, isOpen, prefsLoaded]);

  const needsOnboarding = Boolean(user) && prefsLoaded && preferences === null;

  // Teaser bubble state
  const [showTeaser, setShowTeaser] = useState(false);
  const [teaserIndex, setTeaserIndex] = useState(0);
  const teaserMessages = [
    t("aiChat.teaser1", "👋 Bok! Pitaj me bilo što o moru..."),
    t("aiChat.teaser2", "⚓ Gdje ploviš danas? Mogu pomoći!"),
    t("aiChat.teaser3", "🌊 Ima li oluja na putu? Pitaj kapetana!"),
    t("aiChat.teaser4", "🧭 Trebаš vezište? Tu sam 24/7!"),
  ];
  const teaserTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const teaserCycleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastAssistantRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 100) + "px";
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (
      !isLoading &&
      messages.length > 0 &&
      messages[messages.length - 1].role === "assistant"
    ) {
      lastAssistantRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  // Show teaser bubble after 3s, cycle every 4s, hide when chat opens
  useEffect(() => {
    if (isOpen) {
      setShowTeaser(false);
      if (teaserTimerRef.current) clearTimeout(teaserTimerRef.current);
      if (teaserCycleRef.current) clearInterval(teaserCycleRef.current);
      return;
    }
    teaserTimerRef.current = setTimeout(() => {
      setShowTeaser(true);
      teaserCycleRef.current = setInterval(() => {
        setTeaserIndex((i) => (i + 1) % teaserMessages.length);
      }, 4000);
    }, 1000);
    return () => {
      if (teaserTimerRef.current) clearTimeout(teaserTimerRef.current);
      if (teaserCycleRef.current) clearInterval(teaserCycleRef.current);
    };
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsLoading(true);

    const premium = isPremium(profile);
    const hasRemaining = user
      ? hasAIQuestionsRemaining(profile)
      : getAnonCount() < AI_BASIC_LIMIT;

    if (!premium && !hasRemaining) {
      setShowPaywall(true);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⭐ Iskoristio si svih ${AI_BASIC_LIMIT} besplatnih pitanja AI Kapetana.\n\nNadogradi na **Premium** za neograničen pristup! 🚢`,
        },
      ]);
      setIsLoading(false);
      return;
    }

    if (user) {
      try { await incrementAI.mutateAsync(); } catch { /* continue */ }
    } else {
      incrementAnonCount();
    }

    try {
      let location: { lat: number; lng: number } = { lat: 43.5, lng: 16.4 };
      try { location = await getUserLocation(); } catch { /* fallback */ }

      const tier = getUserTier(profile);

      let activeConvId = conversationId;
      if (user && !activeConvId) {
        activeConvId = newConversationId();
        setConversationId(activeConvId);
      }

      const payload = buildAiCaptainPayload({
        messages: currentMessages as import("@/lib/aiCaptainPayload").ChatMessage[],
        location,
        profile,
        tier,
        vessel: defaultVessel,
        searchDates: null,
        conversationId: activeConvId ?? undefined,
        preferences: preferences ?? undefined,
      });

      const { data, error } = await supabase.functions.invoke("ai-captain", {
        body: payload,
      });

      if (error) throw error;

      // FAZA 6: server-side paywall
      if (data?.paywall) {
        setShowPaywall(true);
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: data?.reply ?? `⭐ Iskoristio si svih ${AI_BASIC_LIMIT} besplatnih pitanja AI Kapetana.`,
        }]);
        setIsLoading(false);
        return;
      }

      const reply: string = data?.reply ?? "Nije moguće generirati odgovor. Pokušaj ponovo.";
      const mayday: MaydayPayload | null = data?.mayday ?? null;
      const isMaydayTurn = MAYDAY_RE.test(userMessage.content);
      let finalReply = reply;
      if (!premium && currentMessages.filter((m) => m.role === "user").length > 1 && Math.random() < 0.25) {
        finalReply += "\n\n💡 *Premium donosi neograničen AI Kapetan, offline mape i ekskluzivne popuste!*";
      }

      const replyIntent = data?.intent as Intent | undefined;
      const weather: WeatherData | null = data?.weather ?? null;

      if (typeof data?.conversationId === "string" && data.conversationId !== conversationId) {
        setConversationId(data.conversationId);
      }

      setMessages((prev) => [...prev, {
        role: "assistant",
        content: finalReply,
        mayday: isMaydayTurn ? mayday : null,
        intent: replyIntent,
        confidence: typeof data?.confidence === "number" ? data.confidence : undefined,
        sources: Array.isArray(data?.sources) ? data.sources as SourceCitation[] : undefined,
        weather: replyIntent === "CHECK_WEATHER" ? weather : null,
        qualityId: typeof data?.qualityId === "string" ? data.qualityId : null,
      }]);
    } catch (err) {
      console.error("AI Captain error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚓ AI Kapetan je privremeno nedostupan. Provjeri vezu i pokušaj ponovo." },
      ]);
    }

    setIsLoading(false);
  };

  const handleNewChat = () => {
    setConversationId(null);
    setMessages([{ role: "assistant", content: t("aiChat.welcome") }]);
    setShowHistory(false);
    setShowPaywall(false);
  };

  const handleSelectConversation = async (id: string) => {
    const rows = await loadConversationMessages(id);
    if (rows.length === 0) {
      handleNewChat();
      return;
    }
    const loaded: Message[] = rows.map((r) => ({
      role: r.role,
      content: r.content,
      intent: r.intent ?? undefined,
      confidence: typeof r.confidence === "number" ? r.confidence : undefined,
      sources: r.metadata?.sources,
      weather: r.metadata?.weather ?? null,
      mayday: r.metadata?.mayday ?? null,
      qualityId: r.metadata?.qualityId ?? null,
    }));
    setMessages(loaded);
    setConversationId(id);
    setShowHistory(false);
    setShowPaywall(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* ── Chat panel (slides up when open) ── */}
      <div
        className={`
          relative w-80 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden
          transition-all duration-300 origin-bottom-right
          ${isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"}
        `}
        style={{ maxWidth: "calc(100vw - 3rem)" }}
      >
        {/* Header */}
        <div className="bg-gradient-ocean px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-gold/60 shrink-0">
              <img src={captainAvatar} alt="AI Captain" className="w-full h-full object-cover object-top" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary-foreground leading-tight">
                {t("aiChat.title", "AI Captain")}
              </p>
              <p className="text-[10px] text-primary-foreground/65 leading-tight">
                {t("aiChat.subtitle", "Your personal nautical assistant")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {user && (
              <>
                <button
                  onClick={handleNewChat}
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors p-1"
                  aria-label="Novi razgovor"
                  title="Novi razgovor"
                >
                  <MessageSquarePlus size={16} />
                </button>
                <button
                  onClick={() => setShowHistory(true)}
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors p-1"
                  aria-label="Istorija"
                  title="Istorija"
                >
                  <History size={16} />
                </button>
                {preferences && (
                  <button
                    onClick={() => setShowSettings((v) => !v)}
                    className={`transition-colors p-1 ${showSettings ? "text-gold" : "text-primary-foreground/70 hover:text-primary-foreground"}`}
                    aria-label={t("aiChat.onboarding.settingsTitle", "Postavke AI Kapetana")}
                    title={t("aiChat.onboarding.settingsTitle", "Postavke AI Kapetana")}
                  >
                    <Settings size={16} />
                  </button>
                )}
              </>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground/70 hover:text-primary-foreground transition-colors p-1"
              aria-label="Zatvori"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {user && (
          <ConversationHistoryPanel
            isOpen={showHistory}
            onClose={() => setShowHistory(false)}
            onSelect={handleSelectConversation}
            onNew={handleNewChat}
            activeConversationId={conversationId}
          />
        )}

        {/* Onboarding gate */}
        {needsOnboarding ? (
          <div className="h-64 overflow-y-auto bg-background/50">
            <OnboardingPreferences onDone={(p) => setPreferences(p)} compact />
          </div>
        ) : prefsLoading && !prefsLoaded ? (
          <div className="h-64 flex items-center justify-center bg-background/50">
            <p className="text-xs text-muted-foreground">{t("aiChat.loading")}</p>
          </div>
        ) : showSettings ? (
          <div className="h-64 overflow-y-auto bg-background/50">
            <OnboardingPreferences
              mode="settings"
              initial={preferences}
              compact
              onDone={(p) => { setPreferences(p); setShowSettings(false); }}
              onCancel={() => setShowSettings(false)}
            />
          </div>
        ) : (
        <>
        {/* Messages */}
        <div className="h-64 overflow-y-auto p-3 space-y-3 bg-background/50">
          {messages.map((msg, i) => {
            const isLastAssistant =
              msg.role === "assistant" &&
              i === messages.map((m) => m.role).lastIndexOf("assistant");
            return (
              <div
                key={i}
                ref={isLastAssistant ? lastAssistantRef : undefined}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${msg.role === "user"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-foreground"
                    }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                  {msg.weather && <WeatherCard weather={msg.weather} />}
                  {msg.mayday && <MaydayAlert mayday={msg.mayday} />}
                  {msg.role === "assistant" && (
                    <MessageMeta intent={msg.intent} confidence={msg.confidence} sources={msg.sources} />
                  )}
                  {msg.role === "assistant" && msg.qualityId && (
                    <FeedbackButtons qualityId={msg.qualityId} />
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-xl px-3 py-2">
                <p className="text-xs text-muted-foreground animate-pulse">
                  {t("aiChat.thinking", "Razmišljam…")}
                </p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input / Paywall */}
        {showPaywall ? (
          <div className="p-3 border-t border-border">
            <div className="bg-gradient-to-r from-gold/10 to-ocean/10 border border-gold/30 rounded-xl p-3 text-center">
              <Crown className="text-gold mx-auto mb-1.5" size={22} />
              <p className="text-xs font-semibold text-foreground mb-1">AI Kapetan Premium</p>
              <p className="text-[11px] text-muted-foreground mb-2">
                Iskoristio si {AI_BASIC_LIMIT} besplatnih pitanja.
              </p>
              <Button
                onClick={() => { setIsOpen(false); navigate("/user-pricing"); }}
                className="w-full bg-gradient-ocean font-semibold text-xs h-8"
              >
                ⭐ Nadogradi na Premium
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-2.5 border-t border-border flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => { setInput(e.target.value); autoResize(); }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={t("aiChat.placeholder", "Pitaj AI Kapetana…")}
              disabled={isLoading}
              className="flex-1 resize-none rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:opacity-50 overflow-hidden leading-5"
              style={{ minHeight: "32px", maxHeight: "100px" }}
            />
            <Button
              onClick={handleSend}
              size="icon"
              className="bg-gradient-ocean shrink-0 h-8 w-8"
              disabled={isLoading}
            >
              <Send size={14} />
            </Button>
          </div>
        )}
        </>
        )}
      </div>

      {/* ── Teaser speech bubble ── */}
      {showTeaser && !isOpen && (
        <div
          className="relative max-w-[220px] animate-[fadeSlideUp_0.4s_ease-out]"
          style={{
            animation: "fadeSlideUp 0.4s ease-out",
          }}
        >
          <style>{`
            @keyframes fadeSlideUp {
              from { opacity: 0; transform: translateY(10px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          {/* Bubble */}
          <div className="bg-card border border-border rounded-2xl rounded-br-sm px-4 py-2.5 shadow-lg relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowTeaser(false); }}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground text-[10px] leading-none"
              aria-label="Zatvori"
            >
              ×
            </button>
            <p className="text-xs text-foreground font-medium leading-relaxed">
              {teaserMessages[teaserIndex]}
            </p>
          </div>
          {/* Triangle tail pointing down-right */}
          <div
            className="absolute bottom-0 right-4 w-0 h-0"
            style={{
              borderLeft: "8px solid transparent",
              borderTop: "8px solid hsl(var(--border))",
              transform: "translateY(100%)",
            }}
          />
        </div>
      )}

      {/* ── Launcher pill button ── */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="relative flex items-center gap-2.5 px-5 py-3 rounded-full bg-gradient-ocean text-primary-foreground shadow-hover hover:scale-105 active:scale-95 transition-transform"
          aria-label={t('nav.aiAssistant')}
        >
          {/* Animated ring when closed */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full animate-ping bg-primary/30 pointer-events-none" />
          )}
          {isOpen ? (
            <X size={18} />
          ) : (
            <span className="w-8 h-8 rounded-full overflow-hidden border-2 border-gold shrink-0">
              <img src={captainAvatar} alt="AI Captain" className="w-full h-full object-cover object-top" />
            </span>
          )}
          <span className="text-sm font-semibold">{t('nav.aiAssistant')}</span>
          {/* Pulse dot when closed */}
          {!isOpen && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold" />
            </span>
          )}
        </button>

        {/* Badge is OUTSIDE the button — never clipped */}
        {!isOpen && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            left: '-4px',
            width: '20px',
            height: '20px',
            background: '#ef4444',
            borderRadius: '50%',
            border: '2.5px solid white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: '800',
            color: 'white',
            lineHeight: 1,
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            zIndex: 9999,
            pointerEvents: 'none',
          }}>1</span>
        )}
      </div>

    </div>

  );
};

export default MiniCaptainWidget;
