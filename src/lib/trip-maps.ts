import type { TripDay, TripDayMapView, TripMapPlace, TripMapStop } from '../data/types';

export interface ResolvedMapStop extends TripMapStop {
  place: TripMapPlace;
  scheduleHref?: string;
}

export interface ResolvedMapView extends Omit<TripDayMapView, 'stops'> {
  stops: ResolvedMapStop[];
}

export interface ResolvedDayMap {
  defaultViewId: string;
  views: ResolvedMapView[];
}

export function scheduleEntryId(date: string, id: string, alternativeId?: string): string {
  return `day-${date}-${alternativeId ? `alternative-${alternativeId}-` : ''}schedule-entry-${id}`;
}

export function scheduleRowId(date: string, index: number, id?: string, alternativeId?: string): string {
  return id ? scheduleEntryId(date, id, alternativeId)
    : `day-${date}-${alternativeId ? `alternative-${alternativeId}-` : ''}schedule-row-${index + 1}`;
}

export function resolveDayMap(day: TripDay, places: TripMapPlace[]): ResolvedDayMap | undefined {
  if (!day.map) return;
  const byId = new Map(places.map(place => [place.id, place]));
  return {
    defaultViewId: day.map.defaultViewId,
    views: day.map.views.map(view => ({
      ...view,
      stops: view.stops.map(stop => {
        const place = byId.get(stop.placeId);
        if (!place) throw new Error(`${day.date}: unknown map place ${stop.placeId}`);
        return {
          ...stop,
          place,
          scheduleHref: stop.scheduleId ? `#${scheduleEntryId(day.date, stop.scheduleId, view.alternativeId)}` : undefined,
        };
      }),
    })),
  };
}
