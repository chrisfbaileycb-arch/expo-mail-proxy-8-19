/**
 * server.ts — EchoLink Express application factory.
 *
 * All dependencies are injectable for testing (verifier, n8n client, rng,
 * clock). The factory never reads env directly for secrets — callers pass
 * pre-constructed deps.
 */

import express, { type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import {
  fromCsv,
  sanitizePayload,
  AclViolationError,
  makeOrgGate,
  ORG_CONTEXT_HEADER,
  verifyOrgContext,
  type OrgContext,
  type N8nClient,
  type TraceLog,
  type VerifiedGoogleUser,
} from '@expo-proxy/shared';
import {
  enqueueLeads as _enqueueLeads,
  allocate as _allocate,
  releaseDaily,
} from './drip.js';
import { onOptIn as _onOptIn, type GratitudeLead } from './gratitude.js';
import {
  handleSegmentsRun,
  handleCampaignReconcile,
  handleCampaignRelease,
} from './campaigns-routes.js';
import { buildRedirect, type OrderingPlatform } from './portal.js';
import type { NormalizedTransaction } from '@expo-proxy/shared';
import { recordAudit, getAuditEntries } from './audit.js';
import { RateLimiter, defaultRateLimiter } from './ratelimit.js';
import { createAppStore, DurabilityError } from './app-store.js';
import { makeCorsMiddleware, makeGoogleAuth, makeHmacAuth } from './middleware.js';
import { renderDashboardHtml } from './ui.js';
import {
  playSalonGame,
  getAllSalonRewards,
  type GameType,
  type BusinessCategory,
} from './games.js';
import { generateCopilotAdvice } from './copilot.js';
import {
  BUSINESS_VIDEOS,
  SALON_VIDEOS,
  recommendVideoForContent,
} from './video-service.js';
import {
  startVideoGeneration,
  getVideoJob,
  getAllVideoJobs,
  GenerateVideoRequestSchema,
} from './video-gen.js';
import {
  dispatchEmail,
  getDispatchLogs,
  auditEmailDeliverability,
  SendEmailSchema,
} from './dispatch.js';
import { getWorkflowExecutionPlan, WORKFLOW_PLANS } from './workflow-agent.js';

// ── Body-size constants ────────────────────────────────────────────────────

const BODY_LIMIT_DEFAULT = 1 * 1024 * 1024;       // 1 MB
const BODY_LIMIT_TRANSACTIONS = 10 * 1024 * 1024;  // 10 MB (CSV ingest only)

// ── Schema definitions ─────────────────────────────────────────────────────

const LeadBody = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  source: z.string().min(1),
  // Honeypot fields — accepted but trigger fake response when non-empty
  website: z.string().optional(),
  hp: z.string().optional(),
}).refine((d) => d.phone ?? d.email, {
  message: 'At least one of phone or email is required',
});

// ── Dependency interface ───────────────────────────────────────────────────

export interface AppDeps {
  /** Verify a Google ID token; returns VerifiedGoogleUser or throws. */
  verifyGoogleToken: (token: string) => Promise<VerifiedGoogleUser>;
  /** N8n client for triggering workflows. */
  n8n: N8nClient;
  /** Injectable RNG for games (defaults to Math.random). */
  rng?: () => number;
  /** Injectable clock returning epoch ms (defaults to Date.now). */
  clock?: () => number;
  /** Signing secret for verifying inbound HMAC webhooks. */
  signingSecret: string;
  /**
   * Secret used to verify the org context header for pro-service gate.
   * Wired from N8N_SIGNING_SECRET in index.ts.
   */
  orgSecret: string;
  /** Google client IDs (comma-separated string from env). */
  googleClientIds?: string[];
  /** Optional odds config override. */
  oddsConfig?: any;
  /** Optional rewards catalog override. */
  rewardsCatalog?: any;
  /** Optional Force Protection trace log. */
  traceLog?: TraceLog;
  /**
   * Allowlisted CORS origins (from MARKETING_ORIGINS env var).
   * When set, POST /leads, /redirect honour the allowlist.
   */
  allowedOrigins?: Set<string>;
  /**
   * Injectable rate limiter — override in tests to inject a fake clock.
   */
  rateLimiter?: RateLimiter;
  /**
   * Root directory for durable storage (SnapshotStore / JsonlLog).
   * When provided, all in-memory stores are persisted and reloaded on restart.
   */
  dataDir?: string;
}

// ── In-memory lead store ──────────────────────────────────────────────────

