import type { BrandId } from '../lib/brands';

export type TripStatus = "planning" | "upcoming" | "completed";

export interface TripLocalName {
  /** Original-script place name, with its BCP 47 language tag. */
  text: string;
  language: string;
}

export interface TripDestination {
  id: string;
  name: string;
  localName?: TripLocalName;
  lat: number;
  lng: number;
  description: string;
  englishName?: string;
}

export interface TripCoordinateSource {
  label: string;
  url: string;
  /** Date the public geographic record was checked, when known. */
  checkedOn?: string;
}

export interface TripMapPlace {
  id: string;
  name: string;
  localName?: TripLocalName;
  lat: number;
  lng: number;
  kind: "sight" | "station" | "airport" | "port" | "stay" | "checkpoint" | "bus-stop" | "town";
  coordinateSource: TripCoordinateSource;
  /** Describe a sourced shared-building or area point without claiming an entrance. */
  coordinateNote?: string;
}

export interface TripMapStop {
  placeId: string;
  /** Stable ID in the main schedule, or in the view's named alternative. */
  scheduleId?: string;
  optional?: boolean;
  /** Landmark position shown as a pin, excluded from travel-order connections. */
  connect?: false;
  note?: string;
}

export interface TripDayMapView {
  id: string;
  label: string;
  scope: "activity" | "transport" | "alternative" | "optional";
  alternativeId?: string;
  stops: TripMapStop[];
  note?: string;
  /** Verified path geometry as [latitude, longitude], with its own provenance. */
  track?: { coordinates: Array<[number, number]>; source: TripCoordinateSource };
}

export interface TripDayMap {
  defaultViewId: string;
  views: TripDayMapView[];
}

export interface TripDayWeather {
  /** IANA timezone for the itinerary date and the weather provider's daily values. */
  timeZone: string;
  /** Reuse sourced places; the first location is the compact daily forecast. */
  locations: Array<{ placeId: string; label?: string }>;
  /** Explain geographic or elevation coverage without inventing weather conditions. */
  note?: string;
}

/** A sourced guidebook figure, separate from geographic route geometry and photos. */
export interface TripGuideFigure {
  id: string;
  title: string;
  image: string;
  alt: string;
  printedPages: string;
  caption?: string;
}

export type TripGuideFacility = "water" | "toilet" | "rest" | "food" | "stamp" | "view" | "bus" | "stay";

export interface TripGuideCheckpoint {
  id: string;
  name: string;
  localName?: TripLocalName;
  description: string;
  /** Facilities explicitly shown in the source, without inferring opening hours. */
  facilities?: TripGuideFacility[];
  /** Existing main-schedule anchor; guide notes do not create new timed stops. */
  scheduleId?: string;
}

export interface TripGuideSection {
  title: string;
  points: string[];
  sourceIds?: string[];
}

export interface TripDayGuide {
  title: string;
  kind: "hike" | "area";
  publisher: string;
  edition: string;
  figures: TripGuideFigure[];
  profile?: TripGuideFigure;
  legend?: TripGuideFigure;
  checkpoints: TripGuideCheckpoint[];
  reminders?: string[];
  notes?: string[];
  details?: TripGuideSection[];
  sourceIds?: string[];
}

export interface TripFieldGuide {
  title: string;
  sections: TripGuideSection[];
  sourceIds?: string[];
}

export interface TripGalleryPhoto {
  id: string;
  image: string;
  alt: string;
  title: string;
  /** Name of the depicted place, independent of the related itinerary day. */
  localName?: TripLocalName;
  caption?: string;
  /** Link to the related local itinerary day without adding a planned visit. */
  dayDate?: string;
  /** Optional variant ID within dayDate, used only for a labeled alternative. */
  alternativeId?: string;
  optional?: boolean;
  objectPosition?: string;
}

export interface TripSight {
  id: string;
  name: string;
  localName?: TripLocalName;
  introduction: string;
  /** References to photos in the trip's gallery; image credits stay with assets. */
  photoIds: string[];
  sourceIds?: string[];
  optional?: boolean;
  visitNote?: string;
}

