import type { NormalizedTransaction, SplitSpec } from './types.js';

/** Round to cents using half-up rounding. */
export function cents(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Resolve a parent ticket into fractional sub-tickets (Heartland Evenly /
 * Advanced / By-Seat modes, Toast fraction splits, Clover payment-level
 * splits). Monetary fields are split proportionally and the FINAL sub-ticket
 * absorbs the rounding remainder so that the sum of the splits matches the
 * parent total to the cent — this is what prevents Intuit Error 6000
 * (negative / unbalanced sales-receipt amounts) downstream in QuickBooks.
 */
export function resolveSplits(
  parent: NormalizedTransaction,
  splits: SplitSpec[],
): NormalizedTransaction[] {
  if (splits.length === 0) return [parent];
  const totalFraction = splits.reduce((s, x) => s + x.fraction, 0);
  if (Math.abs(totalFraction - 1) > 1e-6) {
    throw new Error(
      `Split fractions for ${parent.transaction_id} sum to ${totalFraction}, expected 1`,
    );
  }

  const fields = [
    'gross_sales',
    'net_sales',
    'discounts_applied',
    'adjustments',
    'taxes_collected',
    'tips',
  ] as const;

  const out: NormalizedTransaction[] = [];
  const allocated: Record<string, number> = Object.fromEntries(fields.map((f) => [f, 0]));

  splits.forEach((spec, i) => {
    const isLast = i === splits.length - 1;
    const child: NormalizedTransaction = {
      ...parent,
      transaction_id: `${parent.transaction_id}-${spec.index}`,
      customer_id: spec.seat != null ? seatCustomerId(parent, spec.seat) : parent.customer_id,
    };
    for (const f of fields) {
      const value = isLast
        ? cents(parent[f] - allocated[f])
        : cents(parent[f] * spec.fraction);
      child[f] = value;
      allocated[f] = cents(allocated[f] + value);
    }
    out.push(child);
  });
  return out;
}

/**
 * Seat-to-customer mapping: deterministic session-local customer id so
 * individual guest spend is trackable for loyalty / VIP analytics even when
 * the POS did not attach a real customer record to the seat.
 */
export function seatCustomerId(parent: NormalizedTransaction, seat: number): string {
  if (parent.customer_id) return parent.customer_id;
  return `SEAT-${parent.transaction_id}-${seat}`;
}
