import { useState } from 'react';
import { Crown, Check, Loader2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useProfile } from '@/hooks/useProfile';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useProviderMoorings } from '@/hooks/useMoorings';
import { useAuth } from '@/contexts/AuthContext';
import { isWhiteLabel, WL_SUBSCRIPTION_PRICES } from '@/lib/providerTier';
import type { BerthTier } from '@/lib/providerTier';

const PRICE_IDS: Record<BerthTier, string | undefined> = {
  'up-to-50': import.meta.env.VITE_STRIPE_PRICE_WL_UP_TO_50,
  'over-50': import.meta.env.VITE_STRIPE_PRICE_WL_OVER_50,
};

export default function WhiteLabelUpgradeCard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: moorings } = useProviderMoorings(user?.id);
  const checkout = useStripeCheckout();

  const mooringCount = moorings?.length ?? 0;
  const suggestedTier: BerthTier = mooringCount > 50 ? 'over-50' : 'up-to-50';
  const [selectedTier, setSelectedTier] = useState<BerthTier>(suggestedTier);

  const handleUpgrade = () => {
    const priceId = PRICE_IDS[selectedTier];
    if (!priceId || priceId.startsWith('price_YOUR')) return;
    checkout.mutate({
      priceId,
      successPath: '/dashboard?wl_activated=true',
      cancelPath: '/dashboard',
    });
  };

  if (isWhiteLabel(profile)) {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-card border border-gold/40 border-l-4 border-l-gold">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Crown size={18} className="text-gold" />
              White Label Marina
            </h3>
            <p className="text-sm text-success mt-1">
              {t('dashboard.whiteLabel.active', 'Active')} — {profile?.white_label_berth_tier === 'over-50'
                ? t('pricing.whiteLabel.over50', 'Over 50 Berths')
                : t('pricing.whiteLabel.upTo50', 'Up to 50 Berths')}
              {' · '}€{WL_SUBSCRIPTION_PRICES[profile?.white_label_berth_tier ?? 'up-to-50']}/mj
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              10% {t('pricing.whiteLabel.commissionShort', 'commission')} + €5/{t('pricing.whiteLabel.perBooking', 'booking')} · Premium Listing {t('pricing.whiteLabel.included', 'included')}
            </p>
          </div>
          <div className="bg-gold/10 text-gold px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
            <Crown size={14} /> White Label
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card border border-border border-l-4 border-l-gold">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Building2 size={18} className="text-gold" />
            {t('dashboard.whiteLabel.upgradeTitle', 'Upgrade to White Label Marina')}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t('dashboard.whiteLabel.upgradeDesc', 'Reduce your commission to 10%, get premium listing included, and dedicated support.')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(['up-to-50', 'over-50'] as BerthTier[]).map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                selectedTier === tier
                  ? 'border-gold bg-gold/5'
                  : 'border-border hover:border-gold/50'
              }`}
            >
              <div className="font-heading font-bold text-lg text-primary">
                €{WL_SUBSCRIPTION_PRICES[tier]}<span className="text-sm text-muted-foreground font-normal">/mj</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {tier === 'up-to-50'
                  ? t('pricing.whiteLabel.upTo50', 'Up to 50 Berths')
                  : t('pricing.whiteLabel.over50', 'Over 50 Berths')}
              </div>
            </button>
          ))}
        </div>

        <ul className="space-y-1 text-sm">
          <li className="flex items-center gap-2 text-foreground">
            <Check size={14} className="text-success" /> 10% {t('pricing.whiteLabel.commissionShort', 'commission')} (vs 12%)
          </li>
          <li className="flex items-center gap-2 text-foreground">
            <Check size={14} className="text-success" /> €5 {t('pricing.whiteLabel.perBookingFee', 'per booking flat fee')}
          </li>
          <li className="flex items-center gap-2 text-foreground">
            <Check size={14} className="text-success" /> Premium Listing {t('pricing.whiteLabel.included', 'included')} (€9.99/mj)
          </li>
        </ul>

        <Button
          onClick={handleUpgrade}
          disabled={checkout.isPending || !PRICE_IDS[selectedTier] || PRICE_IDS[selectedTier]?.startsWith('price_YOUR')}
          className="w-full bg-gold text-gold-foreground hover:bg-gold/90 font-semibold"
        >
          {checkout.isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Redirecting...
            </span>
          ) : (
            <>
              <Crown size={16} className="mr-2" />
              {t('pricing.whiteLabel.upgrade', 'Upgrade to White Label')} — €{WL_SUBSCRIPTION_PRICES[selectedTier]}/mj
            </>
          )}
        </Button>

        {(!PRICE_IDS[selectedTier] || PRICE_IDS[selectedTier]?.startsWith('price_YOUR')) && (
          <p className="text-xs text-muted-foreground text-center">
            {t('dashboard.whiteLabel.notConfigured', 'Stripe not configured yet. Contact support.')}
          </p>
        )}
      </div>
    </div>
  );
}
