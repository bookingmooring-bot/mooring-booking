import { useState } from 'react';
import { Ship, BarChart3 } from 'lucide-react';
import FleetVesselList from './FleetVesselList';
import FleetAnalytics from './FleetAnalytics';

type FleetTab = 'vessels' | 'analytics';

export default function FleetDashboard() {
  const [tab, setTab] = useState<FleetTab>('vessels');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setTab('vessels')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'vessels' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Ship size={16} /> Vessels
        </button>
        <button
          onClick={() => setTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'analytics' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <BarChart3 size={16} /> Analytics
        </button>
      </div>

      {tab === 'vessels' ? <FleetVesselList /> : <FleetAnalytics />}
    </div>
  );
}
