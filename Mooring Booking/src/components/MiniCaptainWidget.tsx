import { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { Send, X, Crown, MessageCircle } from "lucide-react";
import captainAvatar from "@/assets/captain-avatar.png";
const captainGif = new URL("../assets/Wink_and_that_is_it_0e0d6b681f-ezgif.com-video-to-gif-converter.gif", import.meta.url).href;
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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface Message {
  role: string;
  content: string;
}

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
  const incrementAI = useIncrementAIQuestions();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [showGifPreview, setShowGifPreview] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: t("aiChat.welcome") },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      const userProfile = {
        tier,
        boatName: profile?.boat_name ?? undefined,
        boatLength: profile?.boat_length ?? undefined,
      };

      const { data, error } = await supabase.functions.invoke("ai-captain", {
        body: { messages: currentMessages, location, userProfile, searchDates: null },
      });

      if (error) throw error;

      const reply: string = data?.reply ?? "Nije moguće generirati odgovor. Pokušaj ponovo.";
      let finalReply = reply;
      if (!premium && currentMessages.filter((m) => m.role === "user").length > 1 && Math.random() < 0.25) {
        finalReply += "\n\n💡 *Premium donosi neograničen AI Kapetan, offline mape i ekskluzivne popuste!*";
      }

      setMessages((prev) => [...prev, { role: "assistant", content: finalReply }]);
    } catch (err) {
      console.error("AI Captain error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚓ AI Kapetan je privremeno nedostupan. Provjeri vezu i pokušaj ponovo." },
      ]);
    }

    setIsLoading(false);
  };

  return (
    <>
    {/* ── GIF Preview Overlay — rendered via Portal directly into body ── */}
    {showGifPreview && ReactDOM.createPortal(
      <div
        onClick={() => setShowGifPreview(false)}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 999999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.82)",
          backdropFilter: "blur(6px)",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}
        >
          {/* Close button */}
          <button
            onClick={() => setShowGifPreview(false)}
            style={{
              position: "absolute",
              top: "-16px",
              right: "-16px",
              zIndex: 1,
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(0,0,0,0.7)",
              border: "1.5px solid rgba(255,255,255,0.3)",
              color: "#fff",
              fontSize: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              lineHeight: 1,
            }}
            aria-label="Zatvori"
          >
            ✕
          </button>

          {/* Large GIF */}
          <img
            src={captainGif}
            alt="AI Captain"
            style={{
              maxHeight: "70vh",
              maxWidth: "90vw",
              borderRadius: "16px",
              boxShadow: "0 20px 80px rgba(0,0,0,0.8)",
              border: "2px solid rgba(234,179,8,0.4)",
              objectFit: "contain",
            }}
          />

          {/* Start Chat button */}
          <button
            onClick={() => { setShowGifPreview(false); setIsOpen(true); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 28px",
              borderRadius: "999px",
              background: "linear-gradient(135deg, #0c4a6e, #0284c7)",
              border: "none",
              color: "#fff",
              fontWeight: "700",
              fontSize: "15px",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(2,132,199,0.5)",
            }}
          >
            💬 {t("aiChat.title", "AI Captain")} – Razgovaraj!
          </button>
        </div>
      </div>,
      document.body
    )}

    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* ── Chat panel (slides up when open) ── */}
      <div
        className={`
          w-80 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden
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
            <button
              onClick={() => setShowGifPreview(true)}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-gold/60 shrink-0 cursor-pointer hover:ring-2 hover:ring-gold/80 transition-all"
              aria-label="Pogledaj AI Captain"
              title="Klikni za prikaz"
            >
              <img src={captainAvatar} alt="AI Captain" className="w-full h-full object-cover object-top" />
            </button>
            <div>
              <p className="text-sm font-semibold text-primary-foreground leading-tight">
                {t("aiChat.title", "AI Captain")}
              </p>
              <p className="text-[10px] text-primary-foreground/65 leading-tight">
                {t("aiChat.subtitle", "Your personal nautical assistant")}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
            aria-label="Zatvori"
          >
            <X size={18} />
          </button>
        </div>

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
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
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
      </div>

      {/* ── Launcher pill button ── */}
      <button
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
          } else {
            setShowGifPreview(true);
          }
        }}
        className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-gradient-ocean text-primary-foreground shadow-hover hover:scale-105 active:scale-95 transition-transform"
        aria-label={t('nav.aiAssistant')}
      >
        {isOpen ? (
          <X size={18} />
        ) : (
          <span className="w-8 h-8 rounded-full overflow-hidden border border-gold/60 shrink-0">
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

    </div>
    </>
  );
};

export default MiniCaptainWidget;
