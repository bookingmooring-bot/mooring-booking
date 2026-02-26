import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsAppButtonProps {
  phone: string;
  message?: string;
  label?: string;
  variant?: "floating" | "inline";
  className?: string;
}

const WhatsAppButton = ({ phone, message = "", label = "Send via WhatsApp", variant = "inline", className = "" }: WhatsAppButtonProps) => {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  if (variant === "floating") {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-[hsl(142,70%,45%)] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
        <MessageCircle className="text-white" size={28} />
      </a>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
      <Button variant="outline" className="w-full border-[hsl(142,70%,45%)] text-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,45%)]/10">
        <MessageCircle size={18} className="mr-2" />
        {label}
      </Button>
    </a>
  );
};

export default WhatsAppButton;