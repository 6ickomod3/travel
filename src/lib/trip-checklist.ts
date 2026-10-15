import type { TripBookingWindow, TripChecklistItem } from '../data/types';

/** Use actual opening timestamps while keeping date-only entries independent of the viewer's timezone. */
function timingKey(item: TripChecklistItem, bookingWindows: readonly TripBookingWindow[]): number {
  const timing = item.timing;
  if (!timing) return Infinity;
  if (timing.kind === 'asap') return -Infinity;
  if (timing.kind === 'reservation-opens') {
    const openings = bookingWindows.filter(window => timing.bookingWindowIds.includes(window.id));
    return Math.min(...openings.map(window => Date.parse(window.opensAt)));
  }
  return Date.parse(`${timing.date}T00:00:00.000Z`);
}

/** Put immediate actions first and undated items last, preserving the source order for ties. */
export function sortTripChecklist<T extends TripChecklistItem>(
  items: readonly T[],
  bookingWindows: readonly TripBookingWindow[] = [],
): T[] {
  return items.map((item, index) => ({ item, index, time: timingKey(item, bookingWindows) }))
    .sort((a, b) => a.time === b.time ? a.index - b.index : a.time < b.time ? -1 : 1)
    .map(({ item }) => item);
}
