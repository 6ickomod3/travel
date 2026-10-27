import type { TripTicketOption, TripTransportPlan } from '../data/types';

/** Budget rows reuse the current pass price or known additional leg fares. */
export function getTransportBudget(plan: TripTransportPlan | undefined, ticketOptions: TripTicketOption[] = []) {
  if (!plan) return undefined;
  const legs = new Map(plan.legs.map(leg => [leg.id, leg]));
  const options = new Map(ticketOptions.map(option => [option.id, option]));
  const rows = plan.budgetItems.map(item => {
    if (item.ticketOptionId !== undefined) {
      const option = options.get(item.ticketOptionId);
      if (!option || option.currency !== plan.currency) throw new Error(`Transport budget references an invalid ticket option: ${item.ticketOptionId}`);
      return { id: item.id, label: item.label, amount: option.price, sourceIds: option.sourceIds ?? [] };
    }
    const fares = item.legIds.map(id => {
      const leg = legs.get(id);
      if (!leg || leg.fare === undefined) throw new Error(`Transport budget references an unpriced leg: ${id}`);
      return leg;
    });
    return {
      id: item.id,
      label: item.label,
      amount: fares.reduce((total, leg) => total + leg.fare!, 0),
      sourceIds: [...new Set(fares.flatMap(leg => leg.sourceIds ?? []))],
    };
  });
  return { currency: plan.currency, rows, total: rows.reduce((total, row) => total + row.amount, 0) };
}
