import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';

const styles: Record<string, string> = {
  basic: '',
  sailor: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
  captain: 'bg-purple-500/15 text-purple-600 border-purple-500/30',
  'charter-fleet': 'bg-gold/20 text-gold border-gold/30',
  'ai-only': 'bg-cyan-500/15 text-cyan-600 border-cyan-500/30',
  'premium-monthly': 'bg-purple-500/15 text-purple-600 border-purple-500/30',
  'premium-annual': 'bg-purple-500/15 text-purple-600 border-purple-500/30',
};

const labels: Record<string, string> = {
  basic: 'Basic',
  sailor: 'Sailor',
  captain: 'Captain',
  'charter-fleet': 'Charter Fleet',
  'ai-only': 'AI Only',
  'premium-monthly': 'Premium Mo',
  'premium-annual': 'Premium Yr',
};

export default memo(function SubscriptionTierBadge({ tier }: { tier: string }) {
  const isCharter = tier === 'charter-fleet';
  return (
    <Badge variant={tier === 'basic' ? 'outline' : 'default'} className={styles[tier] ?? ''}>
      {isCharter && <Crown size={12} className="mr-1" />}
      {labels[tier] ?? tier}
    </Badge>
  );
});
