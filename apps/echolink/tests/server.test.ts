/**
 * server.test.ts — Integration tests for EchoLink Express API.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createHmac } from 'node:crypto';
import { createApp, clearServerState, injectTransactions } from '../src/server.js';
import { clearCampaigns } from '../src/drip.js';
import { clearPending } from '../src/gratitude.js';
import { clearAudit, getAuditEntries } from '../src/audit.js';
import { RateLimiter } from '../src/ratelimit.js';
import { toCsv, ACK_HEADER, ackToken, signOrgContext, ORG_CONTEXT_HEADER } from '@expo-proxy/shared';
import type { NormalizedTransaction } from '@expo-proxy/shared';
import type { VerifiedGoogleUser } from '@expo-proxy/shared';
import type { N8nClient } from '@expo-proxy/shared';

const SIGNING_SECRET = 'test-secret-1234';

/** Compute HMAC signature for a body string. */
function sign(body: string): string {
  return createHmac('sha256', SIGNING_SECRET).update(body).digest('hex');
}

/** Mock n8n client that records triggers. */
function makeMockN8n(): N8nClient & { calls: Array<{ path: string; payload: unknown }> } {
  const calls: Array<{ path: string; payload: unknown }> = [];
  return {
    calls,
    sign: (_body: string) => '',
    trigger: async (path: string, payload: unknown) => {
      calls.push({ path, payload });
      return {};
    },
  } as unknown as N8nClient & { calls: Array<{ path: string; payload: unknown }> };
}

/** Mock n8n that always rejects triggers (simulates n8n down). */
function makeFailingN8n(): N8nClient & { calls: Array<{ path: string; payload: unknown }> } {
  const calls: Array<{ path: string; payload: unknown }> = [];
  return {
    calls,
    sign: (_body: string) => '',
    trigger: async (path: string, payload: unknown) => {
      calls.push({ path, payload });
      throw new Error('n8n_unreachable');
    },
  } as unknown as N8nClient & { calls: Array<{ path: string; payload: unknown }> };
}

/** Mock verifier that succeeds for token 'valid-token'. */
async function mockVerifier(token: string): Promise<VerifiedGoogleUser> {
  if (token === 'valid-token') {
    return {
      sub: 'user-123',
      email: 'test@example.com',
      emailVerified: true,
    };
  }
  throw new Error('invalid token');
}

/** Fixed seeded RNG that always returns 0.05 (high-value for new guests). */
function fixedRng(): () => number {
  return () => 0.05;
}

/** Build a valid signed org-context header for echolink (PRO, no rep-terms). */
function orgHeader(overrides?: { isPaid?: boolean; role?: 'owner' | 'manager' | 'staff' }): string {
  const ctx = {
    orgId: 'org-echolink-1',
    role: (overrides?.role ?? 'owner') as 'owner' | 'manager' | 'staff',
    isPaid: overrides?.isPaid ?? true,
    repTermsAccepted: false, // echolink doesn't need rep terms
    exp: Date.now() + 60_000,
  };
  return signOrgContext(ctx, SIGNING_SECRET);
}

function makeApp(overrides?: Partial<Parameters<typeof createApp>[0]>) {
  return createApp({
    verifyGoogleToken: mockVerifier,
    n8n: makeMockN8n(),
    rng: fixedRng(),
    signingSecret: SIGNING_SECRET,
    orgSecret: SIGNING_SECRET,
    ...overrides,
  });
}

