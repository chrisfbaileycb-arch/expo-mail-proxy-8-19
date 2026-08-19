/**
 * gratitude.test.ts — Tests for gratitude loop and reconciliation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  onOptIn,
  dueTouches,
  reconcileCampaign,
  clearPending,
  type GratitudeLead,
} from '../src/gratitude.js';
import type { NormalizedTransaction } from '@expo-proxy/shared';

const BASE_LEAD: GratitudeLead = {
  id: 'lead-1',
  name: 'Alice',
  phone: '555-1234',
  couponCode: 'HV-BOGO-ABCDEF',
};

function makeLead(overrides: Partial<GratitudeLead>): GratitudeLead {
  return { ...BASE_LEAD, ...overrides };
}

function makeTx(promoCode?: string): NormalizedTransaction {
  return {
    transaction_id: `tx-${Math.random()}`,
    source_pos: 'Toast',
    business_date: '2024-03-15',
    timestamp: '2024-03-15T18:00:00.000Z',
    gross_sales: 50,
    net_sales: 45,
    discounts_applied: promoCode ? 5 : 0,
    adjustments: 0,
    taxes_collected: 4,
    tips: 3,
    payment_method: 'Credit_Visa',
    auth_code: 'AUTH99',
    customer_id: 'cust-X',
    modifiers_json: [],
    promo_code: promoCode,
  };
}

describe('gratitude — opt-in scheduling', () => {
  beforeEach(() => {
    clearPending();
  });

  it('schedules a touch after GRATITUDE_DELAY_MS', () => {
    const now = 1000000;
    const delay = Number(process.env.GRATITUDE_DELAY_MS ?? 4 * 60 * 60 * 1000);
    onOptIn(BASE_LEAD, () => now);

    // Not due yet
    const notYet = dueTouches(now + delay - 1);
    expect(notYet).toHaveLength(0);

    // Now due
    const due = dueTouches(now + delay);
    expect(due).toHaveLength(1);
    expect(due[0].id).toBe(BASE_LEAD.id);
  });

  it('drains touches only once per call', () => {
    const now = 0;
    onOptIn(BASE_LEAD, () => now);

    const due1 = dueTouches(now + 999999999);
    const due2 = dueTouches(now + 999999999);

    expect(due1).toHaveLength(1);
    expect(due2).toHaveLength(0);
  });

  it('only returns touches that are due (not future ones)', () => {
    const now = 1000000;
    const delay = Number(process.env.GRATITUDE_DELAY_MS ?? 4 * 60 * 60 * 1000);

    onOptIn(makeLead({ id: 'lead-early', couponCode: 'CODE-1' }), () => now);
    onOptIn(makeLead({ id: 'lead-later', couponCode: 'CODE-2' }), () => now + delay + 1000);

    const due = dueTouches(now + delay);
    expect(due).toHaveLength(1);
    expect(due[0].id).toBe('lead-early');
  });
});

describe('gratitude — reconcileCampaign', () => {
  it('splits redeemed vs unredeemed correctly', () => {
    const registrants: GratitudeLead[] = [
      makeLead({ id: 'r1', couponCode: 'CODE-REDEEMED' }),
      makeLead({ id: 'r2', couponCode: 'CODE-NOT-REDEEMED' }),
      makeLead({ id: 'r3', couponCode: 'CODE-ALSO-REDEEMED' }),
    ];

    const txs: NormalizedTransaction[] = [
      makeTx('CODE-REDEEMED'),
      makeTx('CODE-ALSO-REDEEMED'),
      makeTx(), // no promo
    ];

    const result = reconcileCampaign(registrants, txs);

    expect(result.pathB_redeemed).toHaveLength(2);
    expect(result.pathA_unredeemed).toHaveLength(1);
    expect(result.pathB_redeemed.map((r) => r.id)).toContain('r1');
    expect(result.pathB_redeemed.map((r) => r.id)).toContain('r3');
    expect(result.pathA_unredeemed[0].id).toBe('r2');
  });

  it('case-insensitive coupon code matching', () => {
    const registrants: GratitudeLead[] = [
      makeLead({ id: 'r1', couponCode: 'HV-BOGO-ABCDEF' }),
    ];
    const txs: NormalizedTransaction[] = [
      makeTx('hv-bogo-abcdef'), // lowercase in POS
    ];

    const result = reconcileCampaign(registrants, txs);
    expect(result.pathB_redeemed).toHaveLength(1);
    expect(result.pathA_unredeemed).toHaveLength(0);
  });

  it('returns all unredeemed when no transactions have promo codes', () => {
    const registrants: GratitudeLead[] = [
      makeLead({ id: 'r1', couponCode: 'CODE-A' }),
      makeLead({ id: 'r2', couponCode: 'CODE-B' }),
    ];
    const txs: NormalizedTransaction[] = [makeTx(), makeTx()];

    const result = reconcileCampaign(registrants, txs);
    expect(result.pathA_unredeemed).toHaveLength(2);
    expect(result.pathB_redeemed).toHaveLength(0);
  });

  it('handles empty registrants', () => {
    const result = reconcileCampaign([], [makeTx('ANY-CODE')]);
    expect(result.pathA_unredeemed).toHaveLength(0);
    expect(result.pathB_redeemed).toHaveLength(0);
  });
});
