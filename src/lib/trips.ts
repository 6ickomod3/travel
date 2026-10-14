import type { Trip } from "../data/trips";

type TripDates = Pick<Trip, "startDate" | "endDate">;
type TripStatusInput = TripDates & Pick<Trip, "status">;

export type DisplayStatus = "Planning" | "Upcoming" | "Traveling" | "Past" | "Completed";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

/** Parse a calendar date without the viewer's timezone moving it to another day. */
function calendarDate(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new RangeError(`Expected a YYYY-MM-DD date; received "${value}".`);
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new RangeError(`Invalid calendar date: "${value}".`);
  }

  return date;
}

/** Count both the first and final calendar day of a trip. */
export function durationDays(trip: TripDates): number {
  const start = calendarDate(trip.startDate);
  const end = calendarDate(trip.endDate);

  if (end < start) {
    throw new RangeError("A trip's end date must be on or after its start date.");
  }

  return Math.round((end.getTime() - start.getTime()) / DAY_IN_MS) + 1;
}

/** Keep the supplied calendar day in UTC when formatting in any language. */
export function formatDate(
  date: string,
  options: Intl.DateTimeFormatOptions = {},
  locale = "en-US",
): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    ...options,
    timeZone: "UTC",
  }).format(calendarDate(date));
}

/** Compact ranges such as "Nov 13–21, 2026" also work across months and years. */
export function formatDateRange(trip: TripDates, locale = "en-US"): string {
  const start = calendarDate(trip.startDate);
  const end = calendarDate(trip.endDate);

  if (end < start) {
    throw new RangeError("A trip's end date must be on or after its start date.");
  }

  if (locale.startsWith("zh")) {
    const year = start.getUTCFullYear();
    const endYear = end.getUTCFullYear();
    const month = start.getUTCMonth() + 1;
    const endMonth = end.getUTCMonth() + 1;
    const day = start.getUTCDate();
    const endDay = end.getUTCDate();
    if (trip.startDate === trip.endDate) return `${year}年${month}月${day}日`;
    if (year !== endYear) return `${year}年${month}月${day}日–${endYear}年${endMonth}月${endDay}日`;
    if (month !== endMonth) return `${year}年${month}月${day}日–${endMonth}月${endDay}日`;
    return `${year}年${month}月${day}–${endDay}日`;
  }

  if (trip.startDate === trip.endDate) {
    return formatDate(trip.startDate, { year: "numeric" }, locale);
  }

  if (start.getUTCFullYear() !== end.getUTCFullYear()) {
    return `${formatDate(trip.startDate, { year: "numeric" }, locale)} – ${formatDate(trip.endDate, { year: "numeric" }, locale)}`;
  }

  if (start.getUTCMonth() === end.getUTCMonth()) {
    return `${formatDate(trip.startDate, {}, locale)}–${end.getUTCDate()}, ${end.getUTCFullYear()}`;
  }

  return `${formatDate(trip.startDate, {}, locale)} – ${formatDate(trip.endDate, {}, locale)}, ${end.getUTCFullYear()}`;
}

export function statusLabel(status: DisplayStatus, locale = "en"): string {
  if (!locale.startsWith("zh")) return status;
  return {
    Planning: "筹备中",
    Upcoming: "即将出发",
    Traveling: "旅途中",
    Past: "往期计划",
    Completed: "已完成",
  }[status];
}

/**
 * Planning remains Planning while the itinerary's dates are current or future.
 * Past dates alone do not establish that a planned trip was taken.
 */
export function displayStatus(
  trip: TripStatusInput,
  now: Date = new Date(),
): DisplayStatus {
  const start = calendarDate(trip.startDate).getTime();
  const end = calendarDate(trip.endDate).getTime();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  if (trip.status === "completed") {
    return "Completed";
  }

  if (today > end) return "Past";

  if (trip.status === "planning") {
    return "Planning";
  }

  return today >= start ? "Traveling" : "Upcoming";
}