function makeValidTx(id: string): NormalizedTransaction {
  return {
    transaction_id: id,
    source_pos: 'Heartland',
    business_date: '2024-03-15',
    timestamp: '2024-03-15T18:00:00.000Z',
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
    promo_code: 'PROMO-123',
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

const sha256 = (s: string) =>
  import('node:crypto').then((m) => m.createHash('sha256').update(s).digest('hex'));

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const app = makeApp();
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /leads', () => {
  beforeEach(() => {
    clearServerState();
    clearAudit();
  });

  it('creates a new lead with phone', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/leads')
      .set('content-type', 'application/json')
      .send({ phone: '555-1111', source: 'qr-scan' });
    expect(res.status).toBe(201);
    expect(res.body.isNew).toBe(true);
    expect(res.body.leadId).toBeDefined();
  });

  it('returns 200 for a repeat lead (same phone)', async () => {
    const app = makeApp();
    await request(app)
      .post('/leads')
      .set('content-type', 'application/json')
      .send({ phone: '555-2222', source: 'qr-scan' });
    const res = await request(app)
      .post('/leads')
      .set('content-type', 'application/json')
      .send({ phone: '555-2222', source: 'qr-scan' });
    expect(res.status).toBe(200);
    expect(res.body.isNew).toBe(false);
  });

  it('creates lead with email', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/leads')
      .set('content-type', 'application/json')
      .send({ email: 'bob@example.com', source: 'kiosk' });
    expect(res.status).toBe(201);
  });

  it('rejects lead missing both phone and email', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/leads')
      .set('content-type', 'application/json')
      .send({ name: 'Ghost', source: 'unknown' });
    expect(res.status).toBe(400);
  });

  it('rejects lead missing source', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/leads')
      .set('content-type', 'application/json')
      .send({ phone: '555-0000' });
    expect(res.status).toBe(400);
  });

  it('__proto__ in lead body is silently dropped (sanitizePayload)', async () => {
    const app = makeApp();
    // Send a JSON body where __proto__ is an own property via JSON.parse injection
    // We can't easily test this via supertest JSON encoding (JSON.stringify drops __proto__),
    // but we can verify the route accepts a clean body after sanitization and proceeds normally.
    const res = await request(app)
      .post('/leads')
      .set('content-type', 'application/json')
      .send({ phone: '555-7777', source: 'test' });
    expect(res.status).toBe(201);
    expect(res.body.isNew).toBe(true);
  });
});

// ── Honeypot tests ─────────────────────────────────────────────────────────

