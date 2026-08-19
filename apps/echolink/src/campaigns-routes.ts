/**
 * campaigns-routes.ts — Campaign, segment, and drip route handlers.
 * Extracted from server.ts to keep that file under 500 lines.
 */
import { type Request, type Response } from 'express';
import { z } from 'zod';
import { requireDisclaimerAck, type N8nClient, type TraceLog } from '@expo-proxy/shared';
import { segment } from './vip.js';
import { reconcileCampaign, type GratitudeLead } from './gratitude.js';
import type { Lead } from './drip.js';
import type { AppStore } from './app-store.js';

// ── Shared schema for registrant items ───────────────────────────────────────
const RegistrantSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  couponCode: z.string(),
});

// ── POST /segments/run ────────────────────────────────────────────────────────

export async function handleSegmentsRun(
  req: Request,
  res: Response,
  opts: {
    store: AppStore;
    n8n: Pick<N8nClient, 'trigger'>;
    traceLog: TraceLog | null;
    clock?: () => number;
  },
): Promise<void> {
  let ackPassed = false;
  requireDisclaimerAck('segmentation_run')(req, res, () => { ackPassed = true; });
  if (!ackPassed) return;

  const now = opts.clock ? new Date(opts.clock()) : new Date();
  const result = segment(opts.store.allTxs(), now);

  if (opts.traceLog) {
    opts.traceLog.record({
      action: 'segments.run',
      metadata: { vip: result.vip.length, standard: result.standard.length, promo_pool: result.promo_pool.length },
    });
  }

  void opts.n8n.trigger('echolink-vip-notes', {
    vip: result.vip.map((r) => ({ customerId: r.customerId, posNote: r.posNote, score: r.score })),
    counts: { vip: result.vip.length, standard: result.standard.length, promo_pool: result.promo_pool.length },
  }).catch(() => { });

  res.json({
    vip: result.vip,
    standard: result.standard,
    promo_pool: result.promo_pool,
    counts: { vip: result.vip.length, standard: result.standard.length, promo_pool: result.promo_pool.length },
  });
}

// ── POST /campaigns/:id/reconcile ─────────────────────────────────────────────

export async function handleCampaignReconcile(
  req: Request,
  res: Response,
  opts: {
    store: AppStore;
    n8n: Pick<N8nClient, 'trigger'>;
    traceLog: TraceLog | null;
    campaignId: string;
  },
): Promise<void> {
  let ackPassed = false;
  requireDisclaimerAck('segmentation_run')(req, res, () => { ackPassed = true; });
  if (!ackPassed) return;

  const schema = z.object({ registrants: z.array(RegistrantSchema) });
  const parsedBody = schema.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ error: 'Validation failed', issues: parsedBody.error.issues });
    return;
  }

  const result = reconcileCampaign(parsedBody.data.registrants, opts.store.allTxs());

  if (opts.traceLog) {
    opts.traceLog.record({
      action: 'campaign.reconcile',
      subject: opts.campaignId,
      metadata: { pathA: result.pathA_unredeemed.length, pathB: result.pathB_redeemed.length },
    });
  }

  void opts.n8n.trigger('echolink-gratitude-video', {
    campaignId: opts.campaignId,
    pathA_unredeemed: result.pathA_unredeemed,
    pathB_redeemed: result.pathB_redeemed,
  }).catch(() => { });

  res.json({
    campaignId: opts.campaignId,
    pathA_count: result.pathA_unredeemed.length,
    pathB_count: result.pathB_redeemed.length,
    pathA_unredeemed: result.pathA_unredeemed,
    pathB_redeemed: result.pathB_redeemed,
  });
}

// ── POST /campaigns/:id/release ───────────────────────────────────────────────

const ReleaseDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  leads: z.array(RegistrantSchema.extend({ couponCode: z.string() })).optional(),
  days: z.number().int().positive().optional(),
});

export async function handleCampaignRelease(
  req: Request,
  res: Response,
  opts: {
    store: AppStore;
    n8n: Pick<N8nClient, 'trigger'>;
    campaignId: string;
  },
): Promise<void> {
  const parsed = ReleaseDaySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', issues: parsed.error.issues });
    return;
  }

  const { date, leads, days } = parsed.data;
  const releaseDate = date ?? new Date().toISOString().slice(0, 10);

  if (leads && leads.length > 0) {
    opts.store.enqueueLeads(opts.campaignId, leads as Lead[]);
    opts.store.allocate(opts.campaignId, days ?? 30);
  }

  let batch: ReturnType<AppStore['releaseDaily']>;
  try {
    batch = opts.store.releaseDaily(opts.campaignId, releaseDate);
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
    return;
  }

  void opts.n8n.trigger('echolink-drip-send', {
    campaignId: opts.campaignId,
    date: releaseDate,
    batch,
  }).catch(() => { });

  res.json({ campaignId: opts.campaignId, date: releaseDate, released: batch.length, batch });
}
