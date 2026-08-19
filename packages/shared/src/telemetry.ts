import type { N8nClient } from './n8n.js';

/** Minimal structural types so shared stays free of an express dependency. */
interface ReqLike {
  method: string;
  path: string;
}
interface ResLike {
  headersSent: boolean;
  status(code: number): ResLike;
  json(body: unknown): unknown;
}

export interface FailureEvent {
  app: string;
  route: string;
  method: string;
  status: number;
  message: string;
  at: string;
}

export interface Telemetry {
  /** Express-shaped error middleware: logs + alerts n8n, then responds 500. */
  errorMiddleware: (err: unknown, req: ReqLike, res: ResLike, next: (e?: unknown) => void) => void;
  /** Report any webhook/endpoint failure explicitly (auth rejects, bad payloads). */
  reportFailure(event: Omit<FailureEvent, 'app' | 'at'>): void;
}

export interface TelemetryOptions {
  app: string;
  n8n: Pick<N8nClient, 'trigger'>;
  /** n8n cloud webhook path receiving failure alerts. */
  workflowPath?: string;
  log?: (msg: string) => void;
}

/**
 * Fail-fast telemetry: every webhook/endpoint failure is pushed to the
 * 'ops-telemetry' n8n workflow IMMEDIATELY (fire-and-forget, never blocks
 * or breaks the response path), so the alert lands in the n8n execution
 * log — visible on the Command Dashboard — before the caller has retried.
 */
export function createTelemetry(opts: TelemetryOptions): Telemetry {
  const workflowPath = opts.workflowPath ?? 'ops-telemetry';
  const log = opts.log ?? ((m) => console.error(m));

  const send = (event: Omit<FailureEvent, 'app' | 'at'>): void => {
    const full: FailureEvent = { app: opts.app, at: new Date().toISOString(), ...event };
    log(`[telemetry] ${full.app} ${full.method} ${full.route} -> ${full.status}: ${full.message}`);
    void opts.n8n.trigger(workflowPath, full).catch((e) => {
      log(`[telemetry] n8n alert delivery failed: ${(e as Error).message}`);
    });
  };

  return {
    reportFailure: send,
    errorMiddleware(err, req, res, _next) {
      const message = err instanceof Error ? err.message : String(err);
      send({ route: req.path, method: req.method, status: 500, message });
      if (!res.headersSent) {
        res.status(500).json({ error: 'internal_error' });
      }
    },
  };
}
