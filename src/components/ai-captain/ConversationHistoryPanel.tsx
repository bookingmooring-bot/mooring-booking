import { useEffect, useState } from "react";
import { MessageSquarePlus, Trash2, X, History } from "lucide-react";
import {
  listConversations,
  deleteConversation,
  type ConversationSummary,
} from "@/lib/aiConversations";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (conversationId: string) => void;
  onNew: () => void;
  activeConversationId: string | null;
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { day: "2-digit", month: "2-digit" });
}

const ConversationHistoryPanel = ({ isOpen, onClose, onSelect, onNew, activeConversationId }: Props) => {
  const [items, setItems] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    listConversations(30).then((rows) => {
      if (!cancelled) {
        setItems(rows);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await deleteConversation(id);
    if (ok) setItems((prev) => prev.filter((c) => c.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-10 bg-card flex flex-col animate-fade-in">
      <div className="bg-gradient-ocean px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary-foreground">
          <History size={18} />
          <span className="font-semibold text-sm">Razgovori</span>
        </div>
        <button
          onClick={onClose}
          className="text-primary-foreground/70 hover:text-primary-foreground"
          aria-label="Zatvori"
        >
          <X size={18} />
        </button>
      </div>

      <button
        onClick={onNew}
        className="mx-3 mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-ocean text-primary-foreground px-3 py-2 text-sm font-medium shadow-sm hover:opacity-95"
      >
        <MessageSquarePlus size={16} />
        Novi razgovor
      </button>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {loading && <p className="text-xs text-muted-foreground p-2">Učitavanje…</p>}

        {!loading && items.length === 0 && (
          <p className="text-xs text-muted-foreground p-2">
            Nemaš spremljenih razgovora. Započni novi i automatski će se sačuvati.
          </p>
        )}

        {items.map((c) => {
          const isActive = c.id === activeConversationId;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`w-full text-left rounded-lg px-3 py-2 group flex items-start gap-2 transition-colors ${
                isActive ? "bg-muted" : "hover:bg-muted/60"
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {c.title || "Novi razgovor"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {formatWhen(c.last_message_at)} · {c.message_count} poruka
                </p>
              </div>
              <button
                onClick={(e) => handleDelete(c.id, e)}
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-destructive"
                aria-label="Obriši razgovor"
              >
                <Trash2 size={14} />
              </button>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationHistoryPanel;