export interface TripScheduleItem {
  /** Optional stable anchor for map-to-timetable links. */
  id?: string;
  time: string;
  title: string;
  description?: string;
  sourceIds?: string[];
  optional?: boolean;
}

export interface TripDayAlternative {
  id: string;
  title: string;
  description: string;
  schedule: TripScheduleItem[];
  notes: string[];
  sourceIds?: string[];
  sightIds?: string[];
}

export interface TripStampCollection {
  title: string;
  description?: string;
  stops: Array<{
    name: string;
    englishName?: string;
    /** Official sequence number when the collection spans several days. */
    number?: number;
    /** State route or eligibility conditions without implying completion. */
    note?: string;
  }>;
  notes?: string[];
  sourceIds?: string[];
}

export interface TripStampGuide {
  title: string;
  description?: string;
  sections: Array<{
    title: string;
    points: string[];
    sourceIds?: string[];
  }>;
}

export type TripMeal = "breakfast" | "lunch" | "dinner" | "snack";

/** Payment is independent of a recorded booking or ticket purchase. */
export type TripPaymentStatus = "paid" | "pay-on-arrival" | "unknown";

export interface TripDiningCost {
  /** ISO currency and the entire dated meal order for the traveling party. */
  currency: string;
  amount: number;
  paymentStatus?: TripPaymentStatus;
  notes?: string[];
}

export interface TripDiningOption {
  id: string;
  name: string;
  area?: string;
  description: string;
  notes?: string[];
  reservation?: {
    policy: "required" | "recommended" | "none" | "check";
    note?: string;
    /** Public booking link or restaurant phone, never a private confirmation. */
    url?: string;
    phone?: string;
  };
  sourceIds?: string[];
}

export interface TripDiningChoice {
  optionId: string;
  /** Date-specific constraints and suggested meal times stay outside the schedule. */
  note?: string;
  /** Retain an option without prompting a reservation for the accepted route. */
  requiresItineraryChange?: true;
  /** Record only an explicit confirmation for this date and meal. */
  reservationStatus?: "booked";
  /** A supplied order total, distinct from a candidate menu estimate. */
  cost?: TripDiningCost;
}

export interface TripDayMeal {
  meal: TripMeal;
  label?: string;
  notes?: string[];
  choices: TripDiningChoice[];
  /** Public references for meal logistics without a named restaurant. */
  sourceIds?: string[];
}

export interface TripDayPoem {
  /** Preserve the supplied original wording, punctuation, spacing and line breaks. */
  text: string;
  language: string;
  /** A supplied interpretation stays distinct from the quoted original. */
  translation?: { text: string; language: string };
  author?: string;
  work?: string;
  excerpt?: boolean;
  /** Secondary bibliography and original-location context stay in a disclosure. */
  attributionNote?: string;
  context?: string;
  /** Literary references belong to this epigraph, outside the official-source catalog. */
  sources?: TripSource[];
}

export interface TripDay {
  /** Calendar date in YYYY-MM-DD format. */
  date: string;
  destinationId: string;
  /** Optional day-specific map with ordered place references and separate scopes. */
  map?: TripDayMap;
  /** Live forecasts fetched in the browser; no forecast values belong in the plan. */
  weather?: TripDayWeather;
  /** Relevant official maps, terrain figures and practical checkpoint guidance. */
  guide?: TripDayGuide;
  title: string;
  description: string;
  ideas: string[];
  overnightId?: string;
  schedule?: TripScheduleItem[];
  notes?: string[];
  /** Explicitly confirmed practical arrangements, independent of reservations/payment. */
  confirmedNotes?: string[];
  sourceIds?: string[];
  /** Separate fallback or optional itineraries; never interleave with the main schedule. */
  alternatives?: TripDayAlternative[];
  /** Planned stamp stops, distinct from completed or qualifying pilgrimages. */
  stamps?: TripStampCollection;
  /** Sight introductions for this day; optional visits remain explicitly labeled. */
  sightIds?: string[];
  /** Meal alternatives shown after the day's existing plan, not schedule changes. */
  dining?: TripDayMeal[];
  /** Requested daily epigraph below the map and before practical notes. */
  poem?: TripDayPoem;
  hike?: {
    distanceKm: number;
    duration: string;
    ascentM?: number;
    descentM?: number;
    route: string;
  };
  type?: "arrival" | "city" | "excursion" | "transfer" | "hike" | "departure";
}

