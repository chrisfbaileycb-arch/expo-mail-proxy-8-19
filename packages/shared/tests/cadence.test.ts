import { describe, it, expect } from 'vitest';
import {
  CadenceScheduler,
  CadenceError,
  classifyStart,
  sundayHardStop,
  isCadenceExempt,
} from '../src/index.js';

// 2026-06-07 is a Sunday; 2026-06-10 is a Wednesday; 2026-06-11 a Thursday.
const at = (iso: string) => new Date(iso);

function schedulerAt(start: string) {
  let now = at(start);
  const sched = new CadenceScheduler<{ name: string }>(() => now);
  return { sched, setNow: (iso: string) => (now = at(iso)) };
}

describe('sunday hard-stop', () => {
  it('every start day terminates at the following Sunday', () => {
    expect(sundayHardStop(at('2026-06-10T12:00:00Z')).toISOString()).toBe(
      '2026-06-14T00:00:00.000Z',
    );
    expect(sundayHardStop(at('2026-06-07T00:00:00Z')).toISOString()).toBe(
      '2026-06-14T00:00:00.000Z',
    );
  });

  it('terminates an overrunning cycle at the boundary', () => {
    const { sched, setNow } = schedulerAt('2026-06-07T08:00:00Z');
    sched.openIngestionWindow(true);
    sched.startCycle();
    setNow('2026-06-14T00:00:01Z');
    expect(sched.activeCycle()).toBeNull();
    expect(sched.cycleHistory()[0].status).toBe('TERMINATED_HARD_STOP');
  });
});

describe('partial-week classification (Wednesday starter mitigation)', () => {
  it('Wednesday start is a full plan (4 days)', () => {
    const c = classifyStart(at('2026-06-10T09:00:00Z'));
    expect(c.daysRemaining).toBe(4);
    expect(c.partialWeek).toBe(false);
  });

  it('Thursday start is flagged with the shift-to-next-Sunday warning', () => {
    const c = classifyStart(at('2026-06-11T09:00:00Z'));
    expect(c.daysRemaining).toBe(3);
    expect(c.partialWeek).toBe(true);
    expect(c.warning).toContain('only 3 day(s) of execution');
    expect(c.warning).toContain('next Sunday');
    expect(c.suggestedStart).toBe('2026-06-14T00:00:00.000Z');
  });
});

describe('three-week projection horizon', () => {
  it('accepts plans up to 3 weeks ahead, rejects beyond', () => {
    const { sched } = schedulerAt('2026-06-10T12:00:00Z');
    const fs = sched.submitPlan({ name: 'father-day-push' }, '2026-06-28');
    expect(fs.status).toBe('QUEUED');
    expect(fs.targetWeekOf).toBe('2026-06-28');
    expect(() => sched.submitPlan({ name: 'too-far' }, '2026-07-05')).toThrow(CadenceError);
  });

  it('future-states validate only when the Sunday ingestion window opens', () => {
    const { sched, setNow } = schedulerAt('2026-06-10T12:00:00Z');
    sched.submitPlan({ name: 'next-week' }, '2026-06-14');
    expect(sched.pendingFutureStates()).toHaveLength(1);
    setNow('2026-06-14T06:00:00Z');
    const activated = sched.openIngestionWindow(true);
    expect(activated).toHaveLength(1);
    expect(activated[0].status).toBe('VALIDATED_ACTIVE');
    expect(sched.pendingFutureStates()).toHaveLength(0);
  });
});

describe('single-active-workflow invariant', () => {
  it('blocks a new cycle until ingestion validates, then until completion', () => {
    const { sched, setNow } = schedulerAt('2026-06-07T06:00:00Z');
    expect(() => sched.startCycle()).toThrow(/INGESTION|blocked/i);
    sched.openIngestionWindow(true);
    sched.startCycle();
    expect(() => sched.startCycle()).toThrow(CadenceError);
    sched.completeCycle();
    // next week: still blocked until the NEW Sunday ingestion validates
    setNow('2026-06-14T06:00:00Z');
    expect(() => sched.startCycle()).toThrow(CadenceError);
    sched.openIngestionWindow(true);
    expect(sched.startCycle().weekOf).toBe('2026-06-14');
  });

  it('rejects opening the window without a validated CSV', () => {
    const { sched } = schedulerAt('2026-06-07T06:00:00Z');
    expect(() => sched.openIngestionWindow(false)).toThrow(CadenceError);
  });
});

describe('spin-the-wheel decoupling', () => {
  it('the 30-day campaign is exempt from the weekly cadence', () => {
    expect(isCadenceExempt('marketing.spin_wheel_30d')).toBe(true);
    expect(isCadenceExempt('budget.reconcile')).toBe(false);
  });
});
