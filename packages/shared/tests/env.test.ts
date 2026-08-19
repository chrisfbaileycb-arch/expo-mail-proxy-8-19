import { describe, it, expect, vi } from 'vitest';
import {
  validateEnv,
  EnvValidationError,
  BETA_ENV,
  looksLikePlaceholder,
  N8nClient,
  type N8nTriggerFailure,
} from '../src/index.js';

describe('beta env validation (fail fast)', () => {
  const good = {
    GOOGLE_CLIENT_IDS: '123-abc.apps.googleusercontent.com',
    N8N_BASE_URL: 'https://signal-f.app.n8n.cloud',
    N8N_SIGNING_SECRET: 's3cret-value',
    DATA_DIR: '/var/lib/expo-proxy',
  };

  const all = [...BETA_ENV.googleAuth(), ...BETA_ENV.n8n(), ...BETA_ENV.dataDir()];

  it('passes with a complete real configuration', () => {
    const out = validateEnv(all, good);
    expect(out['N8N_BASE_URL']).toBe(good.N8N_BASE_URL);
  });

  it('empty GOOGLE_CLIENT_IDS is fatal', () => {
    expect(() => validateEnv(all, { ...good, GOOGLE_CLIENT_IDS: '' })).toThrow(EnvValidationError);
    expect(() => validateEnv(all, { ...good, GOOGLE_CLIENT_IDS: '   ' })).toThrow(/GOOGLE_CLIENT_IDS/);
  });

  it('empty N8N_SIGNING_SECRET is fatal', () => {
    expect(() => validateEnv(all, { ...good, N8N_SIGNING_SECRET: undefined })).toThrow(
      /N8N_SIGNING_SECRET/,
    );
  });

  it('placeholder and non-https N8N_BASE_URL values are fatal', () => {
    expect(() => validateEnv(all, { ...good, N8N_BASE_URL: 'https://example.app.n8n.cloud' })).toThrow(
      /placeholder/,
    );
    expect(() => validateEnv(all, { ...good, N8N_BASE_URL: 'https://localhost.n8n.cloud' })).toThrow(
      /placeholder/,
    );
    expect(() => validateEnv(all, { ...good, N8N_BASE_URL: 'http://real.n8n.cloud' })).toThrow(
      /https/,
    );
  });

  it('reports ALL problems in one error', () => {
    try {
      validateEnv(all, {});
      expect.unreachable();
    } catch (e) {
      const err = e as EnvValidationError;
      expect(err.problems.length).toBe(4);
    }
  });

  it('placeholder detector catches the usual suspects, passes real values', () => {
    for (const bad of [
      'https://localhost:5678',
      'https://example.com/x',
      'PLACEHOLDER_TOAST',
      'changeme',
    ]) {
      expect(looksLikePlaceholder(bad), bad).toBe(true);
    }
    expect(looksLikePlaceholder('https://signal-f.app.n8n.cloud')).toBe(false);
    expect(looksLikePlaceholder('hello@signalfholdings.com')).toBe(false);
  });
});

describe('n8n trigger failure visibility', () => {
  it('invokes the structured failure hook on HTTP failure and network error', async () => {
    const failures: N8nTriggerFailure[] = [];
    const client = new N8nClient({
      baseUrl: 'https://signal-f.app.n8n.cloud',
      signingSecret: 's',
      onTriggerFailure: (f) => failures.push(f),
      fetchImpl: (async () => new Response('nope', { status: 503 })) as typeof fetch,
    });
    await expect(client.trigger('echolink-crm-sync', { x: 1 }, { critical: true })).rejects.toThrow();

    const netClient = new N8nClient({
      baseUrl: 'https://signal-f.app.n8n.cloud',
      signingSecret: 's',
      onTriggerFailure: (f) => failures.push(f),
      fetchImpl: (async () => {
        throw new Error('ECONNRESET');
      }) as unknown as typeof fetch,
    });
    await expect(netClient.trigger('ops-telemetry', {})).rejects.toThrow();

    expect(failures).toHaveLength(2);
    expect(failures[0]).toMatchObject({
      workflowPath: 'echolink-crm-sync',
      message: 'http_503',
      critical: true,
    });
    expect(failures[1]).toMatchObject({
      workflowPath: 'ops-telemetry',
      critical: false,
    });
    expect(failures[1].message).toContain('ECONNRESET');
  });

  it('successful triggers do not invoke the hook', async () => {
    const hook = vi.fn();
    const client = new N8nClient({
      baseUrl: 'https://signal-f.app.n8n.cloud',
      signingSecret: 's',
      onTriggerFailure: hook,
      fetchImpl: (async () => new Response('{}', { status: 200 })) as typeof fetch,
    });
    await client.trigger('staffwise-onboarding-sms', {});
    expect(hook).not.toHaveBeenCalled();
  });
});
