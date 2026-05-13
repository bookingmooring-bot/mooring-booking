import { useFleetAnalytics } from '@/hooks/useFleetAnalytics';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Calendar, DollarSign, Moon, Ship } from 'lucide-react';

export default function FleetAnalytics() {
  const { vesselStats, totalBookings, totalSpend, totalNights, bookings } = useFleetAnalytics();

  const chartData = vesselStats.map((v) => ({
    name: v.vesselName.length > 12 ? v.vesselName.slice(0, 12) + '...' : v.vesselName,
    spend: Math.round(v.totalSpend),
    nights: v.totalNights,
  }));

  const upcoming = bookings
    .filter((b) => new Date(b.check_in) >= new Date() && b.booking_status !== 'cancelled')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard icon={<Calendar className="text-blue-500" size={20} />} label="Total Bookings" value={totalBookings.toString()} />
        <SummaryCard icon={<DollarSign className="text-green-500" size={20} />} label="Total Spend" value={`€${totalSpend.toFixed(0)}`} />
        <SummaryCard icon={<Moon className="text-purple-500" size={20} />} label="Total Nights" value={totalNights.toString()} />
        <SummaryCard icon={<Ship className="text-primary" size={20} />} label="Fleet Size" value={vesselStats.length.toString()} />
      </div>

      {/* Spend per vessel chart */}
      {chartData.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <h3 className="font-bold mb-4">Spend per Vessel</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => [`€${value}`, 'Spend']} />
              <Bar dataKey="spend" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Upcoming bookings */}
      {upcoming.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <h3 className="font-bold mb-4">Upcoming Fleet Bookings</h3>
          <div className="space-y-3">
            {upcoming.map((b) => (
              <div key={b.id} className="flex items-center justify-between text-sm border-b border-border last:border-0 pb-2 last:pb-0">
                <div>
                  <p className="font-medium">{b.moorings?.name ?? 'Unknown'}</p>
                  <p className="text-muted-foreground">{b.moorings?.location}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{new Date(b.check_in).toLocaleDateString()} - {new Date(b.check_out).toLocaleDateString()}</p>
                  <p className="text-muted-foreground">€{b.total_price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {vesselStats.length === 0 && (
        <div className="text-center py-12 bg-card rounded-2xl border border-border">
          <p className="text-muted-foreground">No fleet booking data yet. Book moorings for your vessels to see analytics.</p>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-sm text-muted-foreground">{label}</span></div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
