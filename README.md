# The Journey Atlas

A personal travel website with a next-trip highlight, trip pages, and a visited atlas. Each trip has its own content, original source submissions, and planning history.

Live: [Trips](https://6ickomod3.github.io/travel/) · [Japan 2026](https://6ickomod3.github.io/travel/trips/japan-2026/) · [UK 2026](https://6ickomod3.github.io/travel/trips/uk-2026/)

## Project context and design

[Trip design principles](docs/trip-design-principles.md) is the concise reference
for shared presentation and content conventions. [AGENTS.md](AGENTS.md) records
implementation contracts and project context. Internal documentation, plans,
handoffs and comments use English; public content follows each trip's language,
with language-tagged local names, quotations and translations.

The homepage highlights the current or next dated trip, links to each trip through compact cards, and shows a visited atlas. Routes, schedules, accommodation, and other itinerary details live on the individual trip pages. The next-trip highlight and date-based status labels update with the calendar in the browser, including after returning to an open tab.

Trip pages combine practical schedules, recorded booking progress, local brand
marks, focused-day navigation and a full-trip view. The design guide defines
section order, disclosure defaults, bounded day swipes and reservation/cost
semantics. Direct links reveal the relevant details, and printing includes the
full plan before restoring the previous view.

## Project layout

```text
itineraries/<slug>/       Trip data, original inputs, and English history
public/images/trips/     Images and credits grouped by trip
public/images/shared/    Shared illustrations and font attribution
public/images/brands/    Reusable brand marks and source records
public/fonts/            Local fonts and licenses
src/data/                Shared types and automatic trip registry
src/components/          Website components
src/pages/               Homepage, trip routes, and sitemap
src/lib/                 Shared helpers
src/scripts/             Browser interactions
src/styles/              Shared visual styles
docs/                    Design principles and content workflow
templates/trip/          Reusable new-trip package
scripts/                 Content validation
.local/trips/<slug>/     Private inputs and documents, ignored by Git
```

Start with [Japan's trip folder](itineraries/japan-2026/) or
[UK's trip folder](itineraries/uk-2026/). Each contains `trip.ts`, `history.md`,
and `inputs/`. [The content workflow](docs/content-workflow.md) explains how
free-form submissions become website updates.

## Run locally

Install Node.js 24 (minimum 22.13) and pnpm. The project uses the pnpm version recorded in `package.json`.

From this folder, run:

```sh
pnpm install
pnpm dev
```

Open the address shown in the terminal. Changes to the site will appear as you save them.

To check the version that will be published:

```sh
pnpm build
pnpm preview
```

## Publish with GitHub Pages

The repository is [6ickomod3/travel](https://github.com/6ickomod3/travel).

1. Open the repository's **Settings → Pages**.
2. Under **Build and deployment**, choose **GitHub Actions** as the source.
3. Push the site to `main`. The included workflow builds and publishes it; subsequent pushes update the site.

The published address will be [6ickomod3.github.io/travel/](https://6ickomod3.github.io/travel/). You can also run the publishing workflow from GitHub's **Actions** tab.

## Add or update a trip

Edit the relevant `itineraries/<slug>/trip.ts`. This is the current structured plan; its `history.md` records decisions and source references, and `inputs/` preserves each original publishable submission. Keep internal history and guidelines in English; original text and public content retain their supplied languages.

For a new trip, copy [templates/trip/](templates/trip/) into `itineraries/<slug>/`, rename `trip.ts.example` to `trip.ts`, and replace the example values. Add its images and `credits.json` under `public/images/trips/<slug>/`. The folder and data slug must match.

New `*/trip.ts` files are discovered automatically and appear in the homepage collection, trip routes, and sitemap. On GitHub Pages, their pages live under `/travel/trips/{slug}/`. No central trip list needs editing.

Use a year-only `TripPlaceholder` until dates and plans are known, following UK 2026. Once an itinerary is ready, change that same file to a dated `Trip`, keeping its slug and URL. Optional schedules, flights, stays, ticket options, reservation opening times, checklists, practical notes, and official sources keep detailed plans together. `mapRoute` records returns and transfers separately from unique destinations; complete alternative day plans have their own labeled schedules.

Optional trip-owned `places` and daily `map` views add maps near the start of each day.
Reuse sourced coordinates, number accepted stops, and distinguish local activity,
whole-day transport, alternative and optional coverage. Stable place and schedule
IDs link stops to the itinerary. Dashed connections show order; precise tracks
require verified geometry and a source. Keep unknown locations unmapped rather
than guess. The [data contract](docs/content-workflow.md#daily-map-data) and
[design guide](docs/trip-design-principles.md#daily-maps) cover phone activation,
visible-day loading, native labels, stop lists, external links and print fallback.

Optional daily `weather` references those same sourced place IDs and records
an explicit destination `timeZone`. A compact primary forecast appears above
the map; additional locations and scope details start collapsed. Open-Meteo's
free noncommercial API updates forecasts in the browser without API keys or a
new deployment. Show the trip date's low/high temperature, precipitation
probability and wind, with visible source and retrieval time. Dates beyond the
forecast range, past dates and connection failures have explicit states.
Keep forecast values out of the plan, use a 30-minute cache, and refresh only
visible, open days. Previously retrieved values can remain labeled updating
during a refresh. After failure, cached values up to 24 hours old can remain
with an explicit stale label. Keep Open-Meteo credit and its CC BY 4.0 license link
visible. Additional locations load when their forecast disclosure is opened.
See [daily weather data](docs/content-workflow.md#daily-weather-data).

Optional daily `guide` records add route-specific official map images, original
terrain profiles, legends and practical checkpoints alongside geographic maps.
Keep map assets in the trip's `guide/` image folder with publisher, edition,
printed-page and supplied-file provenance. Guide figures are references, not
verified GPS tracks or gallery photos. Phones show one manually selected map
with full-title choices; larger screens retain a grid and each day's selection
survives viewport and day changes. Reminders, terrain profiles and checkpoints
use native disclosures. No-JavaScript reading and printing show every figure;
printing restores selections, disclosures and the image viewer.
`fieldGuide` holds shared preparation advice, while `confirmedNotes` records
explicit practical confirmations separately
from bookings and payment. See [guidebook maps and practical guidance](docs/content-workflow.md#guidebook-maps-and-practical-guidance).

Pending checklist items follow Daily itinerary, grouped into To do actions and To check confirmations through their optional `kind` field. Each group sorts by optional `timing`: immediate actions, referenced reservation openings or calendar dates, then undated items. Related travel dates are labeled separately from deadlines. Optional `priority: "high"` and `priorityReason` identify important dependencies. Ticket comparisons, reservation-opening times, and practical reminders remain in Preparations.

An explicit `selectedTicketOptionId` records a ticket strategy, not a booking or
payment. Compare multiple current options or show the single selected strategy.
Optional trip-owned `transport` records dated coverage and known additional
per-adult fares in one currency, with discount and payment conditions; omit
unknown amounts. Its budget rows reference pass prices or journey fares so
per-person and traveler totals are derived without duplication. Preparations
shows journeys and payment guidance; Costs keeps the transport estimate separate
from accommodation, with assumptions and exclusions clear. See the
[transport fare and budget contract](docs/content-workflow.md#transport-fares-and-budgets).

Record purchases, reservations and payment separately when confirmed. Transport
`reservationKind` defaults to `seat`; `time-slot` records a reserved boarding
window with a distinct confirmation label. Neither reservation kind establishes
fare purchase or payment. Optional `paymentStatus` distinguishes paid, pay on
arrival and unknown; unknown does not
mean unpaid. Dated dining `cost` records cover the entire party's meal order.
Optional `budget` allowances add unbooked meal and other estimates to existing
lodging, transport and booked-meal amounts without copying totals or repeating
included costs. Show the calculated spending range and suggested reserve with
their exclusions; an incomplete paid record cannot establish a remaining balance.
See [payment and spending budgets](docs/content-workflow.md#payment-and-spending-budgets).

Add optional `cost` records to accommodation `checkIns` for booking totals and estimated extra charges. The same values appear on accommodation cards and in Costs before Official sources, totaled by currency; unknown prices stay unpriced and booking amounts do not imply payment.

Optional `diningOptions` stores reusable restaurant details and public booking
contacts within each trip. Daily `dining` groups refer to those options by meal,
or provide practical meal guidance with collapsed public references. Keep
food suggestions separate from the existing timetable. Only an explicit
confirmation marks a date-and-meal reservation as booked; route-change
alternatives remain visible but are excluded from current reservation reminders.

Daily `stamps` can store ordered collection stops and route conditions; `stampGuide` stores booklet and eligibility guidance. These describe a plan without marking stamps collected or qualifications completed. Research references start collapsed across trip pages and remain available when printing.

Optional `gallery` photos appear in a manual carousel at the top of a trip page. `sights` holds concise introductions and links to gallery photos; days and alternatives select them with `sightIds`. Photo credits remain visible, and optional sights stay with their separate routes.

Optional `TripLocalName` records provide native names for destinations, daily-map
places, sights and gallery photos. Keep the trip-language name primary and show
the local form only when different, following the guide's language and font
conventions.
Destination local labels also accompany explicitly confirmed visits in the atlas.

Optional `coverIntroduction` displays requested cover copy and its
language-tagged translations together. The factual `summary` remains
available for page metadata.

Optional daily `poem` stores the exact quotation, language-tagged interpretation,
author, work, excerpt status, context and literary sources within its trip.
It appears immediately after the daily map or guide, before the description,
accommodation and daily reminders.
Credits stay visible; detailed references start collapsed and open for printing.
Paper tones and cultural motifs are optional per trip. Japan currently uses
subtle original sakura artwork, with smaller motifs on mobile and a plain print
background; future trips choose their own decoration.
Dates without a supplied poem remain unchanged.

You can supply plain text or attachments. The workflow is: save the source, compare it with the existing plan, apply clear additions/corrections, record unresolved questions, then check and publish the trip page. New fragments do not silently replace unrelated accepted decisions.

## Record visited places

Set a dated trip's `status` to `completed` after confirming it was taken. Before doing so, make its destinations reflect the places actually visited: remove skipped stops and update the trip details as needed. Keep each destination's ID stable when revisiting the same place on another trip.

The visited atlas automatically combines destinations from explicitly completed trips, deduplicates places within each country, and links each place to its completed trips. It shows no planned destinations or route lines. Calendar dates alone never mark a trip as completed. Until visits are recorded, the homepage shows a world graphic and an empty state.

Tracked input archives are publicly readable on GitHub, even though they are
not website pages. Store private originals and reservation documents in ignored
`.local/trips/<slug>/` storage. Add an excerpt or redacted copy to the tracked
archive only with explicit authorization for the exact content being published;
label its scope and record its provenance in the trip history. Removing private
links does not establish that authorization. GitHub does not back up ignored
local files.

## Hosting and maps

Astro builds static pages, so there is no backend to maintain. The interactive maps use Leaflet and externally fetched OpenStreetMap tiles; no map key is needed. Images and fonts are served locally, and no analytics or tracking scripts are included.

Optional daily weather uses the free noncommercial Open-Meteo API. It sends
the configured public place coordinates and destination timezone, without
requesting the visitor's location or adding a paid service.

Accommodation confirmation states are maintained in the trip data.

`pnpm build` runs content validation, the weather date/unit/cache tests, type
checks, and the static build. Content checks catch missing images, duplicate
IDs, invalid dates, and broken destination/stay/source/weather references.
Run `pnpm check:content` for the content check alone, or `pnpm test:weather`
for the focused weather tests without live API requests.

The default hosting settings are `BASE_PATH=/travel/` and `SITE_URL=https://6ickomod3.github.io`. To build for the root of a custom domain instead:

```sh
BASE_PATH=/ SITE_URL=https://example.com pnpm build
```

Use those same environment settings in your publishing workflow when changing hosts.
