import { useState } from "react";
import { Ship, Plus, Trash2, Star, Edit2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useVessels, useCreateVessel, useUpdateVessel, useDeleteVessel, useSetDefaultVessel } from "@/hooks/useVesselProfile";
import type { Vessel, VesselInput } from "@/hooks/useVesselProfile";
import VesselProfileForm from "./VesselProfileForm";

const BOAT_TYPE_LABELS: Record<string, string> = {
  sailboat: "Sailboat",
  motorboat: "Motorboat",
  rib: "RIB",
  catamaran: "Catamaran",
  yacht: "Yacht",
  other: "Other",
};

const VesselProfileManager = () => {
  const { data: vessels = [], isLoading } = useVessels();
  const createVessel = useCreateVessel();
  const updateVessel = useUpdateVessel();
  const deleteVessel = useDeleteVessel();
  const setDefaultVessel = useSetDefaultVessel();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleCreate = (data: VesselInput) => {
    createVessel.mutate(data, {
      onSuccess: () => { toast.success("Vessel added"); setShowAddForm(false); },
      onError: (e) => toast.error(e.message),
    });
  };

  const handleUpdate = (id: string, data: VesselInput) => {
    updateVessel.mutate({ id, updates: data }, {
      onSuccess: () => { toast.success("Vessel updated"); setEditingId(null); },
      onError: (e) => toast.error(e.message),
    });
  };

  const handleDelete = (v: Vessel) => {
    if (!confirm(`Delete "${v.name || "Unnamed vessel"}"?`)) return;
    deleteVessel.mutate(v.id, {
      onSuccess: () => toast.success("Vessel deleted"),
      onError: (e) => toast.error(e.message),
    });
  };

  const handleSetDefault = (id: string) => {
    setDefaultVessel.mutate(id, {
      onSuccess: () => toast.success("Default vessel updated"),
      onError: (e) => toast.error(e.message),
    });
  };

  if (isLoading) {
    return <div className="flex items-center gap-2 text-muted-foreground py-4"><Loader2 className="animate-spin" size={18} /> Loading vessels...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Ship size={18} /> My Vessels
        </h3>
        {!showAddForm && (
          <Button size="sm" variant="outline" onClick={() => { setShowAddForm(true); setEditingId(null); }}>
            <Plus size={14} className="mr-1" /> Add Vessel
          </Button>
        )}
      </div>

      {showAddForm && (
        <div className="border border-border rounded-lg p-4 bg-muted/30">
          <p className="font-medium mb-3">New Vessel</p>
          <VesselProfileForm onSave={handleCreate} onCancel={() => setShowAddForm(false)} isPending={createVessel.isPending} />
        </div>
      )}

      {vessels.length === 0 && !showAddForm && (
        <p className="text-muted-foreground text-sm py-4">No vessels yet. Add your first vessel to auto-fill booking forms and get tailored AI Captain advice.</p>
      )}

      {vessels.map((v) => (
        <div key={v.id} className="border border-border rounded-lg p-4 bg-card">
          {editingId === v.id ? (
            <VesselProfileForm vessel={v} onSave={(data) => handleUpdate(v.id, data)} onCancel={() => setEditingId(null)} isPending={updateVessel.isPending} />
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold truncate">{v.name || "Unnamed vessel"}</span>
                  {v.boat_type && <Badge variant="secondary" className="text-xs">{BOAT_TYPE_LABELS[v.boat_type] || v.boat_type}</Badge>}
                  {v.is_default && <Badge className="bg-primary/10 text-primary text-xs">Default</Badge>}
                </div>
                <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  {v.length_m && <span>{v.length_m}m</span>}
                  {v.beam_m && <span>Beam {v.beam_m}m</span>}
                  {v.draft_m && <span>Draft {v.draft_m}m</span>}
                  {(v.engine_make || v.engine_model) && <span>{[v.engine_make, v.engine_model].filter(Boolean).join(" ")}{v.engine_hours ? ` (${v.engine_hours}h)` : ""}</span>}
                  {v.mmsi && <span>MMSI {v.mmsi}</span>}
                  {v.insurance_expiry && <span>Ins. exp. {v.insurance_expiry}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!v.is_default && (
                  <Button size="sm" variant="ghost" onClick={() => handleSetDefault(v.id)} title="Set as default">
                    <Star size={14} />
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => { setEditingId(v.id); setShowAddForm(false); }}>
                  <Edit2 size={14} />
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(v)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default VesselProfileManager;
