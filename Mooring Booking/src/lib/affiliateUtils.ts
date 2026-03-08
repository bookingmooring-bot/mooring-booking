/**
 * Generate a unique 8-character alphanumeric referral code.
 * Uses first 4 chars of userId + 4 random chars (no ambiguous characters).
 */
export function generateReferralCode(userId: string): string {
    const userPart = userId.replace(/-/g, '').substring(0, 4).toUpperCase();
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let random = '';
    for (let i = 0; i < 4; i++) {
        random += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${userPart}${random}`;
}

/**
 * Build the full shareable referral URL.
 */
export function buildReferralLink(code: string): string {
    return `${window.location.origin}/explore?ref=${code}`;
}
