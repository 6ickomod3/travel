import type { Trip, TripLinkedPlan } from '../data/types.ts';
import { routeMetrics } from './trip-route-options.ts';

/** The full panel belongs to its final day so fragment navigation can reveal it. */
export function linkedPlanAnchor(plan: TripLinkedPlan): string {
  const lastDay = plan.days[plan.days.length - 1];
  if (!lastDay) throw new RangeError(`Linked plan "${plan.id}" has no dates.`);
  return `day-${lastDay.date}-linked-plan-${plan.id}`;
}

/** Resolve canonical alternatives without copying their schedules or metrics. */
export function linkedPlansForDate(trip: Trip, date: string) {
  return (trip.linkedPlans ?? [])
    .filter(plan => plan.days.some(reference => reference.date === date))
    .map(plan => {
      const days = plan.days.map(reference => {
        const day = trip.days.find(item => item.date === reference.date);
        const alternative = day?.alternatives?.find(item => item.id === reference.alternativeId);
        if (!day || !alternative) {
          throw new RangeError(`Linked plan "${plan.id}" references an unknown alternative on ${reference.date}.`);
        }
        return {
          day,
          alternative,
          metrics: routeMetrics(alternative),
          alternativeAnchor: `alternative-${day.date}-${alternative.id}`,
        };
      });
      return {
        plan,
        days,
        anchorId: linkedPlanAnchor(plan),
        lastDate: days[days.length - 1].day.date,
      };
    });
}
