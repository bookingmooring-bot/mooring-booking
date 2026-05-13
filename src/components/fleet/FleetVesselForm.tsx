import { useState } from 'react';
import { useCreateVessel, useUpdateVessel, type Vessel, type VesselInput, type VesselStatus } from '@/hooks/useVesselProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Loader2, Save } from 'lucide-react';

interface Props {
  vessel: Vessel | null;
  onClose: () => void;
}

const BOAT_TYPES = ['sailboat', 'motorboat', 'rib', 'catamaran', 'yacht', 'other'] as const;
const STATUSES: VesselStatus[] = ['available', 'in-use', 'maintenance'];

export default function FleetVesselForm({ vessel, onClose }: Props) {
  const createVessel = useCreateVessel();
  const updateVessel = useUpdateVessel();
  const isEdit = !!vessel;

  const [form, setForm] = useState({
    name: vessel?.name ?? '',
    boat_type: vessel?.boat_type ?? 'sailboat',
    length_m: vessel?.length_m?.toString() ?? '',
    beam_m: vessel?.beam_m?.toString() ?? '',
    draft_m: vessel?.draft_m?.toString() ?? '',
    registration_number: vessel?.registration_number ?? '',
    home_port: vessel?.home_port ?? '',
    status: vessel?.status ?? 'available' as VesselStatus,
    mmsi: vessel?.mmsi ?? '',
    call_sign: vessel?.call_sign ?? '',
    charter_notes: vessel?.charter_notes ?? '',
    image_url: vessel?.image_url ?? '',
  });

  const isPending = createVessel.isPending || updateVessel.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input: VesselInput = {
      name: form.name || null,
      boat_type: form.boat_type as Vessel['boat_type'],
      length_m: form.length_m ? parseFloat(form.length_m) : null,
      beam_m: form.beam_m ? parseFloat(form.beam_m) : null,
      draft_m: form.draft_m ? parseFloat(form.draft_m) : null,
      registration_number: form.registration_number || null,
      home_port: form.home_port || null,
      status: form.status,
      mmsi: form.mmsi || null,
      call_sign: form.call_sign || null,
      charter_notes: form.charter_notes || null,
      image_url: form.image_url || null,
    };

    if (isEdit) {
      await updateVessel.mutateAsync({ id: vessel.id, updates: input });
    } else {
      await createVessel.mutateAsync(input);
    }
    onClose();
  };

  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-lg border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-bold text-lg">{isEdit ? 'Edit Vessel' : 'Add Vessel'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <Label>Vessel Name</Label>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </div>

            <div className="space-y-1">
              <Label>Boat Type</Label>
              <select value={form.boat_type} onChange={(e) => set('boat_type', e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                {BOAT_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <Label>Status</Label>
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <Label>Length (m)</Label>
              <Input type="number" step="0.1" value={form.length_m} onChange={(e) => set('length_m', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Beam (m)</Label>
              <Input type="number" step="0.1" value={form.beam_m} onChange={(e) => set('beam_m', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Draft (m)</Label>
              <Input type="number" step="0.1" value={form.draft_m} onChange={(e) => set('draft_m', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Registration #</Label>
              <Input value={form.registration_number} onChange={(e) => set('registration_number', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Home Port</Label>
              <Input value={form.home_port} onChange={(e) => set('home_port', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>MMSI</Label>
              <Input value={form.mmsi} onChange={(e) => set('mmsi', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Call Sign</Label>
              <Input value={form.call_sign} onChange={(e) => set('call_sign', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Image URL</Label>
              <Input value={form.image_url} onChange={(e) => set('image_url', e.target.value)} placeholder="https://..." />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Notes</Label>
              <textarea
                value={form.charter_notes}
                onChange={(e) => set('charter_notes', e.target.value)}
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              />
            </div>
          </div>

          <Button type="submit" disabled={isPending} className="w-full bg-gradient-ocean">
            {isPending ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
            {isEdit ? 'Save Changes' : 'Add Vessel'}
          </Button>
        </form>
      </div>
    </div>
  );
}
