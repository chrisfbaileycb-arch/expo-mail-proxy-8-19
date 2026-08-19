/**
 * vip.test.ts — Tests for RFMD VIP segmenting engine.
 */

import { describe, it, expect } from 'vitest';
import { segment } from '../src/vip.js';
import type { NormalizedTransaction } from '@expo-proxy/shared';

const NOW = new Date('2024-03-15T12:00:00.000Z');

/** Build a minimal valid transaction. */
function makeTx(overrides: Partial<NormalizedTransaction>): NormalizedTransaction {
  return {
    transaction_id: 'tx-default',
    source_pos: 'Heartland',
    business_date: '2024-03-14',
    timestamp: '2024-03-14T18:00:00.000Z',
    gross_sales: 50,
    net_sales: 45,
    discounts_applied: 0,
    adjustments: 0,
    taxes_collected: 5,
    tips: 2,
    payment_method: 'Credit_Visa',
    auth_code: 'AUTH01',
    customer_id: 'cust-A',
    modifiers_json: [],
    ...overrides,
  };
}

/**
 * Fixture cohort:
 *  - cust-A: high frequency, high ticket, no discounts → VIP
 *  - cust-B: low frequency, low ticket, moderate discount → standard
 *  - cust-C: any frequency, sensitivity >= 0.7 → promo_pool (regardless of score)
 */
const FIXTURE: NormalizedTransaction[] = [
  // cust-A: 5 distinct visits, avg ticket ~80, 0 discounted → high score → vip
  makeTx({ transaction_id: 'tx-A1', customer_id: 'cust-A', business_date: '2024-02-10', timestamp: '2024-02-10T12:00:00.000Z', net_sales: 80, discounts_applied: 0 }),
  makeTx({ transaction_id: 'tx-A2', customer_id: 'cust-A', business_date: '2024-02-17', timestamp: '2024-02-17T12:00:00.000Z', net_sales: 80, discounts_applied: 0 }),
  makeTx({ transaction_id: 'tx-A3', customer_id: 'cust-A', business_date: '2024-02-24', timestamp: '2024-02-24T12:00:00.000Z', net_sales: 80, discounts_applied: 0 }),
  makeTx({ transaction_id: 'tx-A4', customer_id: 'cust-A', business_date: '2024-03-02', timestamp: '2024-03-02T12:00:00.000Z', net_sales: 80, discounts_applied: 0 }),
  makeTx({ transaction_id: 'tx-A5', customer_id: 'cust-A', business_date: '2024-03-14', timestamp: '2024-03-14T12:00:00.000Z', net_sales: 80, discounts_applied: 0 }),

  // cust-B: 1 visit, low ticket, 1/1 discounts (sensitivity=1.0 → promo_pool)
  // Wait — to test standard, cust-B should have sensitivity < 0.7
  // 1 visit, avg ticket 20, 0 discounts → low score → standard
  makeTx({ transaction_id: 'tx-B1', customer_id: 'cust-B', business_date: '2024-01-20', timestamp: '2024-01-20T12:00:00.000Z', net_sales: 20, discounts_applied: 0 }),

  // cust-C: 2 visits, 2/2 discounted (sensitivity=1.0 >= 0.7 → promo_pool)
  makeTx({ transaction_id: 'tx-C1', customer_id: 'cust-C', business_date: '2024-02-15', timestamp: '2024-02-15T12:00:00.000Z', net_sales: 30, discounts_applied: 5 }),
  makeTx({ transaction_id: 'tx-C2', customer_id: 'cust-C', business_date: '2024-03-01', timestamp: '2024-03-01T12:00:00.000Z', net_sales: 30, discounts_applied: 5 }),
];

describe('segment — RFMD VIP segmenting', () => {
  it('returns correct segment counts for fixture cohort', () => {
    const result = segment(FIXTURE, NOW);
    // cust-A should be vip (high F, high V, zero sensitivity, high recency)
    // cust-B should be standard (low score, low sensitivity)
    // cust-C should be promo_pool (sensitivity = 1.0 >= 0.70)
    expect(result.vip.some((r) => r.customerId === 'cust-A')).toBe(true);
    expect(result.standard.some((r) => r.customerId === 'cust-B')).toBe(true);
    expect(result.promo_pool.some((r) => r.customerId === 'cust-C')).toBe(true);
  });

  it('S >= 0.70 always goes to promo_pool regardless of score', () => {
    // Build a customer with very high F and V but sensitivity >= 0.70
    const txs: NormalizedTransaction[] = [
      makeTx({ transaction_id: 'tx-D1', customer_id: 'cust-D', business_date: '2024-03-01', timestamp: '2024-03-01T12:00:00.000Z', net_sales: 100, discounts_applied: 10 }),
      makeTx({ transaction_id: 'tx-D2', customer_id: 'cust-D', business_date: '2024-03-07', timestamp: '2024-03-07T12:00:00.000Z', net_sales: 100, discounts_applied: 10 }),
      makeTx({ transaction_id: 'tx-D3', customer_id: 'cust-D', business_date: '2024-03-10', timestamp: '2024-03-10T12:00:00.000Z', net_sales: 100, discounts_applied: 10 }),
      // 3/3 orders discounted = sensitivity 1.0 → must be promo_pool
    ];
    const result = segment(txs, NOW);
    expect(result.promo_pool).toHaveLength(1);
    expect(result.promo_pool[0].customerId).toBe('cust-D');
    expect(result.vip).toHaveLength(0);
  });

  it('VIP rows include POS note string', () => {
    const result = segment(FIXTURE, NOW);
    const vipRow = result.vip.find((r) => r.customerId === 'cust-A');
    expect(vipRow).toBeDefined();
    expect(vipRow?.posNote).toBe(
      'VIP Account. Sincere thanks upon checkout. Direct table preference.',
    );
  });

  it('non-vip rows do not have posNote', () => {
    const result = segment(FIXTURE, NOW);
    const stdRow = result.standard.find((r) => r.customerId === 'cust-B');
    expect(stdRow?.posNote).toBeUndefined();
    const promoRow = result.promo_pool.find((r) => r.customerId === 'cust-C');
    expect(promoRow?.posNote).toBeUndefined();
  });

  it('returns empty result when no transactions', () => {
    const result = segment([], NOW);
    expect(result.vip).toHaveLength(0);
    expect(result.standard).toHaveLength(0);
    expect(result.promo_pool).toHaveLength(0);
    expect(result.all).toHaveLength(0);
  });

  it('ignores transactions outside the 60-day window', () => {
    const old: NormalizedTransaction[] = [
      makeTx({
        transaction_id: 'tx-old',
        customer_id: 'cust-old',
        business_date: '2023-12-01',
        timestamp: '2023-12-01T12:00:00.000Z',
      }),
    ];
    const result = segment(old, NOW);
    expect(result.all).toHaveLength(0);
  });
});
