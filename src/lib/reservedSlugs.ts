import { supabase } from '@/lib/supabase';

export const RESERVED_SLUGS = new Set([
  'become-provider', 'auth', 'marina-partnership', 'join-as-provider',
  'how-it-works', 'about', 'explore', 'pricing', 'affiliate',
  'support', 'blog', 'contact', 'privacy', 'terms', 'cookies', 'gdpr',
  'admin', 'user-pricing', 'sailing-manual', 'ai-captain',
  'dashboard', 'add-mooring', 'edit-mooring', 'unsubscribe',
  'api', 'app', 'owner', 'settings', 'login', 'signup', 'health',
  'webhook', 'stripe', 'whatsapp', 'favicon', 'assets', 'static',
]);

const SLUG_REGEX = /^[a-z0-9][a-z0-9\-]{2,48}[a-z0-9]$/;

export function isSlugFormatValid(slug: string): boolean {
  return SLUG_REGEX.test(slug);
}

export async function isSlugAvailable(slug: string): Promise<{ available: boolean; reason?: string }> {
  if (!isSlugFormatValid(slug)) {
    return { available: false, reason: 'Slug must be 4-50 characters, lowercase letters, numbers, and hyphens only.' };
  }
  if (RESERVED_SLUGS.has(slug)) {
    return { available: false, reason: 'This name is reserved.' };
  }
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('provider_slug', slug)
    .maybeSingle();

  if (data) {
    return { available: false, reason: 'This name is already taken.' };
  }
  return { available: true };
}
