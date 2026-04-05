/**
 * Format LKR cents as a currency string.
 * e.g. 250000 → "Rs. 2,500"
 */
export function formatLKR(cents: number): string {
  const rupees = cents / 100;
  return new Intl.NumberFormat('si-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupees);
}

/**
 * Convert LKR rupee amount to cents for storage.
 * e.g. 2500 → 250000
 */
export function rupeesToCents(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Convert LKR cents to rupees for display.
 */
export function centsToRupees(cents: number): number {
  return cents / 100;
}
