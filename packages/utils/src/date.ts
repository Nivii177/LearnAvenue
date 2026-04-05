const COLOMBO_TZ = 'Asia/Colombo';

/**
 * Returns the first day of the given month at 00:00:00 UTC.
 * Used as the canonical `month` value in FeeRecord.
 */
export function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

/**
 * Returns a Date representing the first day of the current month (UTC).
 */
export function currentMonthKey(): Date {
  return startOfMonth(new Date());
}

/**
 * Formats a date in Asia/Colombo timezone for display.
 * e.g. "April 2025"
 */
export function formatMonthLabel(date: Date | string): string {
  return new Intl.DateTimeFormat('en-LK', {
    month: 'long',
    year: 'numeric',
    timeZone: COLOMBO_TZ,
  }).format(new Date(date));
}

/**
 * Formats a date in Asia/Colombo timezone.
 * e.g. "05 Apr 2025, 3:24 PM"
 */
export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-LK', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: COLOMBO_TZ,
  }).format(new Date(date));
}
