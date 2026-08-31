import { Timestamp } from 'firebase/firestore';

export interface CyclePhaseResult {
  day: number;
  phase: string;
}

/**
 * Calculates current cycle day and phase based on last period start date and cycle length.
 * Ported directly from the web app's cycleUtils.js — same business logic.
 *
 * @param lastPeriodStart - Firestore Timestamp, Date, or ISO string
 * @param cycleLength - Average cycle length in days (default 28)
 * @returns CyclePhaseResult or null
 */
export const calculateCyclePhase = (
  lastPeriodStart: Timestamp | Date | string | null | undefined,
  cycleLength: number = 28
): CyclePhaseResult | null => {
  if (!lastPeriodStart) return null;

  // Normalize date input
  let start: Date;
  if (lastPeriodStart instanceof Timestamp) {
    start = lastPeriodStart.toDate();
  } else if (lastPeriodStart instanceof Date) {
    start = lastPeriodStart;
  } else {
    start = new Date(lastPeriodStart);
  }

  // Set time to midnight for accurate day difference
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startNormalized = new Date(start);
  startNormalized.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - startNormalized.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const currentDay = diffDays + 1;

  if (currentDay < 1) return { day: 1, phase: 'Menstrual phase' };

  // Calculate scaled thresholds based on a standard 28-day model
  const mEnd = Math.round((5 / 28) * cycleLength);
  const fEnd = Math.round((13 / 28) * cycleLength);
  const oDay = Math.round((14 / 28) * cycleLength);

  let phaseName = '';
  if (currentDay > cycleLength) {
    phaseName = 'Late';
  } else if (currentDay <= mEnd) {
    phaseName = 'Menstrual phase';
  } else if (currentDay <= fEnd) {
    phaseName = 'Follicular phase';
  } else if (currentDay === oDay) {
    phaseName = 'Ovulatory phase';
  } else {
    phaseName = 'Luteal phase';
  }

  return { day: currentDay, phase: phaseName };
};

/**
 * Returns a color for the given cycle phase
 */
export const getPhaseColor = (phase: string): string => {
  switch (phase) {
    case 'Menstrual phase':
      return '#D4688A';
    case 'Follicular phase':
      return '#F59E0B';
    case 'Ovulatory phase':
      return '#10B981';
    case 'Luteal phase':
      return '#8B5CF6';
    default:
      return '#D4688A';
  }
};
