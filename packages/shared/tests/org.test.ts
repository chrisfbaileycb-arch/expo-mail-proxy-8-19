import { describe, it, expect, vi } from 'vitest';
import {
  canDraft,
  canExecute,
  gateService,
  signOrgContext,
  verifyOrgContext,
  makeOrgGate,
  requireExecuteRights,
  isLifecycleExpired,
  ORG_CONTEXT_HEADER,
  Organization,
  type OrgContext,
} from '../src/index.js';

const secret = 's3cret';
const ctx = (over: Partial<OrgContext> = {}): OrgContext => ({
  orgId: 'org-1',
  role: 'owner',
  isPaid: true,
  repTermsAccepted: true,
  exp: Date.now() + 60_000,
  ...over,
});
const fakeRes = () => {
  const out: { code?: number; body?: Record<string, unknown> } = {};
  const res = {
    status(c: number) { out.code = c; return res; },
    json(b: unknown) { out.body = b as Record<string, unknown>; return b; },
  };
  return { res, out };
};

describe('RBAC', () => {
  it('all internal roles may draft; only paid admin may execute', () => {
    for (const r of ['owner', 'manager', 'staff'] as const) expect(canDraft(r)).toBe(true);
    expect(canExecute('owner', { isPaid: true })).toBe(true);
    expect(canExecute('owner', { isPaid: false })).toBe(false);
    expect(canExecute('manager', { isPaid: true })).toBe(false);
  });
});

describe('signed org context', () => {
  it('round-trips, rejects tampering and expiry', () => {
    const token = signOrgContext(ctx(), secret);
    expect(verifyOrgContext(token, secret)?.orgId).toBe('org-1');
    expect(verifyOrgContext(token + '0', secret)).toBeNull();
    expect(verifyOrgContext(token, 'wrong')).toBeNull();
    const stale = signOrgContext(ctx({ exp: Date.now() - 1 }), secret);
    expect(verifyOrgContext(stale, secret)).toBeNull();
  });
});

describe('service gating', () => {
  it('explorable suite is open even unpaid; pro suite hard-gates', () => {
    expect(gateService('staffwise', null).access).toBe('open');
    expect(gateService('adsmith', ctx({ isPaid: false })).access).toBe('open');
    expect(gateService('echolink', ctx({ isPaid: false })).access).toBe('upgrade_required');
    expect(gateService('echolink', null).access).toBe('upgrade_required');
    expect(gateService('echolink', ctx()).access).toBe('open');
  });

  it('reputation management additionally requires the 12-month terms', () => {
    expect(gateService('echo-proxy', ctx({ repTermsAccepted: false }))).toMatchObject({
      access: 'terms_required',
      termMonths: 12,
    });
    expect(gateService('echo-proxy', ctx()).access).toBe('open');
  });

  it('middleware: 402 upgrade, 403 terms, pass-through when open', () => {
    const gate = makeOrgGate('echo-proxy', secret);
    const next = vi.fn();
    let r = fakeRes();
    gate({ headers: {} }, r.res, next);
    expect(r.out.code).toBe(402);
    r = fakeRes();
    gate({ headers: { [ORG_CONTEXT_HEADER]: signOrgContext(ctx({ repTermsAccepted: false }), secret) } }, r.res, next);
    expect(r.out.code).toBe(403);
    r = fakeRes();
    gate({ headers: { [ORG_CONTEXT_HEADER]: signOrgContext(ctx(), secret) } }, r.res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('execute rights middleware: paid admin passes, others 403', () => {
    const mw = requireExecuteRights(secret);
    const next = vi.fn();
    let r = fakeRes();
    mw({ headers: { [ORG_CONTEXT_HEADER]: signOrgContext(ctx({ role: 'manager' }), secret) } }, r.res, next);
    expect(r.out.code).toBe(403);
    r = fakeRes();
    mw({ headers: { [ORG_CONTEXT_HEADER]: signOrgContext(ctx(), secret) } }, r.res, next);
    expect(next).toHaveBeenCalledOnce();
  });
});

describe('lifecycle TTL', () => {
  const base = Organization.parse({
    id: 'o1', name: 'Blockys', createdAt: '2026-05-01T00:00:00Z', isPaid: false,
    lastActiveAt: '2026-05-01T00:00:00Z', contact: { email: 'o@x.com' },
  });
  it('unpaid + idle >30 days expires; paid never expires', () => {
    const now = new Date('2026-06-12T00:00:00Z');
    expect(isLifecycleExpired(base, now)).toBe(true);
    expect(isLifecycleExpired({ ...base, lastActiveAt: '2026-06-01T00:00:00Z' }, now)).toBe(false);
    expect(isLifecycleExpired({ ...base, isPaid: true }, now)).toBe(false);
  });
});
