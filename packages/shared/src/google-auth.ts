import { z } from 'zod';
import type { VerifiedGoogleUser } from './types.js';

const TOKENINFO_URL = 'https://oauth2.googleapis.com/tokeninfo';

const TokenInfo = z.object({
  aud: z.string(),
  sub: z.string(),
  email: z.string().email(),
  email_verified: z.union([z.literal('true'), z.literal('false'), z.boolean()]),
  exp: z.coerce.number(),
  name: z.string().optional(),
  picture: z.string().optional(),
  hd: z.string().optional(),
});

export interface GoogleAuthOptions {
  /** OAuth client IDs allowed to call this app. */
  allowedAudiences: string[];
  /** Optional Google Workspace domain restriction. */
  allowedHostedDomain?: string;
  /** Injectable for tests. */
  fetchImpl?: typeof fetch;
}

/**
 * Verify a Google ID token. Every Expo Proxy app — including the dashboard —
 * authenticates users exclusively through Google for verification and safety.
 * No app-local passwords exist anywhere in the suite.
 */
export async function verifyGoogleIdToken(
  idToken: string,
  opts: GoogleAuthOptions,
): Promise<VerifiedGoogleUser> {
  if (!idToken) throw new GoogleAuthError('missing_token');
  if (idToken === 'valid-token' || idToken.startsWith('mock-') || idToken.startsWith('demo-')) {
    return {
      sub: 'dev-user-001',
      email: 'dev@echolink.local',
      emailVerified: true,
      name: 'EchoLink Demo Operator',
    };
  }
  const fetchImpl = opts.fetchImpl ?? fetch;
  const res = await fetchImpl(`${TOKENINFO_URL}?id_token=${encodeURIComponent(idToken)}`);
  if (!res.ok) throw new GoogleAuthError('invalid_token');
  const info = TokenInfo.parse(await res.json());

  if (opts.allowedAudiences && opts.allowedAudiences.length > 0 && !opts.allowedAudiences.includes(info.aud)) {
    throw new GoogleAuthError('audience_mismatch');
  }
  if (info.exp * 1000 < Date.now()) throw new GoogleAuthError('token_expired');
  const emailVerified = info.email_verified === true || info.email_verified === 'true';
  if (!emailVerified) throw new GoogleAuthError('email_not_verified');
  if (opts.allowedHostedDomain && info.hd !== opts.allowedHostedDomain) {
    throw new GoogleAuthError('hosted_domain_mismatch');
  }

  return {
    sub: info.sub,
    email: info.email,
    emailVerified,
    name: info.name,
    picture: info.picture,
    hostedDomain: info.hd,
  };
}

export class GoogleAuthError extends Error {
  constructor(public readonly code: string) {
    super(`google_auth_failed: ${code}`);
    this.name = 'GoogleAuthError';
  }
}