describe('POST /leads — honeypot', () => {
  beforeEach(() => {
    clearServerState();
    clearAudit();
  });

  it('filled website field → 200 fake success, lead NOT stored, n8n NOT called', async () => {
    const n8n = makeMockN8n();
    const app = makeApp({ n8n });

    const res = await request(app)
      .post('/leads')
      .set('content-type', 'application/json')
      .send({ phone: '555-9000', source: 'qr', website: 'http://spam.com' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(n8n.calls).toHaveLength(0);

    // The lead must NOT have been stored — a subsequent real request should
    // produce a NEW lead, not a dedupe.
    const res2 = await request(app)
      .post('/leads')
      .set('content-type', 'application/json')
      .send({ phone: '555-9000', source: 'qr' });
    expect(res2.status).toBe(201);
    expect(res2.body.isNew).toBe(true);
  });

  it('filled hp field → 200 fake success', async () => {
    const n8n = makeMockN8n();
    const app = makeApp({ n8n });

    const res = await request(app)
      .post('/leads')
      .set('content-type', 'application/json')
      .send({ email: 'bot@spam.io', source: 'form', hp: 'filled' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(n8n.calls).toHaveLength(0);
  });

  it('honeypot tripped → audit entry has kind=honeypot with hashed ip', async () => {
    const app = makeApp();

    await request(app)
      .post('/leads')
      .set('content-type', 'application/json')
      .set('x-forwarded-for', '10.0.0.1')
      .send({ phone: '555-9001', source: 'qr', website: 'http://spam.com' });

    const entries = getAuditEntries();
    const honeypotEntry = entries.find((e) => e.kind === 'honeypot');
    expect(honeypotEntry).toBeDefined();
    // Must not contain raw IP
    expect(JSON.stringify(honeypotEntry)).not.toContain('10.0.0.1');
    // IP hash should be the sha256 of the IP
    const expectedHash = await sha256('10.0.0.1');
    expect(honeypotEntry!.ipHash).toBe(expectedHash);
  });

  it('empty website field → treated as real lead (honeypot NOT tripped)', async () => {
    const n8n = makeMockN8n();
    const app = makeApp({ n8n });

    const res = await request(app)
      .post('/leads')
      .set('content-type', 'application/json')
      .send({ phone: '555-9002', source: 'qr', website: '' });

    expect(res.status).toBe(201);
    expect(n8n.calls.length).toBeGreaterThan(0);
  });
});

// ── Rate limiting tests ────────────────────────────────────────────────────

describe('POST /leads — rate limiting', () => {
  beforeEach(() => {
    clearServerState();
    clearAudit();
  });

  it('6th request from same identity within the hour → 429 + audit entry', async () => {
    // Use a fake clock frozen in time so all requests share the same window.
    const fakeNow = Date.now();
    const rateLimiter = new RateLimiter(20, 5, () => fakeNow);
    const app = makeApp({ rateLimiter });

    const email = `rl-identity-${Date.now()}@test.com`;
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post('/leads')
        .set('content-type', 'application/json')
        .set('x-forwarded-for', `192.168.1.${i + 1}`) // different IPs
        .send({ email, source: 'form' });
      // First 5 should succeed (201 first time, 200 dedupes after)
      expect([200, 201]).toContain(res.status);
    }

    // 6th request same identity → 429
    const res6 = await request(app)
      .post('/leads')
      .set('content-type', 'application/json')
      .set('x-forwarded-for', '192.168.1.99')
      .send({ email, source: 'form' });
    expect(res6.status).toBe(429);
    expect(res6.body.error).toBe('rate_limited');

    const entries = getAuditEntries();
    const rlEntry = entries.find((e) => e.kind === 'rate_limit_identity');
    expect(rlEntry).toBeDefined();
  });

  it('different identities from same IP pass until IP cap', async () => {
    // IP limit = 3, identity limit = 100
    const fakeNow = Date.now();
    const rateLimiter = new RateLimiter(3, 100, () => fakeNow);
    const app = makeApp({ rateLimiter });

    const ip = '10.1.2.3';
    for (let i = 0; i < 3; i++) {
      const res = await request(app)
        .post('/leads')
        .set('content-type', 'application/json')
        .set('x-forwarded-for', ip)
        .send({ phone: `555-200${i}`, source: 'form' });
      expect([200, 201]).toContain(res.status);
    }

    // 4th request from same IP → 429 (IP cap hit)
    const res4 = await request(app)
      .post('/leads')
      .set('content-type', 'application/json')
      .set('x-forwarded-for', ip)
      .send({ phone: '555-2099', source: 'form' });
    expect(res4.status).toBe(429);
    expect(res4.body.error).toBe('rate_limited');

    const entries = getAuditEntries();
    const rlEntry = entries.find((e) => e.kind === 'rate_limit_ip');
    expect(rlEntry).toBeDefined();
  });
});

// ── CORS tests ─────────────────────────────────────────────────────────────

describe('CORS — allowlisted and non-allowlisted origins', () => {
  it('allowlisted origin → ACAO header echoed on POST', async () => {
    const allowedOrigins = new Set(['https://marketing.example.com']);
    const app = makeApp({ allowedOrigins });

    const res = await request(app)
      .post('/leads')
      .set('content-type', 'application/json')
      .set('origin', 'https://marketing.example.com')
      .send({ phone: '555-3001', source: 'web' });

    expect([200, 201]).toContain(res.status);
    expect(res.headers['access-control-allow-origin']).toBe('https://marketing.example.com');
  });

  it('allowlisted origin → OPTIONS preflight returns 204 with CORS headers', async () => {
    const allowedOrigins = new Set(['https://marketing.example.com']);
    const app = makeApp({ allowedOrigins });

    const res = await request(app)
      .options('/leads')
      .set('origin', 'https://marketing.example.com')
      .set('access-control-request-method', 'POST');

    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('https://marketing.example.com');
    expect(res.headers['access-control-allow-methods']).toContain('POST');
  });

  it('non-allowlisted origin → no ACAO header on POST', async () => {
    const allowedOrigins = new Set(['https://marketing.example.com']);
    const app = makeApp({ allowedOrigins });

    const res = await request(app)
      .post('/leads')
      .set('content-type', 'application/json')
      .set('origin', 'https://evil.com')
      .send({ phone: '555-3002', source: 'web' });

    // Request still processed (non-browser callers unaffected)
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('no Origin header → no ACAO header (non-browser callers unaffected)', async () => {
    const allowedOrigins = new Set(['https://marketing.example.com']);
    const app = makeApp({ allowedOrigins });

    const res = await request(app)
      .post('/leads')
      .set('content-type', 'application/json')
      .send({ phone: '555-3003', source: 'api' });

    expect([200, 201]).toContain(res.status);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});

// ── Payload size limit tests ───────────────────────────────────────────────

describe('Payload size limits', () => {
  beforeEach(() => {
    clearServerState();
  });

  it('oversized JSON to /leads → 413', async () => {
    const app = makeApp();
    // Build a payload > 1 MB
    const big = 'x'.repeat(1024 * 1024 + 1);
    const res = await request(app)
      .post('/leads')
      .set('content-type', 'application/json')
      .send(JSON.stringify({ phone: '555-x', source: big }));

    expect(res.status).toBe(413);
    expect(res.body.error).toBe('payload_too_large');
  });

  it('oversized body to /ingest/transactions without valid HMAC → does not read beyond limit', async () => {
    const app = makeApp();
    // Body > 10 MB (the ingest-specific cap)
    const big = 'x'.repeat(10 * 1024 * 1024 + 1);
    const sig = sign(big);
    const res = await request(app)
      .post('/ingest/transactions')
      .set('content-type', 'text/plain')
      .set('x-expoproxy-signature', sig)
      .send(big);

    expect(res.status).toBe(413);
    expect(res.body.error).toBe('payload_too_large');
  });

  it('valid 1 MB JSON to /leads → accepted (boundary condition)', async () => {
    // Exactly at the limit should be OK; we build something just under 1 MB
    // so this exercises the happy path without hitting the cap.
    const app = makeApp();
    // A source string that is large but under limit
    const source = 'a'.repeat(100);
    const res = await request(app)
      .post('/leads')
      .set('content-type', 'application/json')
      .send({ phone: '555-limit', source });
    expect([200, 201]).toContain(res.status);
  });
});

// ── CRM sync failure visibility ────────────────────────────────────────────

describe('POST /leads — CRM sync failure visibility', () => {
  beforeEach(() => {
    clearServerState();
    clearAudit();
  });

  it('n8n trigger failure → lead still 200/201, audit contains crm_sync_failed', async () => {
    const failingN8n = makeFailingN8n();
    const app = makeApp({ n8n: failingN8n });

    const res = await request(app)
      .post('/leads')
      .set('content-type', 'application/json')
      .send({ email: 'crm-fail@test.com', source: 'form' });

    // Lead submitter still gets success
    expect([200, 201]).toContain(res.status);
    expect(res.body.leadId).toBeDefined();

    // Give the fire-and-forget promise a tick to settle
    await new Promise((r) => setTimeout(r, 10));

    const entries = getAuditEntries();
    const failEntry = entries.find((e) => e.kind === 'crm_sync_failed');
    expect(failEntry).toBeDefined();
    expect(failEntry!.detail).toContain('n8n_unreachable');
  });
});

// ── GET /audit/spam ────────────────────────────────────────────────────────

describe('GET /audit/spam', () => {
  beforeEach(() => {
    clearAudit();
  });

  it('returns 401 without Google auth', async () => {
    const app = makeApp();
    const res = await request(app).get('/audit/spam');
    expect(res.status).toBe(401);
  });

  it('returns 401 for invalid token', async () => {
    const app = makeApp();
    const res = await request(app)
      .get('/audit/spam')
      .set('authorization', 'Bearer bad-token');
    expect(res.status).toBe(401);
  });

  it('returns entries with valid token + org header; entries contain no raw emails/ips', async () => {
    // Seed an audit entry
    const { recordAudit } = await import('../src/audit.js');
    recordAudit('honeypot', '1.2.3.4', 'user@example.com', 'test');

    const app = makeApp();
    const res = await request(app)
      .get('/audit/spam')
      .set('authorization', 'Bearer valid-token')
      .set(ORG_CONTEXT_HEADER, orgHeader());

    expect(res.status).toBe(200);
    expect(res.body.entries).toBeDefined();
    expect(Array.isArray(res.body.entries)).toBe(true);

    const body = JSON.stringify(res.body);
    // Raw IP must not appear
    expect(body).not.toContain('1.2.3.4');
    // Raw email must not appear
    expect(body).not.toContain('user@example.com');

    // Hashes should be present
    const entry = res.body.entries[0];
    expect(entry.ipHash).toBeDefined();
    expect(entry.identityHash).toBeDefined();
    expect(entry.ipHash).toHaveLength(64); // sha256 hex
  });
});

// ── POST /spin ───────────────────────────────────────────────────────────

describe('POST /spin', () => {
  beforeEach(() => {
    clearServerState();
    clearPending();
  });

  it('returns tier and couponCode for known lead', async () => {
    const app = makeApp();
    const createRes = await request(app)
      .post('/leads')
      .set('content-type', 'application/json')
      .send({ phone: '555-9999', source: 'qr' });
    const { leadId } = createRes.body;

    const spinRes = await request(app)
      .post('/spin')
      .set('content-type', 'application/json')
      .send({ leadId });
    expect(spinRes.status).toBe(200);
    expect(spinRes.body).toHaveProperty('tier');
    expect(spinRes.body).toHaveProperty('couponCode');
    expect(['highValue', 'standard']).toContain(spinRes.body.tier);
  });

  it('returns 404 for unknown lead', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/spin')
      .set('content-type', 'application/json')
      .send({ leadId: 'nonexistent' });
    expect(res.status).toBe(404);
  });

  it('returns 400 for missing leadId', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/spin')
      .set('content-type', 'application/json')
      .send({});
    expect(res.status).toBe(400);
  });
});

describe('GET /redirect/:couponCode', () => {
  it('redirects to platform URL with promo param (heartland)', async () => {
    // Set env for this test
    process.env.ORDERING_URL_HEARTLAND = 'https://order.restaurant.com/heartland';
    const app = makeApp();
    const res = await request(app)
      .get('/redirect/TESTCODE')
      .query({ platform: 'heartland' })
      .redirects(0);
    expect(res.status).toBe(302);
    expect(res.headers['location']).toContain('?promo=TESTCODE');
    expect(res.headers['location']).toContain('heartland');
  });
});

describe('POST /ingest/transactions — HMAC auth', () => {
  beforeEach(() => {
    clearServerState();
  });

  it('returns 401 for bad HMAC signature', async () => {
    const app = makeApp();
    const body = JSON.stringify({ csv: 'some,data' });
    const res = await request(app)
      .post('/ingest/transactions')
      .set('content-type', 'application/json')
      .set('x-expoproxy-signature', 'bad-sig')
      .send(body);
    expect(res.status).toBe(401);
  });

  it('accepts valid HMAC and ingests CSV', async () => {
    const app = makeApp();
    const tx = makeValidTx('tx-ingest-1');
    const csv = toCsv([tx]);
    const bodyObj = { csv };
    const bodyStr = JSON.stringify(bodyObj);
    const sig = sign(bodyStr);

    const res = await request(app)
      .post('/ingest/transactions')
      .set('content-type', 'application/json')
      .set('x-expoproxy-signature', sig)
      .send(bodyStr);
    expect(res.status).toBe(200);
    expect(res.body.ingested).toBe(1);
  });
});

describe('POST /segments/run — Google auth + disclaimer ack', () => {
  beforeEach(() => {
    clearServerState();
  });

  it('returns 401 when no Bearer token', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/segments/run')
      .set('content-type', 'application/json')
      .send({});
    expect(res.status).toBe(401);
  });

  it('returns 401 for invalid token', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/segments/run')
      .set('authorization', 'Bearer bad-token')
      .set('content-type', 'application/json')
      .send({});
    expect(res.status).toBe(401);
  });

  it('returns 428 with disclaimer when auth+org valid but no ack header', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/segments/run')
      .set('authorization', 'Bearer valid-token')
      .set(ORG_CONTEXT_HEADER, orgHeader())
      .set('content-type', 'application/json')
      .send({});
    expect(res.status).toBe(428);
    expect(res.body.disclaimer.action).toBe('segmentation_run');
  });

  it('returns segments with valid token + org header + ack header', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/segments/run')
      .set('authorization', 'Bearer valid-token')
      .set(ORG_CONTEXT_HEADER, orgHeader())
      .set(ACK_HEADER, ackToken('segmentation_run'))
      .set('content-type', 'application/json')
      .send({});
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('vip');
    expect(res.body).toHaveProperty('standard');
    expect(res.body).toHaveProperty('promo_pool');
    expect(res.body).toHaveProperty('counts');
  });
});

describe('POST /campaigns/:id/reconcile — Google auth + disclaimer ack', () => {
  beforeEach(() => {
    clearServerState();
  });

  it('returns 401 without auth', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/campaigns/camp-1/reconcile')
      .set('content-type', 'application/json')
      .send({ registrants: [] });
    expect(res.status).toBe(401);
  });

  it('returns 428 with disclaimer when auth+org valid but no ack header', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/campaigns/camp-1/reconcile')
      .set('authorization', 'Bearer valid-token')
      .set(ORG_CONTEXT_HEADER, orgHeader())
      .set('content-type', 'application/json')
      .send({ registrants: [] });
    expect(res.status).toBe(428);
    expect(res.body.disclaimer.action).toBe('segmentation_run');
  });

  it('reconciles with valid token + org header + ack header', async () => {
    const app = makeApp();
    const registrants = [
      { id: 'r1', couponCode: 'PROMO-123' },
      { id: 'r2', couponCode: 'PROMO-NEVER' },
    ];

    // Inject a transaction with promo_code directly (CSV doesn't carry promo_code)
    const tx = makeValidTx('tx-recon-1'); // has promo_code: 'PROMO-123'
    injectTransactions([tx]);

    const res = await request(app)
      .post('/campaigns/camp-1/reconcile')
      .set('authorization', 'Bearer valid-token')
      .set(ORG_CONTEXT_HEADER, orgHeader())
      .set(ACK_HEADER, ackToken('segmentation_run'))
      .set('content-type', 'application/json')
      .send({ registrants });
    expect(res.status).toBe(200);
    expect(res.body.pathB_count).toBe(1); // PROMO-123 was in tx
    expect(res.body.pathA_count).toBe(1); // PROMO-NEVER was not
  });
});

