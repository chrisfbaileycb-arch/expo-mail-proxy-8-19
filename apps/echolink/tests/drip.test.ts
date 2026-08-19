/**
 * drip.test.ts — Tests for the slow-trickle drip campaign queue.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  enqueueLeads,
  allocate,
  releaseDaily,
  clearCampaigns,
  DRIP_PROCESS_TYPE,
  type Lead,
} from '../src/drip.js';
import { isCadenceExempt } from '@expo-proxy/shared';

function makeLeads(count: number, prefix = 'lead'): Lead[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i + 1}`,
    phone: `555-${String(i + 1).padStart(4, '0')}`,
    couponCode: `CODE-${prefix.toUpperCase()}-${i + 1}`,
  }));
}

describe('drip — slow-trickle campaign queue', () => {
  beforeEach(() => {
    clearCampaigns();
  });

  it('3000 leads / 30 days → exactly 100 per day', () => {
    const campaignId = 'camp-test-100';
    enqueueLeads(campaignId, makeLeads(3000));
    const rate = allocate(campaignId, 30);
    expect(rate).toBe(100); // ceil(3000/30)

    const batch = releaseDaily(campaignId, '2024-03-01');
    expect(batch).toHaveLength(100);
  });

  it('same-day double release returns empty second time (idempotent)', () => {
    const campaignId = 'camp-idempotent';
    enqueueLeads(campaignId, makeLeads(300));
    allocate(campaignId, 30);

    const first = releaseDaily(campaignId, '2024-03-01');
    const second = releaseDaily(campaignId, '2024-03-01');

    expect(first.length).toBeGreaterThan(0);
    expect(second).toHaveLength(0);
  });

  it('releases leads sequentially across days', () => {
    const campaignId = 'camp-sequential';
    enqueueLeads(campaignId, makeLeads(30));
    allocate(campaignId, 30); // 1 per day

    const day1 = releaseDaily(campaignId, '2024-03-01');
    const day2 = releaseDaily(campaignId, '2024-03-02');
    const day3 = releaseDaily(campaignId, '2024-03-03');

    expect(day1).toHaveLength(1);
    expect(day2).toHaveLength(1);
    expect(day3).toHaveLength(1);
    // Leads should be sequential, no overlap
    expect(day1[0].id).not.toBe(day2[0].id);
    expect(day2[0].id).not.toBe(day3[0].id);
  });

  it('each released lead includes videoPayload', () => {
    const campaignId = 'camp-payload';
    enqueueLeads(campaignId, makeLeads(10));
    allocate(campaignId, 10);

    const batch = releaseDaily(campaignId, '2024-03-01');
    expect(batch[0]).toHaveProperty('videoPayload');
    expect(batch[0].videoPayload).toHaveProperty('videoUrl');
    expect(batch[0].videoPayload).toHaveProperty('revealAtSeconds', 14);
    expect(batch[0].videoPayload).toHaveProperty('couponCode');
  });

  it('ceil ensures all leads are eventually released even for non-divisible counts', () => {
    const campaignId = 'camp-ceil';
    // 31 leads / 30 days = ceil(31/30) = 2 per day → day 1: 2, day 2: 2, ..., day 15: 2, day 16: 1, day 17+: 0
    enqueueLeads(campaignId, makeLeads(31));
    const rate = allocate(campaignId, 30);
    expect(rate).toBe(2);

    let totalReleased = 0;
    for (let d = 1; d <= 30; d++) {
      const date = `2024-03-${String(d).padStart(2, '0')}`;
      const batch = releaseDaily(campaignId, date);
      totalReleased += batch.length;
    }
    expect(totalReleased).toBe(31);
  });

  it('throws if campaign not found', () => {
    expect(() => releaseDaily('nonexistent', '2024-01-01')).toThrow('Campaign nonexistent not found');
  });

  it('throws if campaign not allocated', () => {
    enqueueLeads('camp-unalloc', makeLeads(5));
    expect(() => releaseDaily('camp-unalloc', '2024-01-01')).toThrow('not allocated yet');
  });
});

// ---------------------------------------------------------------------------
// Cadence decoupling — the 30-day drip track is exempt from weekly cadence
// ---------------------------------------------------------------------------

describe('DRIP_PROCESS_TYPE cadence exemption', () => {
  it('DRIP_PROCESS_TYPE is "marketing.spin_wheel_30d"', () => {
    expect(DRIP_PROCESS_TYPE).toBe('marketing.spin_wheel_30d');
  });

  it('isCadenceExempt(DRIP_PROCESS_TYPE) === true', () => {
    expect(isCadenceExempt(DRIP_PROCESS_TYPE)).toBe(true);
  });

  it('non-drip process types are NOT cadence-exempt', () => {
    expect(isCadenceExempt('marketing.weekly_email')).toBe(false);
    expect(isCadenceExempt('budget.reconcile')).toBe(false);
  });
});
