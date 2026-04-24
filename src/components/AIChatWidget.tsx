import { useState, useRef, useEffect, useCallback } from "react";
import captainAvatar from "@/assets/captain-avatar.png";
import { X, Send, Crown, History, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { getUserLocation } from "@/services/weatherService";
import { isPremium, hasAIQuestionsRemaining, AI_BASIC_LIMIT, getUserTier } from "@/lib/subscription";
import { useProfile, useIncrementAIQuestions } from "@/hooks/useProfile";
import { useDefaultVessel } from "@/hooks/useVesselProfile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { buildAiCaptainPayload, type MaydayPayload, type Intent, type SourceCitation, type WeatherData } from "@/lib/aiCaptainPayload";
import { newConversationId, loadConversationMessages } from "@/lib/aiConversations";
import MaydayAlert from "@/components/ai-captain/MaydayAlert";
import MessageMeta from "@/components/ai-captain/MessageMeta";
import WeatherCard from "@/components/ai-captain/WeatherCard";
import FeedbackButtons from "@/components/ai-captain/FeedbackButtons";
import ConversationHistoryPanel from "@/components/ai-captain/ConversationHistoryPanel";
import { useNavigate, useLocation } from "react-router-dom";

interface AIChatWidgetProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface Message {
  role: string;
  content: string;
  isWelcome?: boolean;
  mayday?: MaydayPayload | null;
  intent?: Intent;
  confidence?: number;
  sources?: SourceCitation[];
  weather?: WeatherData | null;
  qualityId?: string | null;
}

// A message is treated as a MAYDAY turn only when the user's message looks like
// a distress call. We avoid rendering the red phone card on every assistant
// reply (the edge fn always returns mayday for geolocation-aware prompts).
const MAYDAY_RE = /\b(mayday|sos|potapam|tonem|distress|tonemo|prepo+mo[cć]|u opasnosti|help us|sinking)\b/i;

// localStorage fallback for unauthenticated users
const AI_ANON_KEY = "ai_captain_anon_count";
const getAnonCount = (): number => parseInt(localStorage.getItem(AI_ANON_KEY) || "0", 10);
const incrementAnonCount = () => localStorage.setItem(AI_ANON_KEY, String(getAnonCount() + 1));


const AIChatWidget = ({ isOpen: externalIsOpen, onClose }: AIChatWidgetProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const defaultVessel = useDefaultVessel();
  const incrementAI = useIncrementAIQuestions();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const [showPaywall, setShowPaywall] = useState(false);

  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleClose = () => { if (onClose) onClose(); else setInternalIsOpen(false); };
  const handleOpen = () => { if (onClose) return; setInternalIsOpen(true); };

  // Listen for the global 'open-ai-captain' event fired by the Header nav button
  useEffect(() => {
    const handler = () => setInternalIsOpen(true);
    window.addEventListener('open-ai-captain', handler);
    return () => window.removeEventListener('open-ai-captain', handler);
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: t("aiChat.welcome"), isWelcome: true }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastAssistantRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as user types
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, []);

  // Scroll: new assistant message → scroll to its TOP so user reads from beginning
  // Loading spinner / user message → scroll to bottom so user sees the spinner
  useEffect(() => {
    if (!isLoading && messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      lastAssistantRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput("");
    // Reset textarea height
    if (textareaRef.current) { textareaRef.current.style.height = 'auto'; }
    setIsLoading(true);

    // ─── Tier checks ───────────────────────────────────────────────────────────
    const premium = isPremium(profile);
    const hasRemaining = user
      ? hasAIQuestionsRemaining(profile)
      : getAnonCount() < AI_BASIC_LIMIT;

    if (!premium && !hasRemaining) {
      setShowPaywall(true);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `⭐ Iskoristio si svih ${AI_BASIC_LIMIT} besplatnih pitanja AI Kapetana.\n\nNadogradi na **Premium** za neograničen pristup, 7-dnevne prognoze, upozorenja na oluje i još mnogo toga! 🚢`
      }]);
      setIsLoading(false);
      return;
    }

    // Increment counter — Supabase for authenticated, localStorage for anon
    if (user) {
      try { await incrementAI.mutateAsync(); } catch { /* continue anyway */ }
    } else {
      incrementAnonCount();
    }

    try {
      // ─── Always get GPS location so Edge Function always has weather data ──
      // Fallback: Split, Croatia (Adriatic default)
      let location: { lat: number; lng: number } = { lat: 43.5, lng: 16.4 };
      try {
        location = await getUserLocation();
      } catch {
        // Use fallback coordinates
      }

      // ─── Build payload (shared util — keeps 3 clients in sync) ─────────────
      const tier = getUserTier(profile);
      const isProviderContext = routerLocation.pathname.includes('provider');

      // Mint conversation id on the first message of a session (logged-in only).
      // Anonymous users get no id — server keeps their chat ephemeral.
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
        isProviderContext,
        conversationId: activeConvId ?? undefined,
      });

      // ─── Call Edge Function (weather fetched server-side inside it) ─────────
      const { data, error } = await supabase.functions.invoke("ai-captain", {
        body: payload,
      });

      if (error) throw error;

      // FAZA 6: edge function is now the source of truth for quota enforcement.
      // If it returns paywall=true, surface the paywall and don't render a normal message.
      if (data?.paywall) {
        setShowPaywall(true);
        setMessages(prev => [...prev, {
          role: "assistant",
          content: data?.reply ?? `⭐ Iskoristio si svih ${AI_BASIC_LIMIT} besplatnih pitanja AI Kapetana. Nadogradi na Premium.`,
        }]);
        setIsLoading(false);
        return;
      }

      const reply: string = data?.reply ?? "Nije moguće generirati odgovor. Pokušaj ponovo.";
      const mayday: MaydayPayload | null = data?.mayday ?? null;
      const isMaydayTurn = MAYDAY_RE.test(userMessage.content);

      // Soft premium nudge for basic users (30% chance, not on first message)
      let finalReply = reply;
      if (!premium && currentMessages.filter(m => m.role === "user").length > 1 && Math.random() < 0.25) {
        finalReply += "\n\n💡 *Premium donosi neograničen AI Kapetan, offline mape i ekskluzivne popuste!*";
      }

      const replyIntent = data?.intent as Intent | undefined;
      const weather: WeatherData | null = data?.weather ?? null;

      // Server is the source of truth for conversationId (it may refuse the
      // client-supplied one and mint a fresh one).
      if (typeof data?.conversationId === "string" && data.conversationId !== conversationId) {
        setConversationId(data.conversationId);
      }

      setMessages(prev => [...prev, {
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
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "⚓ AI Kapetan je privremeno nedostupan. Provjeri vezu i pokušaj ponovo."
      }]);
    }

    setIsLoading(false);
  };

  const handleNewChat = () => {
    setConversationId(null);
    setMessages([{ role: "assistant", content: t("aiChat.welcome"), isWelcome: true }]);
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
    <>
      {!onClose && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 50, display: isOpen ? 'none' : 'inline-block' }}>
          <button onClick={handleOpen}
            className="w-16 h-16 rounded-full shadow-hover overflow-hidden border-2 border-gold transition-transform hover:scale-110"
            aria-label="Open AI Captain">
            <img src={captainAvatar} alt="AI Captain" className="w-full h-full object-cover object-top" />
          </button>
          {/* Red Notification Badge */}
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '22px',
            height: '22px',
            background: '#ef4444',
            borderRadius: '50%',
            border: '2.5px solid white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '800',
            color: 'white',
            lineHeight: 1,
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
            zIndex: 9999,
            pointerEvents: 'none',
          }}>1</span>

          {/* Speech bubble / CTA PopUp */}
          <div
            className="absolute right-[calc(100%+16px)] top-[30%] -translate-y-1/2 w-max max-w-[220px] bg-white text-slate-800 text-sm px-4 py-3 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.15)] animate-bounce cursor-pointer group"
            style={{ zIndex: 9998 }}
            onClick={handleOpen}
          >
            <span className="font-semibold block mb-1">I am AI Captain!</span>
            <span className="text-[#053d5a] font-bold group-hover:underline">Ask me anything about nautics</span>
            {/* Speech bubble tail pointing towards the avatar */}
            <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-white rotate-45" style={{ zIndex: -1 }} />
          </div>
        </div>
      )}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-card rounded-2xl shadow-hover border border-border overflow-hidden animate-fade-in">
          <div className="bg-gradient-ocean p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gold/60 shrink-0">
                <img src={captainAvatar} alt="AI Captain" className="w-full h-full object-cover object-top" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-primary-foreground">{t("aiChat.title")}</h3>
                <p className="text-xs text-primary-foreground/70">{t("aiChat.subtitle")}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {user && (
                <>
                  <button
                    onClick={handleNewChat}
                    className="text-primary-foreground/70 hover:text-primary-foreground p-1"
                    title="Novi razgovor"
                    aria-label="Novi razgovor"
                  >
                    <MessageSquarePlus size={18} />
                  </button>
                  <button
                    onClick={() => setShowHistory(true)}
                    className="text-primary-foreground/70 hover:text-primary-foreground p-1"
                    title="Istorija razgovora"
                    aria-label="Istorija razgovora"
                  >
                    <History size={18} />
                  </button>
                </>
              )}
              <button onClick={handleClose} className="text-primary-foreground/70 hover:text-primary-foreground p-1">
                <X size={20} />
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
          <div className="h-80 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => {
              const isLastAssistant =
                msg.role === 'assistant' &&
                i === messages.map(m => m.role).lastIndexOf('assistant');
              return (
                <div
                  key={i}
                  ref={isLastAssistant ? lastAssistantRef : undefined}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-xl px-4 py-2 ${msg.role === 'user' ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-foreground'}`}>
                    <p className="text-sm whitespace-pre-line">{msg.content}</p>
                    {msg.weather && <WeatherCard weather={msg.weather} />}
                    {msg.mayday && <MaydayAlert mayday={msg.mayday} />}
                    {msg.role === 'assistant' && !msg.isWelcome && (
                      <MessageMeta intent={msg.intent} confidence={msg.confidence} sources={msg.sources} />
                    )}
                    {msg.role === 'assistant' && !msg.isWelcome && msg.qualityId && (
                      <FeedbackButtons qualityId={msg.qualityId} />
                    )}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-xl px-4 py-2">
                  <p className="text-sm text-muted-foreground">{t("aiChat.thinking")}</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* Input area / Paywall */}
          {showPaywall ? (
            <div className="p-4 border-t border-border">
              <div className="bg-gradient-to-r from-gold/10 to-secondary/10 border border-gold/30 rounded-xl p-4 text-center">
                <Crown className="text-gold mx-auto mb-2" size={28} />
                <p className="text-sm font-semibold text-foreground mb-1">AI Kapetan Premium</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Iskoristio si {AI_BASIC_LIMIT} besplatnih pitanja. Nadogradi za neograničen pristup!
                </p>
                <Button
                  onClick={() => { handleClose(); navigate('/user-pricing'); }}
                  className="w-full bg-gradient-ocean font-semibold text-sm h-9"
                >
                  ⭐ Nadogradi na Premium
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 border-t border-border flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => { setInput(e.target.value); autoResize(); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={t("aiChat.placeholder")}
                disabled={isLoading}
                className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden leading-5"
                style={{ minHeight: '36px', maxHeight: '120px' }}
              />
              <Button onClick={handleSend} size="icon" className="bg-gradient-ocean shrink-0" disabled={isLoading}>
                <Send size={18} />
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
