export type TripStatus = "planning" | "upcoming" | "completed";

export interface TripDestination {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
}

export interface TripDay {
  /** A calendar date in YYYY-MM-DD format. */
  date: string;
  destinationId: string;
  title: string;
  description: string;
  ideas: string[];
}

export interface Trip {
  slug: string;
  title: string;
  country: string;
  countryCode: string;
  /** Trip dates use YYYY-MM-DD and are inclusive. */
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
}

/** Add future trips here; the homepage and trip pages share this collection. */
export const trips: Trip[] = [
  {
    slug: "japan-2026",
    title: "Japan, in autumn",
    country: "Japan",
    countryCode: "JP",
    startDate: "2026-11-13",
    endDate: "2026-11-21",
    status: "planning",
    summary:
      "Nine days of city lights, quiet gardens, and good things to eat. A first journey through Tokyo, Kyoto, and Osaka, with room to follow a little curiosity.",
    cover: "/images/japan-fuji.webp",
    coverAlt: "Mount Fuji beyond Fujiyoshida, with Chureito Pagoda in the foreground.",
    coverCredit: "Photo: Unsplash",
    destinations: [
      {
        id: "tokyo",
        name: "Tokyo",
        lat: 35.6762,
        lng: 139.6503,
        description: "Neighborhood walks, temple mornings, and city lights.",
      },
      {
        id: "kyoto",
        name: "Kyoto",
        lat: 35.0116,
        lng: 135.7681,
        description: "Temple gardens, old lanes, and walks along the river.",
      },
      {
        id: "osaka",
        name: "Osaka",
        lat: 34.6937,
        lng: 135.5023,
        description: "Street food, lively neighborhoods, and an easy final stop.",
      },
    ],
    routeNote:
      "Suggested route based on a possible arrival in Tokyo and departure from Osaka. Flight details are unknown, and no stays or activities are confirmed in this planner. Every day is an editable starting point.",
    days: [
      {
        date: "2026-11-13",
        destinationId: "tokyo",
        title: "An easy first day",
        description:
          "Keep the first day flexible around arrival. Settle in, find your bearings, and enjoy a relaxed first meal.",
        ideas: [
          "Choose a neighborhood close to your stay",
          "Take a short walk and find a coffee stop",
          "Find a relaxed dinner nearby",
        ],
      },
      {
        date: "2026-11-14",
        destinationId: "tokyo",
        title: "Old Tokyo, at your pace",
        description:
          "Explore the older side of the city, leaving time for small shops and unplanned stops between neighborhoods.",
        ideas: [
          "Visit Senso-ji and the streets of Asakusa",
          "Walk through Ueno Park",
          "Explore the lanes around Yanaka",
        ],
      },
      {
        date: "2026-11-15",
        destinationId: "tokyo",
        title: "From quiet shrines to city lights",
        description:
          "Start among the trees, then follow the city into its brighter, busier neighborhoods.",
        ideas: [
          "Visit Meiji Jingu",
          "Wander Harajuku and nearby side streets",
          "See Shibuya Crossing after dark",
        ],
      },
      {
        date: "2026-11-16",
        destinationId: "kyoto",
        title: "A new rhythm in Kyoto",
        description:
          "Allow time for the train journey and settling into a new base. Keep the evening simple and close by.",
        ideas: [
          "Plan the train transfer from Tokyo to Kyoto",
          "Take a walk by the Kamo River",
          "Find dinner near your stay",
        ],
      },
      {
        date: "2026-11-17",
        destinationId: "kyoto",
        title: "Wander the eastern hills",
        description:
          "A day of temple grounds and old streets in Higashiyama, with space to pause whenever a garden or cafe catches your eye.",
        ideas: [
          "Visit Kiyomizu-dera",
          "Explore Sannenzaka and Ninenzaka",
          "Walk through Gion in the evening",
        ],
      },
      {
        date: "2026-11-18",
        destinationId: "kyoto",
        title: "A day by the river",
        description:
          "Head west to Arashiyama for riverside paths, a temple garden, and a slower afternoon.",
        ideas: [
          "Explore Arashiyama and its bamboo paths",
          "Visit the garden at Tenryu-ji",
          "Walk along the Katsura River",
        ],
      },
      {
        date: "2026-11-19",
        destinationId: "osaka",
        title: "Shrine paths, then Osaka",
        description:
          "Spend the morning on Kyoto's shrine paths before continuing to Osaka for the final part of the trip.",
        ideas: [
          "Make an early visit to Fushimi Inari",
          "Plan the train transfer from Kyoto to Osaka",
          "Explore Namba and choose a dinner stop",
        ],
      },
      {
        date: "2026-11-20",
        destinationId: "osaka",
        title: "Osaka, one bite at a time",
        description:
          "Pair a park walk with a day of tasting and wandering, ending beneath the lights of Dotonbori.",
        ideas: [
          "Walk through Osaka Castle Park",
          "Browse Kuromon Market",
          "Explore Dotonbori in the evening",
        ],
      },
      {
        date: "2026-11-21",
        destinationId: "osaka",
        title: "Leave a little room",
        description:
          "Keep the final day open until departure details are known. There may be time for a favorite breakfast or one last walk.",
        ideas: [
          "Find a good breakfast nearby",
          "Pick up small gifts or take a final neighborhood walk",
          "Leave time for onward travel",
        ],
      },
    ],
  },
];
