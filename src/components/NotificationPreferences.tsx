import { useState, useEffect } from "react";
import { Bell, BellOff, Wind, Waves, MapPin, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { isPremium } from "@/lib/subscription";

const NotificationPreferences = () => {
  const { data: profile } = useProfile();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const [enabled, setEnabled] = useState(true);
  const [windThreshold, setWindThreshold] = useState(35);
  const [waveThreshold, setWaveThreshold] = useState(3);
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (profile) {
      setEnabled(profile.storm_alerts_enabled ?? true);
      setWindThreshold(profile.storm_wind_threshold_kn ?? 35);
      setWaveThreshold(profile.storm_wave_threshold_m ?? 3);
      setLat(profile.last_known_lat != null ? String(profile.last_known_lat) : "");
      setLng(profile.last_known_lng != null ? String(profile.last_known_lng) : "");
    }
  }, [profile]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(5));
        setLng(pos.coords.longitude.toFixed(5));
        setLocating(false);
        toast.success("Location detected");
      },
      (err) => {
        setLocating(false);
        toast.error("Could not detect location: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const updates: Record<string, unknown> = {
      storm_alerts_enabled: enabled,
      storm_wind_threshold_kn: windThreshold,
      storm_wave_threshold_m: waveThreshold,
    };
    if (lat) updates.last_known_lat = parseFloat(lat);
    if (lng) updates.last_known_lng = parseFloat(lng);

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("Storm alert preferences saved");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  };

  const premium = isPremium(profile);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Bell size={18} /> Storm Alerts
        </h3>
        {!premium && (
          <Badge variant="secondary" className="text-xs">Premium only</Badge>
        )}
      </div>

      {!premium ? (
        <p className="text-muted-foreground text-sm">
          Upgrade to Sailor or Captain to receive automatic storm alerts when dangerous weather is approaching your location.
        </p>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {enabled ? <Bell size={16} className="text-primary" /> : <BellOff size={16} className="text-muted-foreground" />}
              <div>
                <Label htmlFor="storm-toggle" className="font-medium">Storm alerts</Label>
                <p className="text-xs text-muted-foreground">Get notified when severe weather is expected</p>
              </div>
            </div>
            <Switch id="storm-toggle" checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {enabled && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wind-thresh" className="flex items-center gap-2">
                    <Wind size={14} /> Wind threshold (knots)
                  </Label>
                  <Input
                    id="wind-thresh"
                    type="number"
                    min={15}
                    max={80}
                    value={windThreshold}
                    onChange={(e) => setWindThreshold(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">Alert when wind exceeds this speed. Default: 35kn (gale force)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wave-thresh" className="flex items-center gap-2">
                    <Waves size={14} /> Wave threshold (meters)
                  </Label>
                  <Input
                    id="wave-thresh"
                    type="number"
                    min={0.5}
                    max={10}
                    step={0.5}
                    value={waveThreshold}
                    onChange={(e) => setWaveThreshold(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">Alert when waves exceed this height. Default: 3m</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin size={14} /> Your location
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Latitude"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    type="number"
                    step="0.00001"
                  />
                  <Input
                    placeholder="Longitude"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    type="number"
                    step="0.00001"
                  />
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleDetectLocation} disabled={locating}>
                  {locating ? <Loader2 size={14} className="animate-spin mr-2" /> : <MapPin size={14} className="mr-2" />}
                  {locating ? "Detecting..." : "Use my current location"}
                </Button>
              </div>
            </>
          )}

          <Button onClick={handleSave} disabled={saving} className="bg-gradient-ocean">
            {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
            Save Preferences
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationPreferences;
