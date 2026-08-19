/**
 * workflow-agent.ts — Interactive Step-Through Agent for Local Business Automations
 *
 * Provides node-by-node execution tracing for the 4 core workflows:
 * 1. crm-sync.json (Customer & Order Ingestion)
 * 2. gratitude-loop.json (2-Hour Post-Visit Gratitude & Care Video Loop)
 * 3. slow-trickle-drip.json (Slow-Trickle Rebooking & Repurchase Cadence)
 * 4. vip-weekly.json (VIP High-LTV Surprise & Delight Concierge)
 */

export interface WorkflowNodeStep {
  nodeId: string;
  name: string;
  type: string;
  status: 'pending' | 'running' | 'success' | 'warning';
  durationMs: number;
  inputSummary: Record<string, any>;
  outputSummary: Record<string, any>;
  agentLog: string;
}

export interface WorkflowExecutionPlan {
  workflowKey: 'crm-sync' | 'gratitude-loop' | 'slow-trickle-drip' | 'vip-weekly';
  title: string;
  description: string;
  totalSteps: number;
  steps: WorkflowNodeStep[];
}

export const WORKFLOW_PLANS: Record<string, WorkflowExecutionPlan> = {
  'crm-sync': {
    workflowKey: 'crm-sync',
    title: 'Customer Data & Transaction Normalizer',
    description: 'Ingests transaction CSV data and in-store customer check-ins, hashes sensitive PII, and calculates RFMD loyalty tiers.',
    totalSteps: 4,
    steps: [
      {
        nodeId: 'node_data_ingest',
        name: 'Customer Webhook & CSV Ingestion Trigger',
        type: 'Webhook Trigger',
        status: 'success',
        durationMs: 42,
        inputSummary: { format: 'Normalized CSV/JSON', recordsCount: 18 },
        outputSummary: { rawLeads: 18, status: 'Payload Validated' },
        agentLog: 'Ingested 18 customer transaction records. Verified schema integrity.',
      },
      {
        nodeId: 'node_pii_hasher',
        name: 'Privacy Shield & SHA-256 Hasher',
        type: 'Crypto Function',
        status: 'success',
        durationMs: 18,
        inputSummary: { sanitizePhone: true, hashField: 'phone' },
        outputSummary: { anonymizedHashes: 18, piiRemovedFromCloud: true },
        agentLog: 'Hashed customer contacts with salt. Customer private information remains protected.',
      },
      {
        nodeId: 'node_rfmd_calc',
        name: 'RFMD Score & Loyalty Tier Calculator',
        type: 'Analytics Engine',
        status: 'success',
        durationMs: 65,
        inputSummary: { recencyWeight: 0.35, frequencyWeight: 0.25, monetaryWeight: 0.4 },
        outputSummary: { tierVIP: 4, tierActive: 9, tierLapsing: 5 },
        agentLog: 'Classified 4 patrons into VIP Tier (Score > 80) and 5 into 45-day win-back queue.',
      },
      {
        nodeId: 'node_crm_update',
        name: 'Update App Store & Trigger Workflows',
        type: 'Database Sink',
        status: 'success',
        durationMs: 34,
        inputSummary: { targetStore: 'AppStore Local / SQLite', updatedProfiles: 18 },
        outputSummary: { status: 'Sync Complete', timestamp: new Date().toISOString() },
        agentLog: 'Updated local memory database. Queued downstream re-engagement sequences.',
      },
    ],
  },
  'gratitude-loop': {
    workflowKey: 'gratitude-loop',
    title: '2-Hour Post-Visit Gratitude & Care Video Loop',
    description: 'Dispatches automated personalized thank-you email/SMS with video care guide and 5-star Google review prompt.',
    totalSteps: 4,
    steps: [
      {
        nodeId: 'node_checkout_event',
        name: 'Visit/Checkout Completed (+2h Timer)',
        type: 'Scheduler / Delay Trigger',
        status: 'success',
        durationMs: 22,
        inputSummary: { guestName: 'Sophia Miller', itemOrService: 'Seasonal Showcase & Consultation' },
        outputSummary: { delayMs: 7200000, triggerTime: 'Checkout + 120min' },
        agentLog: 'Customer visit completed at 2:15 PM. Scheduled gratitude dispatch for 4:15 PM.',
      },
      {
        nodeId: 'node_video_matcher',
        name: 'AI Video Recommender & Embedder',
        type: 'AI Matcher',
        status: 'success',
        durationMs: 38,
        inputSummary: { serviceName: 'Seasonal Showcase', category: 'general' },
        outputSummary: { selectedVideo: 'VIP Welcome & Reward Guide (8s)', embedBadge: 'Active' },
        agentLog: 'Matched 8-second customer appreciation video to embed into client message.',
      },
      {
        nodeId: 'node_msg_dispatcher',
        name: 'Personalized Email & SMS Dispatcher',
        type: 'Dispatch Pipeline Node',
        status: 'success',
        durationMs: 110,
        inputSummary: { to: 'sophia@example.com', template: 'Gratitude + Video + Review Link' },
        outputSummary: { messageId: 'msg_98127391', status: 'Delivered', cost: '$0.00' },
        agentLog: 'Email & SMS delivered to guest with personalized thank you and video preview.',
      },
      {
        nodeId: 'node_review_tracker',
        name: 'Google Review & Opt-In Tracker',
        type: 'Telemetry Node',
        status: 'success',
        durationMs: 20,
        inputSummary: { trackingUrl: 'https://localbiz.link/rev/sophia', expiresHours: 48 },
        outputSummary: { optInRecorded: true, satisfactionScore: 5.0 },
        agentLog: 'Gratitude loop executed successfully. Logged to audit trail.',
      },
    ],
  },
  'slow-trickle-drip': {
    workflowKey: 'slow-trickle-drip',
    title: 'Slow-Trickle Customer Re-Engagement Cadence',
    description: 'Releases re-engagement reminders in 15-message/hour batches (+3wk, +6wk, +10wk) to prevent customer service bottlenecks.',
    totalSteps: 4,
    steps: [
      {
        nodeId: 'node_cadence_evaluator',
        name: 'Cadence Evaluator (3wk / 6wk / 10wk)',
        type: 'Batch Evaluator',
        status: 'success',
        durationMs: 45,
        inputSummary: { scanInterval: 'Daily at 9:00 AM', criteria: 'Days since last visit >= 28' },
        outputSummary: { eligibleGuests: 23, stage3Wk: 12, stage6Wk: 7, stage10Wk: 4 },
        agentLog: 'Identified 23 patrons due for seasonal refresh, check-in, or repeat order.',
      },
      {
        nodeId: 'node_rate_governor',
        name: 'Rate Limiter & Phone Line Governor',
        type: 'Rate Limiter',
        status: 'success',
        durationMs: 15,
        inputSummary: { maxPerHour: 15, currentHourReleased: 0 },
        outputSummary: { batch1Size: 15, queuedForNextHour: 8 },
        agentLog: 'Throttled batch to 15 messages this hour to maintain smooth staff workflow.',
      },
      {
        nodeId: 'node_dynamic_offer',
        name: 'Game Voucher & End-Video Attacher',
        type: 'Offer Generator',
        status: 'success',
        durationMs: 50,
        inputSummary: { gamePerkCode: 'RETAIL25', voucherValue: '$25 OFF' },
        outputSummary: { personalizedLinks: 15, videoAttached: 'New Season Preview (9s)' },
        agentLog: 'Generated 15 trackable re-engagement vouchers with interactive game access.',
      },
      {
        nodeId: 'node_drip_broadcast',
        name: 'Multi-Channel Push & Logging',
        type: 'Broadcast Node',
        status: 'success',
        durationMs: 88,
        inputSummary: { channels: ['Email', 'SMS'] },
        outputSummary: { successfulSends: 15, failedSends: 0 },
        agentLog: 'Batch 1 released. Remaining 8 scheduled for T+60 minutes.',
      },
    ],
  },
  'vip-weekly': {
    workflowKey: 'vip-weekly',
    title: 'VIP High-LTV Surprise & Delight Concierge',
    description: 'Weekly evaluation of top spenders granting exclusive perks, priority reservation slots, and surprise upgrades.',
    totalSteps: 3,
    steps: [
      {
        nodeId: 'node_vip_filter',
        name: 'LTV & Spend Frequency Evaluator',
        type: 'SQL / Memory Filter',
        status: 'success',
        durationMs: 35,
        inputSummary: { minSpendYear: 500, minVisits: 4, rankPercentile: 'Top 15%' },
        outputSummary: { qualifyingVIPs: 32, newVIPsThisWeek: 3 },
        agentLog: 'Identified 32 VIP patrons. 3 newly promoted to Gold Tier this week.',
      },
      {
        nodeId: 'node_perk_assigner',
        name: 'Perk Allocation Engine',
        type: 'Catalog Matcher',
        status: 'success',
        durationMs: 25,
        inputSummary: { perkPool: ['Complimentary VIP Gift', 'Priority Weekend Window', '$25 Store Credit'] },
        outputSummary: { perksAssigned: 3, notificationMethod: 'Direct VIP Email & SMS' },
        agentLog: 'Assigned personalized perks without requiring coupon code hunting.',
      },
      {
        nodeId: 'node_vip_notify',
        name: 'VIP Notification & Portal Link Dispatch',
        type: 'Notifier & Portal Sink',
        status: 'success',
        durationMs: 70,
        inputSummary: { template: 'VIP Appreciation Concierge' },
        outputSummary: { delivered: 3, redemptionsLogged: 2 },
        agentLog: 'VIP messages sent. 2 patrons viewed reward portal within 30 minutes.',
      },
    ],
  },
};

export function getWorkflowExecutionPlan(workflowKey: string): WorkflowExecutionPlan {
  return WORKFLOW_PLANS[workflowKey] || WORKFLOW_PLANS['crm-sync'];
}
