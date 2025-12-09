import type { Session } from '@supabase/supabase-js';

const SESSION_EXPIRY_HOURS = 24 * 7; // 1 hafta = 7 gün

export function isSessionExpired(session: Session | null): boolean {
  if (!session) return true;

  const expiresAt = session.expires_at;
  if (!expiresAt) return false;

  const now = Math.floor(Date.now() / 1000);
  return now > expiresAt;
}

export function getSessionExpiryTime(session: Session | null): Date | null {
  if (!session || !session.expires_at) return null;
  return new Date(session.expires_at * 1000);
}

export function getRemainingSessionTime(session: Session | null): number {
  if (!session || !session.expires_at) return 0;

  const now = Math.floor(Date.now() / 1000);
  const remaining = session.expires_at - now;
  
  return remaining > 0 ? remaining : 0;
}
