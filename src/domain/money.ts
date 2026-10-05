/** Myanmar Kyat helpers. All amounts are whole Kyat (integers). */

export function formatKs(amount: number): string {
  return `Ks ${Math.round(amount).toLocaleString("en-US")}`;
}

/** Round to the nearest 100 Ks so derived amounts (deposits, percentages) stay tidy. */
export function roundKs(amount: number): number {
  return Math.round(amount / 100) * 100;
}
