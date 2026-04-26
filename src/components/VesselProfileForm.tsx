import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import type { Vessel, VesselInput } from "@/hooks/useVesselProfile";

const BOAT_TYPES = [
  { value: "sailboat", label: "Sailboat" },
  { value: "motorboat", label: "Motorboat" },
  { value: "rib", label: "RIB" },
  { value: "catamaran", label: "Catamaran" },
  { value: "yacht", label: "Yacht" },
  { value: "other", label: "Other" },
] as const;

interface VesselProfileFormProps {
  vessel?: Vessel | null;
  onSave: (data: VesselInput) => void;
  onCancel: () => void;
  isPending: boolean;
}

const VesselProfileForm = ({ vessel, onSave, onCancel, isPending }: VesselProfileFormProps) => {
  const [form, setForm] = useState<VesselInput>({
    name: "",
    boat_type: null,
    length_m: null,
    beam_m: null,
    draft_m: null,
    mmsi: "",
    call_sign: "",
    insurance_expiry: null,
    engine_make: "",
    engine_model: "",
    engine_hours: null,
  });

  useEffect(() => {
    if (vessel) {
      setForm({
        name: vessel.name || "",
        boat_type: vessel.boat_type,
        length_m: vessel.length_m,
        beam_m: vessel.beam_m,
        draft_m: vessel.draft_m,
        mmsi: vessel.mmsi || "",
        call_sign: vessel.call_sign || "",
        insurance_expiry: vessel.insurance_expiry,
        engine_make: vessel.engine_make || "",
        engine_model: vessel.engine_model || "",
        engine_hours: vessel.engine_hours,
      });
    }
  }, [vessel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const numField = (val: number | null | undefined) => val != null ? String(val) : "";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="v-name">Vessel Name</Label>
          <Input id="v-name" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sea Wolf" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="v-type">Type</Label>
          <Select value={form.boat_type || ""} onValueChange={(v) => setForm({ ...form, boat_type: v as Vessel["boat_type"] })}>
            <SelectTrigger id="v-type"><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              {BOAT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="v-length">Length (m)</Label>
          <Input id="v-length" type="number" step="0.1" value={numField(form.length_m)} onChange={(e) => setForm({ ...form, length_m: e.target.value ? +e.target.value : null })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="v-beam">Beam (m)</Label>
          <Input id="v-beam" type="number" step="0.1" value={numField(form.beam_m)} onChange={(e) => setForm({ ...form, beam_m: e.target.value ? +e.target.value : null })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="v-draft">Draft (m)</Label>
          <Input id="v-draft" type="number" step="0.1" value={numField(form.draft_m)} onChange={(e) => setForm({ ...form, draft_m: e.target.value ? +e.target.value : null })} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="v-mmsi">MMSI</Label>
          <Input id="v-mmsi" value={form.mmsi || ""} onChange={(e) => setForm({ ...form, mmsi: e.target.value })} placeholder="9 digits" maxLength={9} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="v-callsign">Call Sign</Label>
          <Input id="v-callsign" value={form.call_sign || ""} onChange={(e) => setForm({ ...form, call_sign: e.target.value.toUpperCase() })} placeholder="e.g. 9A1234" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="v-insurance">Insurance Expiry</Label>
        <Input id="v-insurance" type="date" value={form.insurance_expiry || ""} onChange={(e) => setForm({ ...form, insurance_expiry: e.target.value || null })} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="v-emake">Engine Make</Label>
          <Input id="v-emake" value={form.engine_make || ""} onChange={(e) => setForm({ ...form, engine_make: e.target.value })} placeholder="e.g. Yanmar" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="v-emodel">Engine Model</Label>
          <Input id="v-emodel" value={form.engine_model || ""} onChange={(e) => setForm({ ...form, engine_model: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="v-ehours">Hours</Label>
          <Input id="v-ehours" type="number" value={numField(form.engine_hours)} onChange={(e) => setForm({ ...form, engine_hours: e.target.value ? +e.target.value : null })} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending} className="bg-gradient-ocean">
          {isPending ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
          {vessel ? "Update Vessel" : "Add Vessel"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
};

export default VesselProfileForm;
