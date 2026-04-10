import { useState, useRef, useEffect, useCallback } from "react";
import captainAvatar from "@/assets/captain-avatar.png";
import { X, Send, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { getUserLocation } from "@/services/weatherService";
import { isPremium, hasAIQuestionsRemaining, AI_BASIC_LIMIT, getUserTier } from "@/lib/subscription";
import { useProfile, useIncrementAIQuestions } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";

interface AIChatWidgetProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface Message {
  role: string;
  content: string;
  isWelcome?: boolean;
}

// localStorage fallback for unauthenticated users
const AI_ANON_KEY = "ai_captain_anon_count";
const getAnonCount = (): number => parseInt(localStorage.getItem(AI_ANON_KEY) || "0", 10);
const incrementAnonCount = () => localStorage.setItem(AI_ANON_KEY, String(getAnonCount() + 1));


const AIChatWidget = ({ isOpen: externalIsOpen, onClose }: AIChatWidgetProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: profile } = useProfile();
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

      // ─── Build user profile context ────────────────────────────────────────
      const tier = getUserTier(profile);
      const userProfile = {
        tier,
        boatName: profile?.boat_name ?? undefined,
        boatLength: profile?.boat_length ?? undefined,
      };

      const isProviderContext = routerLocation.pathname.includes('provider');

      // ─── Call Edge Function (weather fetched server-side inside it) ─────────
      const { data, error } = await supabase.functions.invoke("ai-captain", {
        body: {
          messages: currentMessages,
          location,       // lat/lng sent so Edge Function can call Windy API
          userProfile,
          searchDates: null, // Edge Function uses today + 7 days as default range
          isProviderContext,
        },
      });

      if (error) throw error;

      const reply: string = data?.reply ?? "Nije moguće generirati odgovor. Pokušaj ponovo.";

      // Soft premium nudge for basic users (30% chance, not on first message)
      let finalReply = reply;
      if (!premium && currentMessages.filter(m => m.role === "user").length > 1 && Math.random() < 0.25) {
        finalReply += "\n\n💡 *Premium donosi neograničen AI Kapetan, offline mape i ekskluzivne popuste!*";
      }

      setMessages(prev => [...prev, { role: "assistant", content: finalReply }]);

    } catch (err) {
      console.error("AI Captain error:", err);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "⚓ AI Kapetan je privremeno nedostupan. Provjeri vezu i pokušaj ponovo."
      }]);
    }

    setIsLoading(false);
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
          {/* Speech bubble */}
          <div 
            className="absolute right-[calc(100%+16px)] top-1/2 -translate-y-1/2 w-max max-w-[200px] bg-white text-slate-800 text-sm font-semibold px-4 py-3 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.15)] pointer-events-none animate-bounce"
            style={{ zIndex: 9999 }}
          >
            Hi, I am AI Captain! Ask me anything!
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
            <button onClick={handleClose} className="text-primary-foreground/70 hover:text-primary-foreground">
              <X size={20} />
            </button>
          </div>
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
