/**
 * vip.ts — Weekly RFMD VIP segmenting engine.
 *
 * Computes Frequency, Value, Sensitivity-to-discount, and Recency scores
 * for each customer over a 60-day rolling window, then normalises and weighs
 * them per the RFMD blueprint to produce a VIP score and segment assignment.
 *
 * Published weights:  VIP = 0.3·Fn + 0.3·Vn − 0.4·S + 0.1·Rn
 *   Fn  = min-max normalised distinct visits (higher = better)
 *   Vn  = min-max normalised average ticket  (higher = better)
 *   S   = discounted orders / total orders   (higher = more discount-sensitive, penalty)
 *   Rn  = max(0, 60 − daysSinceLast) / 60   (fresher = higher, range [0,1])
 */

import type { NormalizedTransaction } from '@expo-proxy/shared';

export interface VipRow {
  customerId: string;
  frequency: number;
  avgTicket: number;
  sensitivity: number;
  recencyNorm: number;
  score: number;
  segment: 'vip' | 'standard' | 'promo_pool';
  /** Present only for 'vip' segment rows. */
  posNote?: string;
}

export interface SegmentResult {
  vip: VipRow[];
  standard: VipRow[];
  promo_pool: VipRow[];
  all: VipRow[];
}

const WINDOW_DAYS = 60;
const VIP_THRESHOLD = Number(process.env.VIP_THRESHOLD ?? 0.5);
const PROMO_POOL_THRESHOLD = 0.70;
const POS_NOTE = 'VIP Account. Sincere thanks upon checkout. Direct table preference.';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysBetween(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime()) / MS_PER_DAY;
}

/** min-max normalise an array; returns 0 for all-equal cohorts. */
function minMaxNorm(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 0);
  return values.map((v) => (v - min) / (max - min));
}

/**
 * Run RFMD segmenting over a transaction dataset.
 *
 * @param txs       All transactions to consider (older than 60 days ignored).
 * @param now       Reference date for the rolling window (defaults to today).
 */
export function segment(txs: NormalizedTransaction[], now: Date = new Date()): SegmentResult {
  // ── 1. Filter to the rolling window ────────────────────────────────────────
  const cutoff = new Date(now.getTime() - WINDOW_DAYS * MS_PER_DAY);

  const recent = txs.filter((tx) => {
    const d = new Date(tx.timestamp);
    return d >= cutoff && d <= now;
  });

  if (recent.length === 0) {
    return { vip: [], standard: [], promo_pool: [], all: [] };
  }

  // ── 2. Aggregate per customer ───────────────────────────────────────────────
  const map = new Map<
    string,
    {
      visits: Set<string>; // distinct business_date strings
      totalTicket: number;
      ticketCount: number;
      discountedCount: number;
      lastDate: Date;
    }
  >();

  for (const tx of recent) {
    const id = tx.customer_id;
    if (!id) continue;
    if (!map.has(id)) {
      map.set(id, {
        visits: new Set(),
        totalTicket: 0,
        ticketCount: 0,
        discountedCount: 0,
        lastDate: new Date(0),
      });
    }
    const row = map.get(id)!;
    row.visits.add(tx.business_date);
    row.totalTicket += tx.net_sales;
    row.ticketCount += 1;
    if (tx.discounts_applied > 0) row.discountedCount += 1;
    const txDate = new Date(tx.timestamp);
    if (txDate > row.lastDate) row.lastDate = txDate;
  }

  const customerIds = [...map.keys()];
  if (customerIds.length === 0) {
    return { vip: [], standard: [], promo_pool: [], all: [] };
  }

  // ── 3. Compute raw metrics ─────────────────────────────────────────────────
  const rawFrequency = customerIds.map((id) => map.get(id)!.visits.size);
  const rawAvgTicket = customerIds.map((id) => {
    const r = map.get(id)!;
    return r.ticketCount > 0 ? r.totalTicket / r.ticketCount : 0;
  });
  const sensitivity = customerIds.map((id) => {
    const r = map.get(id)!;
    return r.ticketCount > 0 ? r.discountedCount / r.ticketCount : 0;
  });
  const recencyNorm = customerIds.map((id) => {
    const days = daysBetween(now, map.get(id)!.lastDate);
    return Math.max(0, (WINDOW_DAYS - days) / WINDOW_DAYS);
  });

  // ── 4. Normalise ───────────────────────────────────────────────────────────
  const normF = minMaxNorm(rawFrequency);
  const normV = minMaxNorm(rawAvgTicket);

  // ── 5. Score & segment ─────────────────────────────────────────────────────
  const rows: VipRow[] = customerIds.map((id, i) => {
    const S = sensitivity[i];
    const score = 0.3 * normF[i] + 0.3 * normV[i] - 0.4 * S + 0.1 * recencyNorm[i];

    let seg: VipRow['segment'];
    if (S >= PROMO_POOL_THRESHOLD) {
      seg = 'promo_pool';
    } else if (score >= VIP_THRESHOLD) {
      seg = 'vip';
    } else {
      seg = 'standard';
    }

    const row: VipRow = {
      customerId: id,
      frequency: rawFrequency[i],
      avgTicket: rawAvgTicket[i],
      sensitivity: S,
      recencyNorm: recencyNorm[i],
      score,
      segment: seg,
    };
    if (seg === 'vip') row.posNote = POS_NOTE;
    return row;
  });

  const result: SegmentResult = {
    vip: rows.filter((r) => r.segment === 'vip'),
    standard: rows.filter((r) => r.segment === 'standard'),
    promo_pool: rows.filter((r) => r.segment === 'promo_pool'),
    all: rows,
  };
  return result;
}
