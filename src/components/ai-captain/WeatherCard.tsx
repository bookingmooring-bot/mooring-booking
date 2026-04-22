import { Wind, Thermometer, Gauge, Waves } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { WeatherData } from "@/lib/aiCaptainPayload";

interface Props {
    weather: WeatherData;
}

const beaufortColor = (bft: number): string => {
    if (bft <= 3) return "text-emerald-600";
    if (bft <= 5) return "text-yellow-600";
    if (bft <= 7) return "text-orange-600";
    return "text-red-600";
};

const unitsForLang = (lang: string) => {
    const l = (lang || "en").slice(0, 2).toLowerCase();
    if (l === "hr" || l === "sr" || l === "bs") return { speed: "čv", dist: "NM" };
    return { speed: "kn", dist: "NM" };
};

const WeatherCard = ({ weather }: Props) => {
    const { i18n } = useTranslation();
    const { speed } = unitsForLang(i18n.language);

    if (!weather?.ok) return null;

    return (
        <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg border border-border bg-background/60 p-2 text-[11px]">
            <div className="flex items-center gap-2">
                <Wind size={14} className="text-sky-600" />
                <div>
                    <div className="font-semibold text-foreground">
                        {weather.windKnots.toFixed(1)} {speed}
                    </div>
                    <div className="text-muted-foreground">
                        gust {weather.gustKnots.toFixed(1)} · <span className={beaufortColor(weather.beaufort)}>Bft {weather.beaufort}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Thermometer size={14} className="text-rose-600" />
                <div>
                    <div className="font-semibold text-foreground">{weather.tempC.toFixed(1)}°C</div>
                    <div className="text-muted-foreground">dew {weather.dewpointC.toFixed(1)}°</div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Gauge size={14} className="text-violet-600" />
                <div>
                    <div className="font-semibold text-foreground">{weather.pressurehPa} hPa</div>
                    <div className="text-muted-foreground">sea-level</div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Waves size={14} className="text-teal-600" />
                <div>
                    <div className="font-semibold text-foreground">{weather.waveM.toFixed(1)} m</div>
                    <div className="text-muted-foreground">swell {weather.swellM.toFixed(1)} m</div>
                </div>
            </div>
        </div>
    );
};

export default WeatherCard;
