import type { Trip, TripEntry, TripPlaceholder } from "./types";

export type * from "./types";

const tripModules = import.meta.glob<TripEntry>("../../itineraries/*/trip.ts", {
  eager: true,
  import: "default",
});

const slugs = new Set<string>();
const discovered: TripEntry[] = Object.entries(tripModules)
  .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
  .map(([path, trip]) => {
    if (!trip || typeof trip !== "object" || typeof trip.slug !== "string") {
      throw new Error(`Trip module "${path}" must default-export a trip with a slug.`);
    }
    if (slugs.has(trip.slug)) {
      throw new Error(`Duplicate trip slug: "${trip.slug}".`);
    }

    const folder = path.split("/").at(-2);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trip.slug) || trip.slug !== folder) {
      throw new Error(`Trip slug "${trip.slug}" must match its lowercase folder name in "${path}".`);
    }
    slugs.add(trip.slug);
    return trip;
  });

/** Keep dated itineraries and year-only placeholders available separately. */
export const trips: Trip[] = discovered.filter((trip): trip is Trip =>
  !("kind" in trip && trip.kind === "placeholder"),
);

export const tripPlaceholders: TripPlaceholder[] = discovered.filter(
  (trip): trip is TripPlaceholder => "kind" in trip && trip.kind === "placeholder",
);

/** Preserve the registry API and place dated itineraries before placeholders. */
export const tripCollection: TripEntry[] = [...trips, ...tripPlaceholders];