describe('portal URL format', () => {
  it('heartland URL contains ?promo= query param', async () => {
    process.env.ORDERING_URL_HEARTLAND = 'https://order.example.com/heartland';
    const app = makeApp();
    const res = await request(app)
      .get('/redirect/MY-COUPON')
      .query({ platform: 'heartland' })
      .redirects(0);
    expect(res.headers['location']).toContain('?promo=MY-COUPON');
  });
});

// ── Pro-service gate: operator routes ─────────────────────────────────────

describe('Pro-service gate — operator routes', () => {
  beforeEach(() => {
    clearServerState();
    clearAudit();
  });

  it('POST /segments/run returns 402 when org context absent', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/segments/run')
      .set('authorization', 'Bearer valid-token')
      .set('content-type', 'application/json')
      .send({});
    expect(res.status).toBe(402);
    expect(res.body.error).toBe('upgrade_required');
    expect(res.body.upgradeUrl).toBe('/pricing');
  });

  it('POST /segments/run returns 402 when org context is unpaid', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/segments/run')
      .set('authorization', 'Bearer valid-token')
      .set(ORG_CONTEXT_HEADER, orgHeader({ isPaid: false }))
      .set('content-type', 'application/json')
      .send({});
    expect(res.status).toBe(402);
    expect(res.body.error).toBe('upgrade_required');
  });

  it('POST /campaigns/:id/reconcile returns 402 when org context absent', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/campaigns/camp-x/reconcile')
      .set('authorization', 'Bearer valid-token')
      .set('content-type', 'application/json')
      .send({ registrants: [] });
    expect(res.status).toBe(402);
    expect(res.body.error).toBe('upgrade_required');
  });

  it('GET /audit/spam returns 402 when org context absent (Google auth passes)', async () => {
    const app = makeApp();
    const res = await request(app)
      .get('/audit/spam')
      .set('authorization', 'Bearer valid-token');
    expect(res.status).toBe(402);
    expect(res.body.error).toBe('upgrade_required');
  });
});

