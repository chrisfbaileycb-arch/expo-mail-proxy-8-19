/**
 * Operational Legal Layer — enforced informed consent at high-stakes
 * interaction points. Not boilerplate: high-stakes endpoints REFUSE to act
 * (HTTP 428) until the caller explicitly acknowledges the agentic-nature
 * disclaimer by echoing the ack token. UIs render the disclaimer text and
 * send the ack header on confirm.
 */

export type HighStakesAction =
  | 'budget_update'
  | 'data_export'
  | 'platform_integration'
  | 'approval_grant'
  | 'segmentation_run'
  | 'manual_import';

export interface Disclaimer {
  id: string;
  action: HighStakesAction;
  title: string;
  text: string;
}

export const DISCLAIMER_VERSION = 'agentic-disclaimer-v1';
export const ACK_HEADER = 'x-expoproxy-ack';

const BASE_LIABILITY =
  'This operation is executed by an autonomous software agent. Outcomes are ' +
  'produced algorithmically from the data and configuration you provide and are ' +
  'not individually reviewed by a human before execution. To the maximum extent ' +
  'permitted by law, liability is limited to the fees paid for the service; the ' +
  'operator remains responsible for verifying results before relying on them.';

export const DISCLAIMERS: Record<HighStakesAction, Disclaimer> = {
  budget_update: {
    id: DISCLAIMER_VERSION,
    action: 'budget_update',
    title: 'Autonomous budget reallocation',
    text:
      'You are authorizing an agent to reallocate advertising budget based on ' +
      'computed CAC/ROAS metrics. Spend will shift automatically next cycle. ' +
      BASE_LIABILITY,
  },
  data_export: {
    id: DISCLAIMER_VERSION,
    action: 'data_export',
    title: 'Automated data export',
    text:
      'You are exporting business records assembled by an autonomous pipeline. ' +
      'Verify totals against your POS before filing or accounting use. ' +
      BASE_LIABILITY,
  },
  platform_integration: {
    id: DISCLAIMER_VERSION,
    action: 'platform_integration',
    title: 'External platform action',
    text:
      'You are authorizing an agent to act on an external platform on your ' +
      'behalf through the Integration Gateway. Platform terms of service apply. ' +
      BASE_LIABILITY,
  },
  approval_grant: {
    id: DISCLAIMER_VERSION,
    action: 'approval_grant',
    title: 'Human-in-the-loop approval',
    text:
      'Approving releases a held high-stakes operation for autonomous ' +
      'execution. Review the contract details before approving. ' +
      BASE_LIABILITY,
  },
  segmentation_run: {
    id: DISCLAIMER_VERSION,
    action: 'segmentation_run',
    title: 'Autonomous customer segmentation',
    text:
      'You are running algorithmic customer segmentation that will update CRM ' +
      'records and trigger automated outreach. ' + BASE_LIABILITY,
  },
  manual_import: {
    id: DISCLAIMER_VERSION,
    action: 'manual_import',
    title: 'Manual data import',
    text:
      'You are importing POS data into the persistent store. You confirm you ' +
      'have personally reviewed this file; downstream agents will treat it as ' +
      'authoritative business truth. The file is sanitized and strictly ' +
      'validated, but data accuracy remains your responsibility. ' +
      BASE_LIABILITY,
  },
};

/** The exact ack value a caller must send to consent to an action. */
export function ackToken(action: HighStakesAction): string {
  return `${DISCLAIMER_VERSION}:${action}`;
}

/** Minimal structural types so shared stays free of an express dependency. */
interface ReqLike {
  headers: Record<string, unknown>;
}
interface ResLike {
  status(code: number): ResLike;
  json(body: unknown): unknown;
}

/**
 * Express-shaped middleware gate. Without the correct ack header the request
 * is refused with 428 Precondition Required and the full disclaimer payload,
 * so every client can render the exact text and re-submit with consent.
 */
export function requireDisclaimerAck(action: HighStakesAction) {
  return (req: ReqLike, res: ResLike, next: () => void): void => {
    const sent = req.headers[ACK_HEADER];
    if (sent === ackToken(action)) {
      next();
      return;
    }
    res.status(428).json({
      error: 'disclaimer_acknowledgement_required',
      disclaimer: DISCLAIMERS[action],
      requiredAckHeader: ACK_HEADER,
      requiredAckValue: ackToken(action),
    });
  };
}