export interface TripSource {
  id: string;
  label: string;
  url: string;
}

export interface TripStayCost {
  /** ISO currency code and total for this booking segment, not per-person spending. */
  currency: string;
  amount: number;
  paymentStatus?: TripPaymentStatus;
  /** Estimated charges excluded from amount; never repeat fees already included. */
  estimatedAdditional?: Array<{
    label: string;
    amount: number;
    kind?: "accommodation-tax" | "other";
    /** An explicitly provided estimate, not a tax rate inferred from room prices. */
    quantity?: { perPersonPerNight: number; people: number; nights: number };
  }>;
  includes?: string[];
  notes?: string[];
  sourceIds?: string[];
}

export interface TripStaySegment {
  checkIn: string;
  checkOut: string;
  /** Omit unknown prices. A recorded booking price does not establish payment. */
  cost?: TripStayCost;
}

export interface TripStay {
  id: string;
  name: string;
  /** Reusable identity from the shared brand registry; omit unknown properties. */
  brandId?: BrandId;
  location: string;
  checkIns: TripStaySegment[];
  status: "booked" | "pending";
  notes: string[];
}

export interface TripChecklistItem {
  id: string;
  /** Pending actions or details to confirm. Unspecified items are shown as actions. */
  kind?: "todo" | "check";
  title: string;
  detail: string;
  /** Opening times refer to the existing booking records; trip dates are not deadlines. */
  timing?:
    | { kind: "asap" }
    | { kind: "reservation-opens"; bookingWindowIds: string[] }
    | { kind: "deadline" | "trip-date"; date: string };
  /** Highlights a material dependency without changing chronological order. */
  priority?: "high";
  priorityReason?: string;
  sourceIds?: string[];
}

export interface TripFlightEndpoint {
  airportCode: string;
  city: string;
  terminal?: string;
  /** Date and time use the airport's local clock, including on international flights. */
  date: string;
  time: string;
}

export interface TripFlight {
  id: string;
  flightNumber: string;
  /** Marketing carrier; the operating carrier takes precedence for the visual mark. */
  brandId?: BrandId;
  operatedByBrandId?: BrandId;
  operatedByFlightNumber?: string;
  travelerLabel?: string;
  status: "booked" | "planned";
  departure: TripFlightEndpoint;
  arrival: TripFlightEndpoint;
  notes?: string[];
  sourceIds?: string[];
}

export interface TripTicketOption {
  id: string;
  title: string;
  validFrom: string;
  validThrough: string;
  /** ISO currency code; prices and conditional estimates are per person. */
  currency: string;
  price: number;
  /** Selection alone never establishes either of these statuses. */
  purchaseStatus?: "purchased";
  paymentStatus?: TripPaymentStatus;
  estimatedTotal?: number;
  /** Extra tickets already counted in estimatedTotal, in this option's currency. */
  addOnTickets?: Array<{ label: string; price: number }>;
  estimateNote?: string;
  description: string;
  includes: string[];
  excludes: string[];
  notes: string[];
  sourceIds?: string[];
}

export interface TripBookingWindow {
  id: string;
  label: string;
  travelDate: string;
  /** Absolute timestamp with an explicit offset; timeZone is the seller's IANA zone. */
  opensAt: string;
  timeZone: string;
  sourceIds?: string[];
}

