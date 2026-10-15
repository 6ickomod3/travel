export type TripStatus = "planning" | "upcoming" | "completed";

export interface TripDestination {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
  englishName?: string;
}

export interface TripGalleryPhoto {
  id: string;
  image: string;
  alt: string;
  title: string;
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
  introduction: string;
  /** References to photos in the trip's gallery; image credits stay with assets. */
  photoIds: string[];
  sourceIds?: string[];
  optional?: boolean;
  visitNote?: string;
}

export interface TripScheduleItem {
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

export interface TripDay {
  /** Calendar date in YYYY-MM-DD format. */
  date: string;
  destinationId: string;
  title: string;
  description: string;
  ideas: string[];
  overnightId?: string;
  schedule?: TripScheduleItem[];
  notes?: string[];
  sourceIds?: string[];
  /** Separate fallback or optional itineraries; never interleave with the main schedule. */
  alternatives?: TripDayAlternative[];
  /** Planned stamp stops, distinct from completed or qualifying pilgrimages. */
  stamps?: TripStampCollection;
  /** Sight introductions for this day; optional visits remain explicitly labeled. */
  sightIds?: string[];
  hike?: {
    distanceKm: number;
    duration: string;
    ascentM?: number;
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
  /** Estimated charges excluded from amount; never repeat fees already included. */
  estimatedAdditional?: Array<{ label: string; amount: number }>;
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
  estimatedTotal?: number;
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
  cover: string;
  coverAlt: string;
  coverCredit: string;
  destinations: TripDestination[];
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
  bookingWindows?: TripBookingWindow[];
  checklist?: TripChecklistItem[];
  sources?: TripSource[];
  gallery?: TripGalleryPhoto[];
  sights?: TripSight[];
  practicalNotes?: string[];
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
