// Given the timestamp a user started, returns which "day" of content they've
// unlocked so far (day 1 on the day they start, day 2 the next day, etc).
// Content stays unlocked once its day has passed — nothing re-locks.
export function getUnlockedDay(startedAt: string): number {
  const start = new Date(startedAt);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return diffDays + 1;
}
