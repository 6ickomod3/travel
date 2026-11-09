import type { TripDay, TripDayAlternative } from '../data/types';

export function routeMetrics(route: TripDay | TripDayAlternative) {
  const walking = 'date' in route
    ? route.hike && { distanceKm: route.hike.distanceKm }
    : route.walking;
  const optionalStamps = route.stamps?.stops.filter(stop => stop.optional).length ?? 0;
  return {
    busCount: route.busCount,
    walking: walking ? {
      minimum: walking.distanceKm,
      maximum: walking.distanceKm + ('optionalDistanceKm' in walking ? walking.optionalDistanceKm ?? 0 : 0),
    } : undefined,
    stamps: route.stamps ? {
      minimum: route.stamps.stops.length - optionalStamps,
      maximum: route.stamps.stops.length,
    } : undefined,
  };
}
