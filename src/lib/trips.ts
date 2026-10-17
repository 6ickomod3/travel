import type { Trip, TripEntry, TripPlaceholder, TripLocalName } from "../data/trips";

type TripDates = Pick<Trip, "startDate" | "endDate">;
type TripStatusInput = TripDates & Pick<Trip, "status">;

export type DisplayStatus = "Planning" | "Upcoming" | "Traveling" | "Past" | "Completed";

export type NextTripCandidate = Pick<Trip, "slug" | "startDate" | "endDate" | "status">;
export type VisitedTripReference = Pick<Trip, "slug" | "title">;

export interface VisitedLocation {
  /** Country code plus the destination's stable identifier across trips. */
  id: string;
  name: string;
  localName?: TripLocalName;
  englishName?: string;
  lat: number;
  lng: number;
  country: string;
  countryCode: string;
  tripCount: number;
  trips: VisitedTripReference[];
}

export interface VisitedCountry {
  country: string;
  countryCode: string;
  locationCount: number;
  tripCount: number;
}

export interface VisitedAtlas {
  locations: VisitedLocation[];
  countries: VisitedCountry[];
  locationCount: number;
  countryCount: number;
  tripCount: number;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function isPlaceholderTrip(trip: TripEntry): trip is TripPlaceholder {
  return "kind" in trip && trip.kind === "placeholder";
}

export function tripYear(trip: TripEntry): number {
  return isPlaceholderTrip(trip) ? trip.year : Number(trip.startDate.slice(0, 4));
}

/** Keep year-only entries after dated trips within the same year. */
export function compareTripEntries(a: TripEntry, b: TripEntry): number {
  const yearDifference = tripYear(b) - tripYear(a);
  if (yearDifference) return yearDifference;
  if (isPlaceholderTrip(a) || isPlaceholderTrip(b)) {
    return Number(isPlaceholderTrip(a)) - Number(isPlaceholderTrip(b));
  }
  return b.startDate.localeCompare(a.startDate);
}

export function placeholderStatusLabel(locale = "en"): string {
  return locale.startsWith("zh") ? "行程待补充" : "Coming soon";
}

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

function isPlaceholderCandidate<T extends NextTripCandidate>(
  trip: T | TripPlaceholder,
): trip is TripPlaceholder {
  return "kind" in trip && trip.kind === "placeholder";
}

/**
 * Prefer an active date range, including its final UTC calendar day, then the
 * earliest future start. Equal ranges use start, end, and slug for stable ties.
 * Placeholders, completed trips, and ended plans cannot become the next trip.
 */
export function selectNextTrip<T extends NextTripCandidate>(
  entries: readonly (T | TripPlaceholder)[],
  now: Date = new Date(),
): T | undefined {
  const today = calendarDate(now.toISOString().slice(0, 10)).getTime();
  const candidates: Array<{ trip: T; start: number; end: number; active: boolean }> = [];

  for (const trip of entries) {
    if (isPlaceholderCandidate(trip) || trip.status === "completed") continue;

    const start = calendarDate(trip.startDate).getTime();
    const end = calendarDate(trip.endDate).getTime();
    if (end < start) {
      throw new RangeError("A trip's end date must be on or after its start date.");
    }
    if (end < today) continue;

    candidates.push({ trip, start, end, active: start <= today });
  }

  candidates.sort((a, b) =>
    Number(b.active) - Number(a.active)
    || a.start - b.start
    || a.end - b.end
    || a.trip.slug.localeCompare(b.trip.slug),
  );
  return candidates[0]?.trip;
}

/**
 * Completed status explicitly confirms a trip and its recorded destinations.
 * Calendar dates never establish a visit. Reused destination identifiers within
 * the same country share one place while retaining each completed trip link.
 */
export function aggregateVisitedAtlas(entries: readonly TripEntry[]): VisitedAtlas {
  const tripSlugs = new Set<string>();
  const locationRecords = new Map<string, Omit<VisitedLocation, "tripCount">>();
  const countryRecords = new Map<string, {
    country: string;
    countryCode: string;
    locationIds: Set<string>;
    tripSlugs: Set<string>;
  }>();

  for (const trip of entries) {
    if (isPlaceholderTrip(trip) || trip.status !== "completed" || tripSlugs.has(trip.slug)) {
      continue;
    }
    tripSlugs.add(trip.slug);

    const countryCode = trip.countryCode.trim().toUpperCase();
    let country = countryRecords.get(countryCode);
    if (!country) {
      country = {
        country: trip.country,
        countryCode,
        locationIds: new Set<string>(),
        tripSlugs: new Set<string>(),
      };
      countryRecords.set(countryCode, country);
    }
    country.tripSlugs.add(trip.slug);

    for (const destination of trip.destinations) {
      const id = `${countryCode.toLowerCase()}:${destination.id.trim().toLowerCase()}`;
      country.locationIds.add(id);
      let location = locationRecords.get(id);
      if (!location) {
        location = {
          id,
          name: destination.name,
          localName: destination.localName,
          englishName: destination.englishName,
          lat: destination.lat,
          lng: destination.lng,
          country: trip.country,
          countryCode,
          trips: [],
        };
        locationRecords.set(id, location);
      } else {
        if (!location.englishName && destination.englishName) location.englishName = destination.englishName;
        if (!location.localName && destination.localName) location.localName = destination.localName;
      }

      if (!location.trips.some(reference => reference.slug === trip.slug)) {
        location.trips.push({ slug: trip.slug, title: trip.title });
      }
    }
  }

  const locations = [...locationRecords.values()]
    .map(location => ({ ...location, tripCount: location.trips.length }))
    .sort((a, b) =>
      a.countryCode.localeCompare(b.countryCode)
      || (a.englishName || a.name).localeCompare(b.englishName || b.name, "en")
      || a.id.localeCompare(b.id),
    );
  const countries = [...countryRecords.values()]
    .map(country => ({
      country: country.country,
      countryCode: country.countryCode,
      locationCount: country.locationIds.size,
      tripCount: country.tripSlugs.size,
    }))
    .sort((a, b) => a.countryCode.localeCompare(b.countryCode));

  return {
    locations,
    countries,
    locationCount: locations.length,
    countryCount: countries.length,
    tripCount: tripSlugs.size,
  };
}
