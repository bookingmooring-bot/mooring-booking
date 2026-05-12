import { Anchor, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProviderDashboardProps {
  mooringCount: number;
  justSubmitted: boolean;
  lastMooringId: string | null;
  userMoorings: { id: string; name: string; status: string }[];
  onAddMooring: () => void;
  onEditMooring: (id: string) => void;
  onCompleteMooring: (id: string) => void;
}

export default function ProviderDashboard({
  mooringCount, justSubmitted, lastMooringId,
  userMoorings, onAddMooring, onEditMooring, onCompleteMooring,
}: ProviderDashboardProps) {
  const navigate = useNavigate();

  return (
    <main className="py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {mooringCount > 0 && (
            <div className="bg-card rounded-xl p-6 shadow-card mb-8">
              <div className="flex items-center justify-between max-w-2xl mx-auto">
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                    <Check size={20} strokeWidth={3} />
                  </div>
                  <span className="text-xs md:text-sm mt-2 text-center text-foreground font-medium">
                    Account created
                  </span>
                </div>
                <div className="flex-1 h-1 bg-emerald-500 -mx-2 mb-6 rounded-full" />
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                    <Check size={20} strokeWidth={3} />
                  </div>
                  <span className="text-xs md:text-sm mt-2 text-center text-foreground font-medium">
                    Mooring published
                  </span>
                </div>
                <div className="flex-1 h-1 bg-emerald-500 -mx-2 mb-6 rounded-full" />
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold shrink-0 ring-4 ring-blue-500/20 animate-pulse">
                    3
                  </div>
                  <span className="text-xs md:text-sm mt-2 text-center text-foreground font-semibold">
                    First booking
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-border bg-black">
              <video
                src="/videos/Reel8WalkthroughLandscape.mp4"
                className="w-full hidden md:block"
                autoPlay loop muted playsInline controls
              />
              <video
                src="/videos/Reel7Walkthrough.mp4"
                className="w-full block md:hidden object-cover max-h-[70vh]"
                autoPlay loop muted playsInline controls
              />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2 font-medium">
              💡 Double click to enlarge / Click to pause
            </p>
          </div>

          {justSubmitted && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-green-600" size={32} />
              </div>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
                Mooring Published! 🎉
              </h2>
              <p className="text-muted-foreground mb-2">
                Your mooring is live and approved. Complete your listing to attract more bookings!
              </p>
              <p className="text-sm text-green-700 font-medium mb-6">
                Total moorings: {mooringCount}
              </p>
              {lastMooringId && (
                <Button
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-lg h-14"
                  onClick={() => navigate(`/edit-mooring/${lastMooringId}`)}
                >
                  ✏️ Complete your listing — add photos, pricing & more
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              )}
            </div>
          )}

          {userMoorings.length > 0 && (
            <div className="mb-8">
              <h2 className="font-heading text-xl font-bold text-foreground mb-4">Your Moorings</h2>
              <div className="space-y-3">
                {userMoorings.map((m) => (
                  <div key={m.id} className="bg-card rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Anchor className="text-primary" size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{m.name || 'Mooring'}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          m.status === 'active' ? 'bg-green-100 text-green-700' :
                          m.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {m.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-shrink-0"
                        onClick={() => onEditMooring(m.id)}
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        size="sm"
                        className="flex-shrink-0 bg-gold hover:bg-gold/90 text-gold-foreground"
                        onClick={() => onCompleteMooring(m.id)}
                      >
                        ➕ Add Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-card rounded-2xl p-8 shadow-hover text-center">
            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Anchor className="text-gold" size={32} />
            </div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-3" translate="no">
              {justSubmitted ? 'Add Another Mooring' : 'Add Your Moorings'}
            </h1>
            <p className="text-muted-foreground mb-8">
              {justSubmitted
                ? 'Have more moorings? Add them all and increase your earnings!'
                : 'Fill in the details about your moorings and increase your income. Free, no risk.'
              }
            </p>

            <div className="space-y-3 text-left mb-8 max-w-md mx-auto">
              <div className="flex items-center gap-3 text-sm">
                <Check className="text-gold flex-shrink-0" size={18} />
                <span>Free listing — no subscription</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Check className="text-gold flex-shrink-0" size={18} />
                <span>88% earnings are yours (only 12% commission)</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Check className="text-gold flex-shrink-0" size={18} />
                <span>Sailors from 11 Mediterranean countries</span>
              </div>
            </div>

            <Button
              size="lg"
              className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold text-lg px-10 h-14"
              onClick={onAddMooring}
            >
              <span translate="no">{justSubmitted ? '➕ Add Another Mooring' : '⚓ Add Moorings'}</span>
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
