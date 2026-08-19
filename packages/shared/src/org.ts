import { z } from 'zod';
import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Organization-Tenant model + RBAC + service gating (Project Directive:
 * Multi-Tenant SaaS Architecture). All operator data is scoped to an
 * OrganizationID; roles govern draft vs execute rights; pro services are
 * hard-gated on paid status, and Reputation Management additionally on the
 * accepted 12-month commitment.
 */

export const Role = z.enum(['owner', 'manager', 'staff']);
export type Role = z.infer<typeof Role>;

/** "Administrator" in the directive maps to the owner role. */
export const ADMIN_ROLE: Role = 'owner';
export const REPUTATION_TERM_MONTHS = 12;

export const ReputationTerms = z.object({
  acceptedAt: z.string().datetime(),
  termMonths: z.literal(REPUTATION_TERM_MONTHS),
  endsAt: z.string().datetime(),
});
export type ReputationTerms = z.infer<typeof ReputationTerms>;

export const Organization = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  createdAt: z.string().datetime(),
  isPaid: z.boolean().default(false),
  lastActiveAt: z.string().datetime(),
  contact: z.object({ email: z.string().email(), phone: z.string().optional() }),
  reputationTerms: ReputationTerms.optional(),
});
export type Organization = z.infer<typeof Organization>;

export const Membership = z.object({
  orgId: z.string().min(1),
  userSub: z.string().min(1),
  email: z.string().email(),
  role: Role,
});
export type Membership = z.infer<typeof Membership>;

/** Draft/Save rights: every internal role may collaborate and ideate. */
export function canDraft(role: Role): boolean {
  return Role.options.includes(role);
}

/** Execute/Spend rights: hard-coded to Administrator + Paid subscription. */
export function canExecute(role: Role, org: Pick<Organization, 'isPaid'>): boolean {
  return role === ADMIN_ROLE && org.isPaid === true;
}

/** Explorable suite: full UI/draft access for any authenticated user. */
export const EXPLORABLE_SERVICES = new Set([
  'staffwise',
  'marketing',
  'dashboard',
  'adsmith',
  'content-director',
  'core-pipeline',
]);
/** Pro-only suite: hard-gated on Organization.isPaid. */
export const PRO_SERVICES = new Set(['echo-proxy', 'echolink']);

export type GateDecision =
  | { access: 'open' }
  | { access: 'upgrade_required'; upgradeUrl: string }
  | { access: 'terms_required'; termMonths: number };

export interface OrgContext {
  orgId: string;
  role: Role;
  isPaid: boolean;
  repTermsAccepted: boolean;
  exp: number; // epoch ms
}

export const ORG_CONTEXT_HEADER = 'x-expoproxy-org-context';

/** Dashboard (control plane) mints short-lived signed org contexts. */
export function signOrgContext(ctx: OrgContext, secret: string): string {
  const body = Buffer.from(JSON.stringify(ctx)).toString('base64url');
  const mac = createHmac('sha256', secret).update(body).digest('hex');
  return `${body}.${mac}`;
}

export function verifyOrgContext(
  token: string | undefined,
  secret: string,
  now: Date = new Date(),
): OrgContext | null {
  if (!token) return null;
  const [body, mac] = token.split('.');
  if (!body || !mac || !/^[0-9a-f]{64}$/.test(mac)) return null;
  const expected = createHmac('sha256', secret).update(body).digest('hex');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(mac, 'hex');
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const ctx = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as OrgContext;
    if (typeof ctx.exp !== 'number' || ctx.exp < now.getTime()) return null;
    return ctx;
  } catch {
    return null;
  }
}

/** The hard gate: pro services redirect to upgrade until the org is paid. */
export function gateService(service: string, ctx: OrgContext | null): GateDecision {
  if (!PRO_SERVICES.has(service)) return { access: 'open' };
  if (!ctx || !ctx.isPaid) return { access: 'upgrade_required', upgradeUrl: '/pricing' };
  if (service === 'echo-proxy' && !ctx.repTermsAccepted) {
    return { access: 'terms_required', termMonths: REPUTATION_TERM_MONTHS };
  }
  return { access: 'open' };
}

interface ReqLike {
  headers: Record<string, unknown>;
}
interface ResLike {
  status(code: number): ResLike;
  json(body: unknown): unknown;
}

/** Express-shaped middleware enforcing the pro-service hard gate. */
export function makeOrgGate(service: string, secret: string) {
  return (req: ReqLike & { orgContext?: OrgContext }, res: ResLike, next: () => void): void => {
    const ctx = verifyOrgContext(req.headers[ORG_CONTEXT_HEADER] as string | undefined, secret);
    const decision = gateService(service, ctx);
    if (decision.access === 'upgrade_required') {
      res.status(402).json({ error: 'upgrade_required', upgradeUrl: decision.upgradeUrl });
      return;
    }
    if (decision.access === 'terms_required') {
      res.status(403).json({
        error: 'reputation_terms_required',
        termMonths: decision.termMonths,
        detail: `Reputation Management requires a ${decision.termMonths}-month commitment accepted during payment/onboarding.`,
      });
      return;
    }
    if (ctx) req.orgContext = ctx;
    next();
  };
}

/** Express-shaped middleware for Execute/Spend rights (Admin + Paid). */
export function requireExecuteRights(secret: string) {
  return (req: ReqLike & { orgContext?: OrgContext }, res: ResLike, next: () => void): void => {
    const ctx =
      req.orgContext ??
      verifyOrgContext(req.headers[ORG_CONTEXT_HEADER] as string | undefined, secret);
    if (!ctx) {
      res.status(401).json({ error: 'org_context_required' });
      return;
    }
    if (ctx.role !== ADMIN_ROLE || !ctx.isPaid) {
      res.status(403).json({
        error: 'execute_requires_admin_paid',
        detail: 'Execute/Spend actions require Administrator role and a Paid subscription.',
      });
      return;
    }
    req.orgContext = ctx;
    next();
  };
}

/** Lifecycle policy: unpaid + inactive beyond TTL → export to CRM and purge. */
export const LIFECYCLE_TTL_DAYS = 30;
export function isLifecycleExpired(org: Organization, now: Date = new Date()): boolean {
  if (org.isPaid) return false;
  const idleMs = now.getTime() - new Date(org.lastActiveAt).getTime();
  return idleMs > LIFECYCLE_TTL_DAYS * 86_400_000;
}
