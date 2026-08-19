import { z } from 'zod';

/**
 * Context-Aware Guardrails — Site-Wide Context Buffer. A calendar/event
 * module drives a single system-state flag consumed by every agentic
 * surface: the Integration Gateway freezes auto-actions and the Dashboard
 * disables Auto-Optimize controls while an event is active.
 */

export const SystemState = z.enum(['NORMAL', 'EVENT_LOCK', 'OFFLINE_MODE']);
export type SystemState = z.infer<typeof SystemState>;

export const CalendarEvent = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  start: z.string().datetime(),
  end: z.string().datetime(),
  flag: z.enum(['EVENT_LOCK', 'OFFLINE_MODE']),
});
export type CalendarEvent = z.infer<typeof CalendarEvent>;

export interface FreezePolicy {
  state: SystemState;
  /** Budget deviation (pct) above which Manual Review is forced. 20 normally, 5 when locked. */
  manualReviewAbovePct: number;
  /** Whether agentic auto-actions (Auto-Optimize / Auto-Ad-Adjustment) may run. */
  allowAutoActions: boolean;
  /** Active events justifying the state (for UI display). */
  activeEvents: CalendarEvent[];
}

export class ContextBuffer {
  private events: CalendarEvent[] = [];

  constructor(events: unknown[] = []) {
    for (const e of events) this.addEvent(e);
  }

  /** Parse events from an env-supplied JSON array; invalid JSON → empty buffer. */
  static fromJson(json: string | undefined): ContextBuffer {
    if (!json) return new ContextBuffer();
    try {
      const arr = JSON.parse(json);
      return new ContextBuffer(Array.isArray(arr) ? arr : []);
    } catch {
      return new ContextBuffer();
    }
  }

  addEvent(event: unknown): CalendarEvent {
    const parsed = CalendarEvent.parse(event);
    this.events = this.events.filter((e) => e.id !== parsed.id).concat(parsed);
    return parsed;
  }

  removeEvent(id: string): boolean {
    const before = this.events.length;
    this.events = this.events.filter((e) => e.id !== id);
    return this.events.length < before;
  }

  activeEvents(now: Date = new Date()): CalendarEvent[] {
    const t = now.getTime();
    return this.events.filter(
      (e) => new Date(e.start).getTime() <= t && t <= new Date(e.end).getTime(),
    );
  }

  /** OFFLINE_MODE dominates EVENT_LOCK dominates NORMAL. */
  stateAt(now: Date = new Date()): SystemState {
    const active = this.activeEvents(now);
    if (active.some((e) => e.flag === 'OFFLINE_MODE')) return 'OFFLINE_MODE';
    if (active.some((e) => e.flag === 'EVENT_LOCK')) return 'EVENT_LOCK';
    return 'NORMAL';
  }

  /** The single policy object every agentic surface consults. */
  policyAt(now: Date = new Date()): FreezePolicy {
    const state = this.stateAt(now);
    return {
      state,
      manualReviewAbovePct: state === 'NORMAL' ? 20 : 5,
      allowAutoActions: state === 'NORMAL',
      activeEvents: this.activeEvents(now),
    };
  }
}
