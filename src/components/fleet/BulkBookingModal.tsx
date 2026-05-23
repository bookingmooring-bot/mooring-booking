import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useVessels, type Vessel } from '@/hooks/useVesselProfile';
import { useCreateBulkBooking, type BulkBookingResult } from '@/hooks/useCreateBulkBooking';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Loader2, Check, AlertTriangle, Ship } from 'lucide-react';
import type { Mooring } from '@/data/moorings';

interface Props {
  mooring: Mooring;
  onClose: () => void;
}

export default function BulkBookingModal({ mooring, onClose }: Props) {
  const { t } = useTranslation();
  const { data: vessels } = useVessels();
  const { data: profile } = useProfile();
  const bulkBook = useCreateBulkBooking();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [result, setResult] = useState<BulkBookingResult | null>(null);

  const selectedVessels = (vessels ?? []).filter((v) => selectedIds.has(v.id));

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0;

  const totalPerVessel = mooring.price * nights;
  const totalAll = totalPerVessel * selectedVessels.length;
  const commissionRate = Number(profile?.commission_rate) || 0.12;

  const canSubmit = selectedVessels.length > 0 && nights > 0 && !bulkBook.isPending;

  const handleSubmit = async () => {
    const res = await bulkBook.mutateAsync({
      mooringId: mooring.id,
      checkIn,
      checkOut,
      nights,
      pricePerNight: mooring.price,
      commissionAmount: Math.round(totalPerVessel * commissionRate * 100) / 100,
      guestName: profile?.full_name ?? '',
      guestEmail: profile?.email ?? '',
      guestPhone: profile?.phone ?? undefined,
      vessels: selectedVessels,
    });
    setResult(res);
  };

  const compatibleVessels = (vessels ?? []).filter((v) => {
    if (v.status === 'maintenance') return false;
    if (mooring.maxBoatLength && v.length_m && v.length_m > mooring.maxBoatLength) return false;
    if (mooring.maxDraft && v.draft_m && v.draft_m > mooring.maxDraft) return false;
    return true;
  });

  const incompatibleVessels = (vessels ?? []).filter((v) => !compatibleVessels.includes(v));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-lg border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="font-bold text-lg">Fleet Booking</h2>
            <p className="text-sm text-muted-foreground">{mooring.name} — €{mooring.price}{t('popular.perNight')}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
        </div>

        {result ? (
          <div className="p-4 space-y-4">
            <h3 className="font-bold text-lg">Booking Results</h3>
            {result.succeeded.map((s) => (
              <div key={s.vesselId} className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <Check size={16} /> {s.vesselName} — booked
              </div>
            ))}
            {result.failed.map((f) => (
              <div key={f.vesselId} className="flex items-center gap-2 text-destructive">
                <AlertTriangle size={16} /> {f.vesselName} — {f.error}
              </div>
            ))}
            <Button onClick={onClose} className="w-full mt-4">Close</Button>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Check-in</Label>
                <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="space-y-1">
                <Label>Check-out</Label>
                <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} min={checkIn || undefined} />
              </div>
            </div>
            {nights > 0 && <p className="text-sm text-muted-foreground">{nights} night{nights > 1 ? 's' : ''}</p>}

            {/* Vessel selection */}
            <div>
              <Label className="mb-2 block">Select Vessels</Label>
              {compatibleVessels.length === 0 ? (
                <p className="text-sm text-muted-foreground">No compatible vessels in your fleet.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {compatibleVessels.map((v) => (
                    <label key={v.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedIds.has(v.id) ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
                    }`}>
                      <input type="checkbox" checked={selectedIds.has(v.id)} onChange={() => toggle(v.id)} className="rounded" />
                      <Ship size={16} className="text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{v.name || 'Unnamed'}</p>
                        <p className="text-xs text-muted-foreground">{v.length_m}m {v.boat_type}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {incompatibleVessels.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {incompatibleVessels.length} vessel(s) excluded (too large or in maintenance)
                </p>
              )}
            </div>

            {/* Summary */}
            {selectedVessels.length > 0 && nights > 0 && (
              <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between"><span>Per vessel</span><span>€{totalPerVessel.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>{selectedVessels.length} vessel(s)</span><span></span></div>
                <div className="flex justify-between font-bold text-base border-t border-border pt-1 mt-1">
                  <span>Total</span><span>€{totalAll.toFixed(2)}</span>
                </div>
              </div>
            )}

            <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full bg-gradient-ocean">
              {bulkBook.isPending ? (
                <><Loader2 size={16} className="animate-spin mr-2" /> Booking...</>
              ) : (
                `Book ${selectedVessels.length} Vessel${selectedVessels.length !== 1 ? 's' : ''}`
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
