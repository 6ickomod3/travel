import type { Trip, TripPaymentStatus } from '../data/types';
import { getDiningBookings } from './trip-dining.ts';
import { getTransportBudget } from './trip-transport.ts';

export function paymentStatusLabel(status: TripPaymentStatus | undefined, locale: 'zh-CN' | 'en' = 'en'): string {
  const labels: Record<TripPaymentStatus, [string, string]> = {
    paid: ['已付款', 'Paid'],
    'pay-on-arrival': ['到店付款', 'Pay on arrival'],
    unknown: ['付款状态待核对', 'Payment status unconfirmed'],
  };
  return labels[status ?? 'unknown'][locale === 'zh-CN' ? 0 : 1];
}

type BudgetContext = Pick<Trip, 'budget' | 'travelers' | 'stays' | 'ticketOptions' | 'transport' | 'days' | 'diningOptions'>;

/** Reuse dated orders and referenced transport fares; allowances never duplicate them. */
export function getTripBudget(trip: BudgetContext) {
  const plan = trip.budget;
  if (!plan) return undefined;
  const partySize = trip.travelers;
  if (!partySize || !Number.isInteger(partySize) || partySize < 1) throw new Error('A party budget needs a recorded traveler count.');
  const currency = plan.currency;
  const lodging = (trip.stays ?? []).filter(stay => stay.status === 'booked').flatMap(stay =>
    stay.checkIns.flatMap(segment => segment.cost?.currency === currency ? [{ stay, segment, cost: segment.cost }] : []),
  );
  const accommodationOrders = lodging.reduce((sum, row) => sum + row.cost.amount, 0);
  const accommodationExtras = lodging.reduce((sum, row) => sum + (row.cost.estimatedAdditional ?? []).reduce((subtotal, extra) => subtotal + extra.amount, 0), 0);
  const diningBookings = getDiningBookings(trip.days, trip.diningOptions ?? []);
  const pricedDining = diningBookings.filter(booking => booking.choice.cost?.currency === currency);
  const diningOrders = pricedDining.reduce((sum, booking) => sum + booking.choice.cost!.amount, 0);
  const ticketOptions = trip.ticketOptions ?? [];
  const transportBudget = getTransportBudget(trip.transport, ticketOptions);
  const optionById = new Map(ticketOptions.map(option => [option.id, option]));
  const purchasedItemIds = new Set((trip.transport?.budgetItems ?? []).flatMap(item =>
    item.ticketOptionId && optionById.get(item.ticketOptionId)?.purchaseStatus === 'purchased' ? [item.id] : [],
  ));
  const purchasedTickets = (trip.transport?.budgetItems ?? []).flatMap(item => {
    const option = item.ticketOptionId ? optionById.get(item.ticketOptionId) : undefined;
    return option?.purchaseStatus === 'purchased' && option.currency === currency ? [option] : [];
  });
  const ticketOrders = purchasedTickets.reduce((sum, option) => sum + option.price * partySize, 0);
  const additionalTransportRows = transportBudget?.currency === currency
    ? transportBudget.rows.filter(row => !purchasedItemIds.has(row.id)).map(row => ({ ...row, amount: row.amount * partySize }))
    : [];
  const additionalTransport = additionalTransportRows.reduce((sum, row) => sum + row.amount, 0);
  const ordersAndExtras = accommodationOrders + accommodationExtras + ticketOrders + diningOrders;
  const base = ordersAndExtras + additionalTransport;
  const allowanceMinimum = plan.allowances.reduce((sum, item) => sum + item.minimum, 0);
  const allowanceMaximum = plan.allowances.reduce((sum, item) => sum + (item.maximum ?? item.minimum), 0);
  const paidRecords = [
    ...lodging.flatMap(row => row.cost.paymentStatus === 'paid' ? [row.cost.amount] : []),
    ...purchasedTickets.flatMap(option => option.paymentStatus === 'paid' ? [option.price * partySize] : []),
    ...pricedDining.flatMap(booking => booking.choice.cost!.paymentStatus === 'paid' ? [booking.choice.cost!.amount] : []),
  ];
  return {
    currency, partySize, accommodationOrders, accommodationExtras,
    accommodationTotal: accommodationOrders + accommodationExtras,
    ticketOrders, diningOrders, diningBookings, additionalTransportRows,
    ordersAndExtras, additionalTransport, base,
    allowanceMinimum, allowanceMaximum,
    minimum: base + allowanceMinimum,
    maximum: base + allowanceMaximum,
    knownPaid: paidRecords.length > 0 ? paidRecords.reduce((sum, amount) => sum + amount, 0) : undefined,
  };
}