export interface TripTransportLeg {
  id: string;
  date: string;
  route: string;
  service: string;
  /** Coverage describes the fare, never purchase or reservation confirmation. */
  coverage: "pass" | "additional" | "mixed";
  /** Known additional fare per adult in the plan's currency; omit unknown fares. */
  fare?: number;
  /** Supplied price when the stated discount conditions are not met. */
  regularFare?: number;
  /** Explain price conditions, return fares, fees, or a choice of services. */
  fareNote?: string;
  /** A planning reference, not a confirmed departure or purchased ticket. */
  time?: string;
  reservationRequired?: true;
  /** A recorded seat confirmation, independent of pass coverage or payment. */
  reservationStatus?: "booked";
  reservationNote?: string;
  sourceIds?: string[];
}

export type TripTransportBudgetItem = {
  id: string;
  label: string;
} & (
  | { ticketOptionId: string; legIds?: never }
  | { legIds: string[]; ticketOptionId?: never }
);

export interface TripTransportPlan {
  currency: string;
  legs: TripTransportLeg[];
  /** Reuse pass prices and leg fares; do not store duplicate totals. */
  budgetItems: TripTransportBudgetItem[];
  budgetNotes: string[];
  paymentNotes?: Array<{ title: string; detail: string; sourceIds?: string[] }>;
  sourceIds?: string[];
}

export interface TripBudgetAllowance {
  id: string;
  label: string;
  /** Party-total estimates in the owning budget's currency. */
  minimum: number;
  maximum?: number;
  note?: string;
  /** Optional link to an unbooked daily meal choice; no new reservation. */
  date?: string;
  optionId?: string;
}

export interface TripBudget {
  currency: string;
  /** Extras excluded from recorded lodging, transport and booked meal amounts. */
  allowances: TripBudgetAllowance[];
  /** A supplied preparation range, separate from the computed spending estimate. */
  suggestedReserve?: { minimum: number; maximum: number };
  notes: string[];
}

export interface Trip {
  slug: string;
  title: string;
  country: string;
  countryCode: string;
  /** YYYY-MM-DD dates; both the first and last day count toward the itinerary. */
  startDate: string;
  endDate: string;
  status: TripStatus;
  summary: string;
  /** Optional cover presentation with translations, separate from the factual summary. */
  coverIntroduction?: {
    text: string;
    translations?: Array<{ language: string; text: string }>;
  };
  cover: string;
  coverAlt: string;
  coverCredit: string;
  destinations: TripDestination[];
  /** Trip-owned public place coordinates, reused by each day's map views. */
  places?: TripMapPlace[];
  routeNote: string;
  days: TripDay[];
  language?: "zh-CN" | "en";
  travelers?: number;
  itineraryStatus?: "agreed" | "draft";
  routeSummary?: string[];
  /** Ordered destinations, including returns and transfers; lines are not trail tracks. */
  mapRoute?: string[];
  stays?: TripStay[];
  flights?: TripFlight[];
  ticketOptions?: TripTicketOption[];
  /** Explicitly recorded choice of one option; never implies purchase or payment. */
  selectedTicketOptionId?: string;
  /** Per-adult transport fares, coverage, payment guidance and derived budget. */
  transport?: TripTransportPlan;
  /** Opt-in broader budget: reuse priced records and add scoped allowances. */
  budget?: TripBudget;
  bookingWindows?: TripBookingWindow[];
  checklist?: TripChecklistItem[];
  sources?: TripSource[];
  gallery?: TripGalleryPhoto[];
  sights?: TripSight[];
  /** Trip-owned option details reused by daily meal references and booking reminders. */
  diningOptions?: TripDiningOption[];
  practicalNotes?: string[];
  /** Shared destination guidance in Preparations; not an outstanding checklist. */
  fieldGuide?: TripFieldGuide;
  stampGuide?: TripStampGuide;
  walkingSummary?: { distanceKm: number; days: number };
}

export interface TripPlaceholder {
  kind: "placeholder";
  slug: string;
  title: string;
  country: string;
  countryCode: string;
  year: number;
  status: "planning";
  language?: "zh-CN" | "en";
  summary: string;
  cover: string;
  coverAlt: string;
  coverCredit: string;
}

export type TripEntry = Trip | TripPlaceholder;
