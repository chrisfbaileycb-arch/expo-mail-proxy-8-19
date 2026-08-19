import { describe, it, expect } from 'vitest';
import { ContextBuffer, DISCLAIMERS, ackToken } from '../src/index.js';

const day = (s: string) => new Date(s);

const events = [
  {
    id: 'valpak-rush',
    title: 'Valpak campaign weekend rush',
    start: '2026-06-12T00:00:00Z',
    end: '2026-06-14T23:59:59Z',
    flag: 'EVENT_LOCK',
  },
  {
    id: 'maintenance',
    title: 'POS maintenance window',
    start: '2026-06-13T02:00:00Z',
    end: '2026-06-13T04:00:00Z',
    flag: 'OFFLINE_MODE',
  },
];

describe('site-wide context buffer', () => {
  it('NORMAL outside any event: auto-actions allowed, 20% manual-review threshold', () => {
    const buf = new ContextBuffer(events);
    const policy = buf.policyAt(day('2026-06-10T12:00:00Z'));
    expect(policy.state).toBe('NORMAL');
    expect(policy.allowAutoActions).toBe(true);
    expect(policy.manualReviewAbovePct).toBe(20);
  });

  it('EVENT_LOCK during the rush: auto-actions frozen, 5% threshold forces manual review', () => {
    const buf = new ContextBuffer(events);
    const policy = buf.policyAt(day('2026-06-12T18:00:00Z'));
    expect(policy.state).toBe('EVENT_LOCK');
    expect(policy.allowAutoActions).toBe(false);
    expect(policy.manualReviewAbovePct).toBe(5);
    expect(policy.activeEvents.map((e) => e.id)).toContain('valpak-rush');
  });

  it('OFFLINE_MODE dominates EVENT_LOCK when both are active', () => {
    const buf = new ContextBuffer(events);
    expect(buf.stateAt(day('2026-06-13T03:00:00Z'))).toBe('OFFLINE_MODE');
  });

  it('fromJson tolerates garbage and add/remove updates state', () => {
    const buf = ContextBuffer.fromJson('not-json');
    expect(buf.stateAt()).toBe('NORMAL');
    buf.addEvent({ ...events[0], start: '2000-01-01T00:00:00Z', end: '2100-01-01T00:00:00Z' });
    expect(buf.stateAt()).toBe('EVENT_LOCK');
    expect(buf.removeEvent('valpak-rush')).toBe(true);
    expect(buf.stateAt()).toBe('NORMAL');
  });

  it('rejects malformed events', () => {
    expect(() => new ContextBuffer([{ id: 'x' }])).toThrow();
  });
});

describe('manual_import consent class', () => {
  it('exists with personal-review language and a distinct ack token', () => {
    expect(DISCLAIMERS.manual_import.text).toContain('personally reviewed');
    expect(ackToken('manual_import')).toBe('agentic-disclaimer-v1:manual_import');
  });
});