interface StoredLead {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  source: string;
  couponCode?: string;
  isNew: boolean;
  /** Org that created this lead — set when an org context header accompanies creation. */
  orgId?: string;
}

const leadsByPhone = new Map<string, StoredLead>();
const leadsByEmail = new Map<string, StoredLead>();
const leadsById = new Map<string, StoredLead>();

/** In-memory transaction store for VIP segmenting and reconciliation. */
const storedTransactions: NormalizedTransaction[] = [];

let leadIdCounter = 1;

function generateLeadId(): string {
  return `lead-${leadIdCounter++}`;
}

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Extract the real client IP: first hop of X-Forwarded-For, or req.ip.
 * Returns '0.0.0.0' as a safe fallback.
 */
function clientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0]!.trim();
  }
  return req.ip ?? '0.0.0.0';
}

// ── Application factory ───────────────────────────────────────────────────

export function createApp(deps: AppDeps): express.Application {
  const app = express();

  // Rate limiter (injectable for testing, default otherwise)
  const rateLimiter = deps.rateLimiter ?? defaultRateLimiter;

  // Unified AppStore: loads snapshot + replays JSONL if dataDir is provided;
  // otherwise operates purely in-memory.
  const store = createAppStore({
    dataDir: deps.dataDir,
    globals: {
      leadsByPhone,
      leadsByEmail,
      leadsById,
      storedTransactions,
      generateLeadId,
      recordAudit,
      getAuditEntries,
      enqueueLeads: _enqueueLeads,
      allocate: _allocate,
      releaseDaily,
      onOptIn: _onOptIn,
    },
  });

  // Optional TraceLog: used to record FP trace events across requests.
  const _traceLog: TraceLog | null = deps.traceLog ?? null;

  // Middleware factories
  const googleAuth = makeGoogleAuth(deps);
  const orgGate = makeOrgGate('echolink', deps.orgSecret);
  const hmacAuth = makeHmacAuth(deps);

  // ── Text / CSV body parser with 10 MB limit for /ingest/transactions ───────
  app.use(
    '/ingest/transactions',
    express.text({
      limit: BODY_LIMIT_TRANSACTIONS,
      type: ['text/plain', 'text/csv', 'application/octet-stream', '*/*'],
      verify: (req, _res, buf) => {
        (req as Request & { rawBody?: string }).rawBody = buf.toString('utf8');
      },
    }),
  );

  // ── JSON body parser with 1 MB limit (default for all other routes) ─────────────
  app.use(
    express.json({
      limit: BODY_LIMIT_DEFAULT,
      verify: (req, _res, buf) => {
        (req as Request & { rawBody?: string }).rawBody = buf.toString('utf8');
      },
    }),
  );

  // ── Error handler for body-parser payload-too-large errors ────────────────
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction): void => {
    if (
      err &&
      typeof err === 'object' &&
      'type' in err &&
      (err as { type: string }).type === 'entity.too.large'
    ) {
      res.status(413).json({ error: 'payload_too_large' });
      return;
    }
    next(err);
  });

  // ── CORS for allowlisted routes ──────────────────────────────────────────
  if (deps.allowedOrigins && deps.allowedOrigins.size > 0) {
    const corsMiddleware = makeCorsMiddleware(deps.allowedOrigins);
    ['/leads', '/redirect', '/api/games/play', '/api/video-gen/generate'].forEach((route) => {
      app.options(route, corsMiddleware, (_req, res) => res.status(204).end());
      app.use(route, corsMiddleware);
    });
  }

  // ── GET /health ──────────────────────────────────────────────────────────
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'echolink' });
  });

  // ── GET / ───────────────────────────────────────────────────────────────
  app.get('/', (req: Request, res: Response) => {
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      res.type('html').send(renderDashboardHtml());
      return;
    }
    res.json({
      status: 'ok',
      service: 'expo-mail-proxy',
      message: 'Expo Mail Proxy active for Local Businesses (Retail, Dining, Fitness, Services)',
    });
  });

  // ── POST /leads ──────────────────────────────────────────────────────────
  app.post('/leads', async (req: Request, res: Response) => {
    const ip = clientIp(req);

    // FP: sanitize external input before schema validation
    let body: unknown = req.body;
    try {
      const { value } = sanitizePayload(body);
      body = value;
    } catch (err) {
      if (err instanceof AclViolationError) {
        store.recordAudit('acl_violation', ip, undefined, err.violation);
        res.status(400).json({ error: 'acl_violation', detail: err.violation });
        return;
      }
      throw err;
    }

    const parsed = LeadBody.safeParse(body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', issues: parsed.error.issues });
      return;
    }
    const { name, phone, email, source, website, hp } = parsed.data;

    // ── Honeypot check ─────────────────────────────────────────────────
    const honeypotTripped = Boolean(
      (website !== undefined && website !== '') ||
      (hp !== undefined && hp !== ''),
    );
    if (honeypotTripped) {
      const identity = email ?? phone;
      store.recordAudit('honeypot', ip, identity, `website=${website ?? ''} hp=${hp ?? ''}`);
      res.status(200).json({ ok: true });
      return;
    }

    // ── Rate limiting: IP ──────────────────────────────────────────────
    if (rateLimiter.checkIp(ip)) {
      store.recordAudit('rate_limit_ip', ip, undefined, `ip=${ip}`);
      res.status(429).json({ error: 'rate_limited' });
      return;
    }

    // ── Rate limiting: identity ────────────────────────────────────────
    const identity = email ?? phone ?? '';
    if (identity && rateLimiter.checkIdentity(identity)) {
      store.recordAudit('rate_limit_identity', ip, identity, `identity=${identity}`);
      res.status(429).json({ error: 'rate_limited' });
      return;
    }

    // Dedupe by phone or email
    let existing: StoredLead | undefined;
    if (phone) existing = store.getLeadByPhone(phone);
    if (!existing && email) existing = store.getLeadByEmail(email);

    const orgCtx: OrgContext | null = verifyOrgContext(
      req.headers[ORG_CONTEXT_HEADER] as string | undefined,
      deps.orgSecret,
    );

    let lead: StoredLead;
    if (existing) {
      lead = { ...existing, isNew: false };
    } else {
      lead = {
        id: store.nextLeadId(),
        name,
        phone,
        email,
        source,
        isNew: true,
        ...(orgCtx ? { orgId: orgCtx.orgId } : {}),
      };
      try {
        store.addLead(lead);
      } catch (err) {
        if (err instanceof DurabilityError) {
          res.status(500).json({ error: 'persistence_failed', detail: err.message });
          return;
        }
        throw err;
      }
    }

    // Trigger n8n CRM sync
    void deps.n8n.trigger('echolink-crm-sync', {
      leadId: lead.id,
      name,
      phone,
      email,
      source,
      isNew: lead.isNew,
    }).catch((err: unknown) => {
      store.recordAudit(
        'crm_sync_failed',
        ip,
        email ?? phone,
        `leadId=${lead.id} error=${(err as Error)?.message ?? String(err)}`,
      );
    });

    res.status(lead.isNew ? 201 : 200).json({
      leadId: lead.id,
      isNew: lead.isNew,
    });
  });

  // ── DEPRECATED: POST /spin ───────────────────────────────────────────────
  // Replaced by the 4 interactive business-neutral games at POST /api/games/play.
  app.post('/spin', async (req: Request, res: Response) => {
    const { leadId } = req.body || {};
    if (!leadId) {
      res.status(400).json({ error: 'Validation failed', message: 'leadId is required' });
      return;
    }

    const lead = store.getLeadById(leadId);
    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    // Gracefully route through neutral game engine for backwards compatibility
    const gameResult = playSalonGame('scratch', leadId, 'retail', deps.rng);
    lead.couponCode = gameResult.voucherCode;
    store.updateLead(lead);

    const gratitudeLead: GratitudeLead = {
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      couponCode: gameResult.voucherCode,
    };
    store.onOptIn(gratitudeLead, deps.clock);

    const legacyTier = (gameResult.reward.tier === 'grand' || gameResult.reward.tier === 'mid') ? 'highValue' : 'standard';

    res.json({
      deprecated: true,
      message: 'Spin-the-wheel is deprecated. Please migrate to /api/games/play.',
      tier: legacyTier,
      couponCode: gameResult.voucherCode,
    });
  });

  // ── GET /redirect/:couponCode ────────────────────────────────────────────
  app.get('/redirect/:couponCode', (req: Request, res: Response) => {
    const { couponCode } = req.params;
    const platform = (req.query['platform'] as OrderingPlatform | undefined) ?? 'store';
    const validPlatforms: OrderingPlatform[] = ['store', 'booking', 'promotions', 'heartland', 'toast', 'doordash'];
    if (!validPlatforms.includes(platform as OrderingPlatform)) {
      res.status(400).json({ error: `Invalid platform: ${platform}` });
      return;
    }
    const userAgent = req.headers['user-agent'] ?? '';
    try {
      const redirect = buildRedirect(couponCode, platform as OrderingPlatform, userAgent);
      res.redirect(302, redirect.url);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // ── POST /ingest/transactions ─────────────────────────────────────────────
  app.post('/ingest/transactions', hmacAuth, (req: Request, res: Response) => {
    const rawBody = (req as Request & { rawBody?: string }).rawBody ?? '';
    let csvText = rawBody;
    if (typeof req.body === 'object' && req.body !== null && typeof req.body.csv === 'string') {
      csvText = req.body.csv;
    } else if (typeof req.body === 'string') {
      try {
        const parsedJson = JSON.parse(req.body);
        if (parsedJson && typeof parsedJson.csv === 'string') {
          csvText = parsedJson.csv;
        } else {
          csvText = req.body;
        }
      } catch {
        csvText = req.body;
      }
    }

    let txs: NormalizedTransaction[];
    try {
      txs = fromCsv(csvText);
    } catch (err) {
      res.status(400).json({ error: `CSV parse failed: ${(err as Error).message}` });
      return;
    }

    store.pushTxs(...txs);
    res.json({ ingested: txs.length, total: store.txTotal() });
  });

  // ── POST /segments/run — Google-auth + pro gate + segmentation_run ack ───
  app.post('/segments/run', googleAuth, orgGate, (req: Request, res: Response) =>
    handleSegmentsRun(req, res, { store, n8n: deps.n8n, traceLog: _traceLog, clock: deps.clock }),
  );

  // ── POST /campaigns/:id/reconcile — Google-auth + pro gate + ack ─────────
  app.post('/campaigns/:id/reconcile', googleAuth, orgGate, (req: Request, res: Response) =>
    handleCampaignReconcile(req, res, {
      store,
      n8n: deps.n8n,
      traceLog: _traceLog,
      campaignId: req.params['id']!,
    }),
  );

  // ── POST /campaigns/:id/release ───────────────────────────────────────────
  app.post('/campaigns/:id/release', hmacAuth, (req: Request, res: Response) =>
    handleCampaignRelease(req, res, {
      store,
      n8n: deps.n8n,
      campaignId: req.params['id']!,
    }),
  );

  // ── GET /audit/spam — Google-auth + pro gate, returns hashed entries only ─
  app.get('/audit/spam', googleAuth, orgGate, (_req: Request, res: Response) => {
    res.json({ entries: store.getAuditEntries() });
  });

  // ── POST /lifecycle/purge — machine HMAC; purge org-scoped data ───────────
  app.post('/lifecycle/purge', hmacAuth, (req: Request, res: Response): void => {
    const body = req.body as Record<string, unknown>;
    const orgId = typeof body?.orgId === 'string' ? body.orgId.trim() : '';
    if (!orgId) {
      res.status(400).json({ error: 'orgId required' });
      return;
    }

    const purgeResult = store.purgeOrg(orgId);

    res.json({
      orgId,
      leadsRemoved: purgeResult.leadsRemoved,
      gratitudeRemoved: purgeResult.gratitudeRemoved,
      dripQueueRemoved: purgeResult.dripQueueRemoved,
    });
  });

  // ── 4 LOCAL BUSINESS GAMES ENGINE ─────────────────────────────────────────
  app.get('/api/games/rewards', (_req: Request, res: Response) => {
    res.json(getAllSalonRewards());
  });

  app.post('/api/games/play', (req: Request, res: Response) => {
    const {
      gameType = 'scratch',
      leadId,
      businessCategory = 'retail',
      salonType,
      playerAction,
    } = req.body;

    if (!leadId) {
      res.status(400).json({ error: 'leadId is required' });
      return;
    }

    const lead = store.getLeadById(leadId);
    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    const validGames: GameType[] = ['scratch', 'mystery_box', 'slot_machine', 'match_flip'];
    const chosenGame: GameType = validGames.includes(gameType) ? gameType : 'scratch';
    const chosenCategory = (businessCategory || salonType || 'retail') as string;

    const gameResult = playSalonGame(chosenGame, leadId, chosenCategory, deps.rng);

    // Save voucher code onto lead
    lead.couponCode = gameResult.voucherCode;
    store.updateLead(lead);

    // Schedule gratitude touch
    const gratitudeLead: GratitudeLead = {
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      couponCode: gameResult.voucherCode,
    };
    store.onOptIn(gratitudeLead, deps.clock);

    // Trigger n8n CRM sync
    void deps.n8n.trigger('echolink-crm-sync', {
      leadId,
      gameType: chosenGame,
      voucherCode: gameResult.voucherCode,
      rewardName: gameResult.reward.name,
      businessCategory: chosenCategory,
      playerAction,
    }).catch(() => { });

    res.json(gameResult);
  });

  // ── EMBEDDED SHORT-FORM AI VIDEO GENERATION ENGINE ───────────────────────
  app.post('/api/video-gen/generate', async (req: Request, res: Response) => {
    try {
      const parsed = GenerateVideoRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Validation failed', issues: parsed.error.issues });
        return;
      }
      const job = await startVideoGeneration(parsed.data);
      res.status(202).json(job);
    } catch (err: any) {
      res.status(500).json({ error: 'Video generation failed', message: err?.message });
    }
  });

  app.get('/api/video-gen/status/:jobId', (req: Request, res: Response) => {
    const job = getVideoJob(req.params.jobId);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    res.json(job);
  });

  app.get('/api/video-gen/history', (_req: Request, res: Response) => {
    res.json({ jobs: getAllVideoJobs() });
  });

  // ── OUTBOUND EMAIL DISPATCH PIPELINE & AUDITOR ───────────────────────────
  app.post('/api/dispatch/send', async (req: Request, res: Response) => {
    try {
      const parsed = SendEmailSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Validation failed', issues: parsed.error.issues });
        return;
      }
      const result = await dispatchEmail(parsed.data);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: 'Email dispatch failed', message: err?.message });
    }
  });

  app.get('/api/dispatch/logs', (_req: Request, res: Response) => {
    res.json({ logs: getDispatchLogs() });
  });

  app.post('/api/dispatch/verify', (req: Request, res: Response) => {
    const { subject = '', htmlBody = '' } = req.body;
    const audit = auditEmailDeliverability(subject, htmlBody);
    res.json(audit);
  });

  // ── AI CO-PILOT AGENT API ─────────────────────────────────────────────────
  app.post('/api/copilot', async (req: Request, res: Response) => {
    try {
      const {
        prompt,
        businessCategory,
        salonType,
        currentWorkflow,
        campaignTopic,
        history,
      } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'prompt is required' });
        return;
      }

      const response = await generateCopilotAdvice({
        prompt,
        businessCategory: businessCategory || salonType || 'retail',
        currentWorkflow,
        campaignTopic,
        history,
      });
      res.json(response);
    } catch (err: any) {
      res.status(500).json({ error: 'Copilot generation failed', message: err?.message });
    }
  });

  // ── VIDEO LIBRARY & END-VIDEO RECOMMENDER ──────────────────────────────────
  app.get('/api/videos', (_req: Request, res: Response) => {
    res.json(BUSINESS_VIDEOS);
  });

  app.post('/api/video-recommendation', (req: Request, res: Response) => {
    const { topic = '', audience = '', businessCategory = 'general', salonType } = req.body;
    const cat = businessCategory || salonType || 'general';
    const recommendation = recommendVideoForContent(topic, audience, cat);
    res.json(recommendation);
  });

  // ── WORKFLOW STEP-THROUGH AGENT API ────────────────────────────────────────
  app.get('/api/workflows', (_req: Request, res: Response) => {
    res.json(WORKFLOW_PLANS);
  });

  app.get('/api/workflows/:workflowKey', (req: Request, res: Response) => {
    const plan = getWorkflowExecutionPlan(req.params.workflowKey);
    res.json(plan);
  });

  app.post('/api/workflows/step', (req: Request, res: Response) => {
    const { workflowKey = 'crm-sync', stepIndex = 0 } = req.body;
    const plan = getWorkflowExecutionPlan(workflowKey);
    const step = plan.steps[stepIndex] || plan.steps[0];
    res.json({
      workflowKey,
      stepIndex,
      step,
      isLastStep: stepIndex >= plan.steps.length - 1,
      totalSteps: plan.steps.length,
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}

/** Clear all in-memory state (for testing). */
export function clearServerState(): void {
  leadsByPhone.clear();
  leadsByEmail.clear();
  leadsById.clear();
  storedTransactions.length = 0;
  leadIdCounter = 1;
}

/** Directly inject transactions for testing (bypasses CSV). */
export function injectTransactions(txs: NormalizedTransaction[]): void {
  storedTransactions.push(...txs);
}

// Re-export for persistence failure tests.
export { DurabilityError };
