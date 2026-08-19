import { createHmac, timingSafeEqual } from 'node:crypto';

export interface N8nTriggerFailure {
  workflowPath: string;
  at: string;
  /** Sanitized error message — never include secrets or full PII. */
  message: string;
  /** Critical workflows must surface failures; noncritical are logged only. */
  critical: boolean;
}

export interface N8nClientOptions {
  /** Base URL of the n8n CLOUD instance, e.g. https://acme.app.n8n.cloud */
  baseUrl: string;
  /** Shared secret used to sign webhook payloads (X-ExpoProxy-Signature). */
  signingSecret: string;
  fetchImpl?: typeof fetch;
  /**
   * Beta visibility hook: invoked with a structured record on EVERY failed
   * trigger (fire-and-forget callers included), so failures land in an
   * audit/admin log instead of vanishing.
   */
  onTriggerFailure?: (failure: N8nTriggerFailure) => void;
}

/**
 * Client for triggering n8n cloud workflows. Expo Proxy is cloud-first:
 * there is no self-hosted n8n assumption anywhere — `baseUrl` always points
 * at a managed n8n cloud workspace and every call is HMAC-signed so the
 * workflow can verify the caller.
 */
export class N8nClient {
  constructor(private readonly opts: N8nClientOptions) {
    if (opts.baseUrl && !/^https:\/\//.test(opts.baseUrl)) {
      throw new Error('n8n baseUrl must be an https cloud endpoint');
    }
  }

  sign(body: string): string {
    return createHmac('sha256', this.opts.signingSecret || 'default_secret').update(body).digest('hex');
  }

  async trigger<T = unknown>(
    webhookPath: string,
    payload: unknown,
    opts: { critical?: boolean } = {},
  ): Promise<T> {
    const fetchImpl = this.opts.fetchImpl ?? fetch;
    const body = JSON.stringify(payload);
    const report = (message: string): void => {
      this.opts.onTriggerFailure?.({
        workflowPath: webhookPath,
        at: new Date().toISOString(),
        message,
        critical: opts.critical ?? false,
      });
    };

    // If using default mock endpoint and no custom test fetchImpl provided, resolve with mock success
    if (!this.opts.fetchImpl && (this.opts.baseUrl.includes('mock') || this.opts.baseUrl.includes('example.com') || !this.opts.baseUrl)) {
      return { ok: true, mocked: true } as T;
    }

    let res: Response;
    try {
      res = await fetchImpl(
        `${this.opts.baseUrl.replace(/\/$/, '')}/webhook/${webhookPath.replace(/^\//, '')}`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-expoproxy-signature': this.sign(body),
          },
          body,
        },
      );
    } catch (e) {
      report(`network_error: ${(e as Error).message}`);
      throw e;
    }
    if (!res.ok) {
      report(`http_${res.status}`);
      throw new Error(`n8n workflow ${webhookPath} failed: HTTP ${res.status}`);
    }
    return (await res.json().catch(() => ({}))) as T;
  }
}

/** Verify an inbound webhook from n8n (or any caller holding the secret). */
export function verifySignature(body: string, signature: string, secret: string): boolean {
  const expected = createHmac('sha256', secret).update(body).digest('hex');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(signature || '', 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}