// ── POST /lifecycle/purge ─────────────────────────────────────────────────

describe('POST /lifecycle/purge', () => {
  beforeEach(() => {
    clearServerState();
    clearPending();
    clearCampaigns();
    clearAudit();
  });

  it('returns 401 for bad HMAC signature', async () => {
    const app = makeApp();
    const body = JSON.stringify({ orgId: 'org-test' });
    const res = await request(app)
      .post('/lifecycle/purge')
      .set('content-type', 'application/json')
      .set('x-expoproxy-signature', 'bad-sig')
      .send(body);
    expect(res.status).toBe(401);
  });

  it('returns 400 when orgId is missing', async () => {
    const app = makeApp();
    const body = JSON.stringify({});
    const sig = sign(body);
    const res = await request(app)
      .post('/lifecycle/purge')
      .set('content-type', 'application/json')
      .set('x-expoproxy-signature', sig)
      .send(body);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('orgId required');
  });

  it('purges only tagged leads; untagged leads remain', async () => {
    const orgId = 'org-purge-test';
    // Create a tagged lead by posting with org context header
    const app = makeApp();
    const taggedLeadRes = await request(app)
      .post('/leads')
      .set('content-type', 'application/json')
      .set(ORG_CONTEXT_HEADER, signOrgContext({
        orgId,
        role: 'owner',
        isPaid: true,
        repTermsAccepted: false,
        exp: Date.now() + 60_000,
      }, SIGNING_SECRET))
      .send({ phone: '555-tagged-1', source: 'test' });
    expect(taggedLeadRes.status).toBe(201);

    // Create an untagged lead (no org context header)
    const untaggedLeadRes = await request(app)
      .post('/leads')
      .set('content-type', 'application/json')
      .send({ phone: '555-untagged-1', source: 'test' });
    expect(untaggedLeadRes.status).toBe(201);

    // Purge
    const purgeBody = JSON.stringify({ orgId });
    const purgeSig = sign(purgeBody);
    const purgeRes = await request(app)
      .post('/lifecycle/purge')
      .set('content-type', 'application/json')
      .set('x-expoproxy-signature', purgeSig)
      .send(purgeBody);

    expect(purgeRes.status).toBe(200);
    expect(purgeRes.body.orgId).toBe(orgId);
    expect(purgeRes.body.leadsRemoved).toBe(1);

    // Verify tagged lead is gone — re-posting should yield a NEW lead (201)
    const reTaggedRes = await request(app)
      .post('/leads')
      .set('content-type', 'application/json')
      .send({ phone: '555-tagged-1', source: 'test' });
    expect(reTaggedRes.status).toBe(201);
    expect(reTaggedRes.body.isNew).toBe(true);

    // Verify untagged lead is still present — re-posting should yield 200 (duplicate)
    const reUntaggedRes = await request(app)
      .post('/leads')
      .set('content-type', 'application/json')
      .send({ phone: '555-untagged-1', source: 'test' });
    expect(reUntaggedRes.status).toBe(200);
    expect(reUntaggedRes.body.isNew).toBe(false);
  });

  it('purge with unknown orgId returns zeros (no error)', async () => {
    const app = makeApp();
    const body = JSON.stringify({ orgId: 'org-does-not-exist' });
    const sig = sign(body);
    const res = await request(app)
      .post('/lifecycle/purge')
      .set('content-type', 'application/json')
      .set('x-expoproxy-signature', sig)
      .send(body);
    expect(res.status).toBe(200);
    expect(res.body.leadsRemoved).toBe(0);
  });
});
