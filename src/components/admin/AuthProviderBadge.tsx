import { memo } from 'react';
import { Badge } from '@/components/ui/badge';

const styles: Record<string, string> = {
  google: 'bg-red-500/15 text-red-600 border-red-500/30',
  apple: 'bg-gray-800/15 text-gray-800 dark:text-gray-300 border-gray-800/30',
  email: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
  fb_lead: 'bg-[#1877F2]/15 text-[#1877F2] border-[#1877F2]/30',
};

const labels: Record<string, string> = {
  google: 'Google',
  apple: 'Apple',
  email: 'Email',
  fb_lead: 'FB Lead',
};

export default memo(function AuthProviderBadge({ provider }: { provider: string }) {
  return (
    <Badge className={styles[provider] ?? ''}>
      {labels[provider] ?? provider}
    </Badge>
  );
});
