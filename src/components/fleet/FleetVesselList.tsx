import { useState } from 'react';
import { useVessels, useDeleteVessel, type Vessel, type VesselStatus } from '@/hooks/useVesselProfile';
import { Ship, Plus, Pencil, Trash2, Anchor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FleetVesselForm from './FleetVesselForm';

const statusColors: Record<VesselStatus, string> = {
  available: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'in-use': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  maintenance: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

export default function FleetVesselList() {
  const { data: vessels, isLoading } = useVessels();
  const deleteVessel = useDeleteVessel();
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [showForm, setShowForm] = useState(false);

  if (isLoading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Ship className="text-primary" /> Fleet Vessels ({vessels?.length ?? 0})
        </h2>
        <Button onClick={() => { setEditingVessel(null); setShowForm(true); }} className="bg-gradient-ocean">
          <Plus size={16} className="mr-1" /> Add Vessel
        </Button>
      </div>

      {(!vessels || vessels.length === 0) ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-border">
          <Anchor className="mx-auto text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground">No vessels in your fleet yet.</p>
          <Button onClick={() => setShowForm(true)} variant="outline" className="mt-4">
            <Plus size={16} className="mr-1" /> Add Your First Vessel
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vessels.map((vessel) => (
            <div key={vessel.id} className="bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-hover transition-shadow">
              <div className="flex gap-4">
                {vessel.image_url ? (
                  <img src={vessel.image_url} alt={vessel.name ?? ''} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Ship className="text-muted-foreground" size={28} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-foreground truncate">{vessel.name || 'Unnamed Vessel'}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusColors[vessel.status]}`}>
                      {vessel.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{vessel.boat_type ?? 'Unknown type'}</p>
                  {vessel.length_m && (
                    <p className="text-sm text-muted-foreground">{vessel.length_m}m{vessel.beam_m ? ` × ${vessel.beam_m}m` : ''}{vessel.draft_m ? ` / ${vessel.draft_m}m draft` : ''}</p>
                  )}
                  {vessel.home_port && (
                    <p className="text-sm text-muted-foreground mt-1">{vessel.home_port}</p>
                  )}
                  {vessel.registration_number && (
                    <p className="text-xs text-muted-foreground">Reg: {vessel.registration_number}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                <Button size="sm" variant="outline" onClick={() => { setEditingVessel(vessel); setShowForm(true); }}>
                  <Pencil size={14} className="mr-1" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => { if (confirm('Delete this vessel?')) deleteVessel.mutate(vessel.id); }}
                >
                  <Trash2 size={14} className="mr-1" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <FleetVesselForm
          vessel={editingVessel}
          onClose={() => { setShowForm(false); setEditingVessel(null); }}
        />
      )}
    </div>
  );
}
