import type { TripDay, TripDiningOption, TripMeal } from '../data/types';

export interface DiningUsage {
  date: string;
  meal: TripMeal;
  label?: string;
  note?: string;
  anchorId: string;
}

export interface DiningReservationReminder {
  option: TripDiningOption & { reservation: NonNullable<TripDiningOption['reservation']> };
  usages: DiningUsage[];
  firstDate: string;
}

export const diningSectionId = (date: string) => `dining-${date}`;
export const diningChoiceId = (date: string, meal: TripMeal, optionId: string) => `dining-${date}-${meal}-${optionId}`;

export function diningMealLabel(meal: TripMeal, locale: 'zh-CN' | 'en' = 'en'): string {
  const labels: Record<TripMeal, [string, string]> = {
    breakfast: ['早餐', 'Breakfast'],
    lunch: ['午餐', 'Lunch'],
    dinner: ['晚餐', 'Dinner'],
    snack: ['加餐', 'Snack'],
  };
  return labels[meal][locale === 'zh-CN' ? 0 : 1];
}

export function diningPolicyLabel(policy: NonNullable<TripDiningOption['reservation']>['policy'], locale: 'zh-CN' | 'en' = 'en'): string {
  const labels: Record<typeof policy, [string, string]> = {
    required: ['需预约', 'Reservation required'],
    recommended: ['建议预约', 'Reservation recommended'],
    none: ['无需预约', 'No reservation needed'],
    check: ['预约方式待确认', 'Check reservation policy'],
  };
  return labels[policy][locale === 'zh-CN' ? 0 : 1];
}

export function diningPhoneHref(phone?: string): string | undefined {
  const number = phone?.replace(/[^\d+]/g, '');
  return number && /^\+?\d+$/.test(number) ? `tel:${number}` : undefined;
}

/** Reminders describe unbooked candidates for the accepted route, ordered by their first meal date. */
export function getDiningReservationReminders(
  days: readonly Pick<TripDay, 'date' | 'dining'>[],
  options: readonly TripDiningOption[],
): DiningReservationReminder[] {
  const optionsById = new Map(options.map(option => [option.id, option]));
  const groups = new Map<string, { option: DiningReservationReminder['option']; usages: DiningUsage[]; order: number }>();
  for (const day of days) {
    for (const meal of day.dining ?? []) {
      for (const choice of meal.choices) {
        if (choice.reservationStatus === 'booked' || choice.requiresItineraryChange) continue;
        const option = optionsById.get(choice.optionId);
        const reservation = option?.reservation;
        if (!option || !reservation || reservation.policy === 'none') continue;
        let group = groups.get(option.id);
        if (!group) {
          group = { option: { ...option, reservation }, usages: [], order: groups.size };
          groups.set(option.id, group);
        }
        group.usages.push({
          date: day.date,
          meal: meal.meal,
          label: meal.label,
          note: choice.note,
          anchorId: diningChoiceId(day.date, meal.meal, option.id),
        });
      }
    }
  }
  return [...groups.values()].map(group => {
    const usages = [...group.usages].sort((a, b) => a.date.localeCompare(b.date));
    return { ...group, usages, firstDate: usages[0].date };
  }).sort((a, b) => a.firstDate.localeCompare(b.firstDate) || a.order - b.order)
    .map(({ option, usages, firstDate }) => ({ option, usages, firstDate }));
}
