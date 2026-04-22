import { Phone, Radio, ExternalLink } from "lucide-react";
import type { MaydayPayload } from "@/lib/aiCaptainPayload";

interface Props {
    mayday: MaydayPayload;
}

const MaydayAlert = ({ mayday }: Props) => {
    const telHref = `tel:${mayday.mrccPhone.replace(/\s+/g, "")}`;
    return (
        <div className="mt-2 rounded-lg border border-red-500/60 bg-red-600/10 p-3 text-sm">
            <div className="flex items-center gap-2 font-semibold text-red-600">
                🆘 MAYDAY — {mayday.country}
            </div>
            <div className="mt-2 space-y-1.5 text-foreground">
                <a
                    href={telHref}
                    className="flex items-center gap-2 font-mono text-base font-bold text-red-700 hover:underline"
                >
                    <Phone size={16} /> {mayday.mrccPhone}
                </a>
                {mayday.mrccAltPhone && (
                    <a
                        href={`tel:${mayday.mrccAltPhone.replace(/\s+/g, "")}`}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:underline"
                    >
                        <Phone size={12} /> {mayday.mrccAltPhone}
                    </a>
                )}
                <div className="flex items-center gap-2 text-sm">
                    <Radio size={14} /> VHF Ch.{mayday.vhfChannel}
                </div>
                {mayday.coastGuard && (
                    <div className="text-xs text-muted-foreground">
                        {mayday.coastGuard}
                        {mayday.coastGuardUrl && (
                            <a
                                href={mayday.coastGuardUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="ml-1 inline-flex items-center gap-0.5 underline"
                            >
                                <ExternalLink size={10} />
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MaydayAlert;
