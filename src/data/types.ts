export type TripStatus = "planning" | "upcoming" | "completed";

export interface TripDestination {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
  englishName?: string;
}

export interface TripScheduleItem {
  time: string;
  title: string;
  description?: string;
  sourceIds?: string[];
  optional?: boolean;
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

export interface TripStay {
  id: string;
  name: string;
  location: string;
  checkIns: Array<{ checkIn: string; checkOut: string }>;
  status: "booked" | "pending";
  notes: string[];
}

export interface TripChecklistItem {
  id: string;
  title: string;
  detail: string;
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
  checklist?: TripChecklistItem[];
  sources?: TripSource[];
  practicalNotes?: string[];
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
