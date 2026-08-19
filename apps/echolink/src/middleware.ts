/**
 * middleware.ts — Reusable Express middleware factories for EchoLink.
 * Extracted from server.ts to keep that file under 500 lines.
 */
import { type Request, type Response, type NextFunction } from 'express';
import { verifySignature } from '@expo-proxy/shared';
import type { VerifiedGoogleUser } from '@expo-proxy/shared';
import type { AppDeps } from './server.js';

// ── CORS middleware ────────────────────────────────────────────────────────

/**
 * Build a hand-rolled CORS middleware for the given set of allowed origins.
 *
 * Behaviour:
 * - OPTIONS preflight: if Origin is allowlisted → 204 with CORS headers.
 * - Credentialed request: if Origin is allowlisted → append ACAO header, continue.
 * - Origin present but NOT allowlisted → no CORS headers (browser blocks).
 * - No Origin header (non-browser) → unaffected.
 */
export function makeCorsMiddleware(allowedOrigins: Set<string>) {
  const CORS_HEADERS = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '600',
  };

  return (req: Request, res: Response, next: NextFunction): void => {
    const origin = req.headers['origin'] as string | undefined;
    if (!origin) {
      next();
      return;
    }
    if (!allowedOrigins.has(origin)) {
      // Browser will block — we just don't echo the ACAO header.
      if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
      }
      next();
      return;
    }
    res.setHeader('Access-Control-Allow-Origin', origin);
    if (req.method === 'OPTIONS') {
      Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
      res.status(204).end();
      return;
    }
    next();
  };
}

// ── Auth middleware factories ─────────────────────────────────────────────

export function makeGoogleAuth(deps: AppDeps) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers['authorization'] ?? '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      res.status(401).json({ error: 'Missing Bearer token' });
      return;
    }
    try {
      const user = await deps.verifyGoogleToken(token);
      (req as Request & { googleUser?: VerifiedGoogleUser }).googleUser = user;
      next();
    } catch {
      res.status(401).json({ error: 'Invalid Google token' });
    }
  };
}

export function makeHmacAuth(deps: AppDeps) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const sig = (req.headers['x-expoproxy-signature'] as string) ?? '';
    const rawBody: string = (req as Request & { rawBody?: string }).rawBody ?? '';
    if (!verifySignature(rawBody, sig, deps.signingSecret)) {
      res.status(401).json({ error: 'Invalid HMAC signature' });
      return;
    }
    next();
  };
}
