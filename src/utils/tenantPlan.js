export const TRIAL_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

function toDate(value) {
  if (!value) return null;
  if (value?.toDate) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

export function createTrialEndDate(baseDate = new Date()) {
  return new Date(baseDate.getTime() + TRIAL_DAYS * DAY_MS);
}

export function getTenantPlanState(config = {}) {
  const rawStatus = config.planStatus || 'trial';
  const trialEndsAt = toDate(config.trialEndsAt);
  const now = new Date();
  const remainingMs = trialEndsAt ? trialEndsAt.getTime() - now.getTime() : 0;
  const isExpired = rawStatus === 'trial' && trialEndsAt ? remainingMs <= 0 : rawStatus === 'suspended';
  const daysLeft = trialEndsAt ? Math.max(0, Math.ceil(remainingMs / DAY_MS)) : 0;
  const isTrial = rawStatus === 'trial' && !isExpired;
  const isEndingSoon = isTrial && daysLeft <= 1;
  const effectiveStatus = rawStatus === 'active' ? 'active' : isExpired ? 'suspended' : 'trial';

  return {
    rawStatus,
    effectiveStatus,
    isTrial,
    isEndingSoon,
    isExpired: effectiveStatus === 'suspended',
    isActive: effectiveStatus === 'active',
    trialEndsAt,
    daysLeft,
  };
}

export function formatPlanDate(date) {
  if (!date) return '';
  return date.toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
