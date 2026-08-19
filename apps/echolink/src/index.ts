/**
 * index.ts — EchoLink service entry point.
 *
 * Runs with zero required environment variables, providing full local in-memory
 * mocks and fallbacks for development and preview environments.
 */

import { createApp } from './server.js';
import { N8nClient, verifyGoogleIdToken } from '@expo-proxy/shared';

// ── Configuration with safe defaults (zero required env vars) ──────────────
const PORT = 3000;
const N8N_BASE_URL = process.env.N8N_BASE_URL || 'https://mock-n8n.cloud';
const N8N_SIGNING_SECRET = process.env.N8N_SIGNING_SECRET || 'echolink_default_secret_32_chars';
const GOOGLE_CLIENT_IDS = (process.env.GOOGLE_CLIENT_IDS ?? '').split(',').filter(Boolean);

const MARKETING_ORIGINS = (process.env.MARKETING_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// ── N8n client with local mock fallback ──────────────────────────────────
const n8n = new N8nClient({
  baseUrl: N8N_BASE_URL,
  signingSecret: N8N_SIGNING_SECRET,
  onTriggerFailure: ({ workflowPath, at, message, critical }) => {
    console.log(`[n8n-mock] workflow=${workflowPath} at=${at} critical=${critical} ${message}`);
  },
});

const app = createApp({
  verifyGoogleToken: (token) =>
    verifyGoogleIdToken(token, { allowedAudiences: GOOGLE_CLIENT_IDS }),
  n8n,
  signingSecret: N8N_SIGNING_SECRET,
  orgSecret: N8N_SIGNING_SECRET,
  googleClientIds: GOOGLE_CLIENT_IDS,
  allowedOrigins: new Set(MARKETING_ORIGINS),
  dataDir: process.env.DATA_DIR || undefined,
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Expo Mail Proxy] Service running at http://0.0.0.0:${PORT}`);
});
