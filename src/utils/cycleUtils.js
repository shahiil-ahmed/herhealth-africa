import { Timestamp } from 'firebase/firestore';

/**
 * Calculates current cycle day and phase based on last period start date and cycle length.
 * 
 * @param {Timestamp|Date|string} lastPeriodStart 
 * @param {number} cycleLength 
 * @returns {object|null} { day, phase } or null
 */
export const calculateCyclePhase = (lastPeriodStart, cycleLength = 28) => {
  if (!lastPeriodStart) return null;

  // Normalize date input
  const start = lastPeriodStart instanceof Timestamp 
    ? lastPeriodStart.toDate() 
    : new Date(lastPeriodStart);
    
  // Set time to midnight for accurate day difference
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startNormalized = new Date(start);
  startNormalized.setHours(0, 0, 0, 0);

  const diffTime = today - startNormalized;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  const currentDay = diffDays + 1;

  if (currentDay < 1) return { day: 1, phase: "Menstrual phase" };

  // Calculate scaled thresholds based on a standard 28-day model
  // Menstrual: 1-5 (5 days)
  // Follicular: 6-13 (8 days)
  // Ovulatory: 14 (1 day)
  // Luteal: 15-28 (14 days)
  const mEnd = Math.round((5 / 28) * cycleLength);
  const fEnd = Math.round((13 / 28) * cycleLength);
  const oDay = Math.round((14 / 28) * cycleLength);

  let phaseName = "";
  if (currentDay > cycleLength) {
    phaseName = "Late";
  } else if (currentDay <= mEnd) {
    phaseName = "Menstrual phase";
  } else if (currentDay <= fEnd) {
    phaseName = "Follicular phase";
  } else if (currentDay === oDay) {
    phaseName = "Ovulatory phase";
  } else {
    phaseName = "Luteal phase";
  }

  return { day: currentDay, phase: phaseName };
};
