/**
 * Strict Weekly Cadence — Sunday-Anchor. Every operational workflow
 * terminates its execution cycle at the following Sunday, planning inputs
 * queue up to 3 weeks ahead as Future-States, and a Single-Active-Workflow
 * invariant blocks new cycles until the prior cycle completed AND the
 * Sunday CSV ingestion validated. The 30-day Spin-the-Wheel campaign is
 * explicitly exempt: it runs on its own background agentic track.
 */

const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;

/** UTC midnight of the Sunday that STARTS the cycle containing `date`. */
export function cycleStart(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  return new Date(d.getTime() - d.getUTCDay() * DAY_MS);
}

/** The Sunday hard-stop for any process started at `date`: the NEXT Sunday boundary. */
export function sundayHardStop(date: Date): Date {
  return new Date(cycleStart(date).getTime() + WEEK_MS);
}

export interface StartClassification {
  startedAt: string;
  hardStopAt: string;
  daysRemaining: number;
  partialWeek: boolean;
  warning?: string;
  suggestedStart?: string;
}

/**
 * Devil's-advocate guard: starts late in the week get a truncated learning
 * window. Anything with fewer than 4 full execution days (Thursday or later)
 * is flagged PARTIAL-WEEK with an explicit shift-to-next-cycle suggestion.
 */
export function classifyStart(date: Date): StartClassification {
  const hardStop = sundayHardStop(date);
  const startMidnight = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const daysRemaining = Math.round((hardStop.getTime() - startMidnight) / DAY_MS);
  const partialWeek = daysRemaining < 4;
  const out: StartClassification = {
    startedAt: date.toISOString(),
    hardStopAt: hardStop.toISOString(),
    daysRemaining,
    partialWeek,
  };
  if (partialWeek) {
    out.warning =
      `Initiating now provides only ${daysRemaining} day(s) of execution before the ` +
      'Sunday hard-stop — likely not enough data for meaningful conclusions. ' +
      'Would you like to shift this to the full cycle starting next Sunday?';
    out.suggestedStart = hardStop.toISOString();
  }
  return out;
}

/** Process types running on the decoupled background track (no Sunday hard-stop). */
const CADENCE_EXEMPT = new Set(['marketing.spin_wheel_30d']);

export function isCadenceExempt(processType: string): boolean {
  return CADENCE_EXEMPT.has(processType);
}

export type CycleStatus = 'ACTIVE' | 'COMPLETED' | 'TERMINATED_HARD_STOP';
export type PlanStatus = 'QUEUED' | 'VALIDATED_ACTIVE' | 'REJECTED';

export interface Cycle {
  weekOf: string; // ISO date of the anchor Sunday that starts the cycle
  startedAt: string;
  hardStopAt: string;
  status: CycleStatus;
  classification: StartClassification;
}

export interface FutureState<P = unknown> {
  id: string;
  targetWeekOf: string;
  plan: P;
  status: PlanStatus;
  submittedAt: string;
  note?: string;
}

export class CadenceError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = 'CadenceError';
  }
}

export class CadenceScheduler<P = unknown> {
  private active: Cycle | null = null;
  private history: Cycle[] = [];
  private futureStates: FutureState<P>[] = [];
  private lastIngestionValidatedWeek: string | null = null;
  private seq = 0;

  constructor(private readonly clock: () => Date = () => new Date()) {}

  /** Queue a planning input up to 3 weeks ahead. Beyond that → rejected. */
  submitPlan(plan: P, targetWeekOf?: string): FutureState<P> {
    const now = this.clock();
    const currentWeek = cycleStart(now);
    const target = targetWeekOf
      ? cycleStart(new Date(targetWeekOf))
      : new Date(currentWeek.getTime() + WEEK_MS);
    const weeksAhead = Math.round((target.getTime() - currentWeek.getTime()) / WEEK_MS);
    if (weeksAhead < 0) throw new CadenceError('PAST_WEEK', 'Target week is in the past');
    if (weeksAhead > 3) {
      throw new CadenceError(
        'BEYOND_PROJECTION_HORIZON',
        'Planning inputs are accepted at most 3 weeks in advance',
      );
    }
    const fs: FutureState<P> = {
      id: `fs-${++this.seq}`,
      targetWeekOf: target.toISOString().slice(0, 10),
      plan,
      status: 'QUEUED',
      submittedAt: now.toISOString(),
    };
    this.futureStates.push(fs);
    return fs;
  }

  /**
   * Sunday ingestion window: called when the weekly CSV import has been
   * strictly validated. Completes nothing by itself but unlocks the next
   * cycle and validates queued Future-States targeting the opening week.
   */
  openIngestionWindow(csvValidated: boolean): FutureState<P>[] {
    const now = this.clock();
    if (!csvValidated) {
      throw new CadenceError('INGESTION_NOT_VALIDATED', 'CSV import has not passed validation');
    }
    const week = cycleStart(now).toISOString().slice(0, 10);
    this.lastIngestionValidatedWeek = week;
    const activated: FutureState<P>[] = [];
    for (const fs of this.futureStates) {
      if (fs.status === 'QUEUED' && fs.targetWeekOf === week) {
        fs.status = 'VALIDATED_ACTIVE';
        activated.push(fs);
      }
    }
    return activated;
  }

  /**
   * Single-Active-Workflow: refuses while a cycle is active, and refuses
   * until this week's ingestion has validated.
   */
  startCycle(): Cycle {
    const now = this.clock();
    this.enforceHardStop();
    if (this.active) {
      throw new CadenceError('CYCLE_IN_PROGRESS', 'Previous Sunday-anchor cycle is not complete');
    }
    const week = cycleStart(now).toISOString().slice(0, 10);
    if (this.lastIngestionValidatedWeek !== week) {
      throw new CadenceError(
        'INGESTION_PENDING',
        'New cycle blocked until this week\'s CSV ingestion validates',
      );
    }
    this.active = {
      weekOf: week,
      startedAt: now.toISOString(),
      hardStopAt: sundayHardStop(now).toISOString(),
      status: 'ACTIVE',
      classification: classifyStart(now),
    };
    return this.active;
  }

  completeCycle(): Cycle {
    if (!this.active) throw new CadenceError('NO_ACTIVE_CYCLE', 'No active cycle to complete');
    this.active.status = 'COMPLETED';
    this.history.push(this.active);
    const done = this.active;
    this.active = null;
    return done;
  }

  /** Sunday hard-stop: terminate the active cycle once its boundary passes. */
  enforceHardStop(): Cycle | null {
    const now = this.clock();
    if (this.active && now.getTime() >= new Date(this.active.hardStopAt).getTime()) {
      this.active.status = 'TERMINATED_HARD_STOP';
      this.history.push(this.active);
      const stopped = this.active;
      this.active = null;
      return stopped;
    }
    return null;
  }

  activeCycle(): Cycle | null {
    this.enforceHardStop();
    return this.active;
  }

  pendingFutureStates(): FutureState<P>[] {
    return this.futureStates.filter((f) => f.status === 'QUEUED');
  }

  cycleHistory(): Cycle[] {
    return [...this.history];
  }
}
