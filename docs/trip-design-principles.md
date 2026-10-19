# Trip design principles

These conventions support an evergreen travel site. Shared presentation and
content rules apply across trips; cultural details are chosen for each trip.
See [AGENTS.md](../AGENTS.md) for implementation contracts and the
[content workflow](content-workflow.md) for source handling.

## 1. A reusable travel site

Each `itineraries/<slug>/` package owns its typed `trip.ts`, source submissions,
English decision history and stable IDs. New trips are discovered automatically.
Use year-only placeholders until actual dates and plans are supplied.

Keep the homepage concise: the current or next qualifying trip, compact trip
cards and a visited atlas. Cards show covers, titles, countries, dates, status
and links. Detailed routes, schedules and accommodation belong on trip pages.
Use shared Astro components, local images/fonts and the existing
GitHub Pages workflow, preserving `/travel/`, trailing slashes and `withBase()`.
Keep Leaflet/OpenStreetMap free of map API billing; ordinary external navigation
links remain available.

## 2. Facts and status

Preserve accepted facts when a later submission changes only part of a plan.
Distinguish agreed schedules, reference departures, confirmed bookings and
completed visits. Record uncertainty and missing information explicitly.
Leave unknown dates, travelers, stops and reservations unspecified.
Dates alone never establish a booking, visit or completed trip.

The visited atlas uses only explicitly completed trips and actual visited
destinations. It shows aggregate places and trip links without planned routes;
an empty atlas has an honest empty state. Optional routes and sights remain in
their labeled alternatives. Planned stamp stops do not establish collection or
pilgrimage eligibility.

## 3. Section order and disclosures

Use the same order in trip navigation and page content, omitting empty sections:

Route → Daily itinerary → To do and confirmations → Dining reservations →
Preparations → Accommodation → Flights → Costs → Official sources.

| Section | Initial state | Visible summary |
| --- | --- | --- |
| Accommodation | Closed | Date range and night count |
| Flights | Open | Flight count |
| Costs | Closed | Known accommodation totals and recorded estimated extras, with scope and currencies clear |
| Official sources | Closed | Reference count |

Use native, keyboard-accessible disclosures and stable fragment links. Research
references start closed, including inline groups. Following a direct link reveals
its containing day or section. Printing includes all days, alternatives, ticket
details, sections and references, then restores the selected day, view and open
states. Keep image and map attribution visible.

## 4. Daily navigation and content

Show one day in focus by default, with a full-trip view, date links, previous/next
buttons and keyboard controls. Keep sticky date navigation flush with the
viewport top and preserve Back/Forward navigation and native disclosure fallback.

In focused view, an intentional left swipe opens the next date and a right swipe
opens the previous date. Stop at the first and last dates without wrapping.
Preserve vertical scrolling, scrollable date strips and other horizontal widgets,
and link/control activation. Full-trip view uses normal scrolling.

When supplied, place the daily map directly below the day title. Follow it with
the overnight stay and daily reminders, any supplied epigraph, and the timetable.
Keep optional schedules separate, retain practical walking/stamp details, and
put meal options at the very bottom.

### Daily maps

Use a responsive map about 320px high on desktop and 240px on mobile. Number
the accepted stops in order. Keep trip-language names primary (Chinese for Japan),
with accurate, distinct native labels and links to relevant itinerary rows and
external maps. An always-readable stop list provides the same useful links.

On mixed days, distinguish local activity coverage from whole-day transport with
clearly labeled views. Keep alternative routes, optional summit detours and
unselected meal candidates separate from the accepted sequence. Optional points
must be labeled; their presence does not establish selection or a planned visit.
Dashed connections indicate stop order, not an exact walking or transport path.
Show a precise track only when verified route geometry and its source are supplied.
Keep landmark-only positions out of travel-order lines, and state the actual
viewing area. Identify shared-building or area coordinates in the visible stop
list when an exact entrance has not been verified.

On phones, ordinary page scrolling is the default. An explicit `操作地图`
control, localized for other trips, activates map interaction. Exclude the entire
map wrapper from day-swipe gestures, including before activation. Initialize a
map only when its containing day is both open and visible; full-trip mode must
not load every offscreen map. Preserve the stop list and external-map fallback
without JavaScript or available tiles. Print the scope, stop list and useful
links, omitting interactive controls.

## 5. Bookings, pending items and costs

Green check badges identify recorded confirmed flights and booked accommodation.
Pending confirmations use amber. Booking progress counts recorded flights and
accommodation nights. Flight times remain airport-local, with marketing and
operating carriers clear.

Keep a hero link to pending items. Separate To do actions from To check
confirmations. Sort immediate actions first, actual reservation openings or
relevant dates next, and undated items last, retaining stable ties. Important
badges explain dependencies without reordering items. Related travel dates are
labeled as travel dates; deadlines require an actual supplied deadline. Put
ticket comparisons and opening tables
in Preparations; only an explicit decision selects a ticket strategy.

Restaurants remain candidates until explicitly selected or booked. Reservation
reminders are conditional on choosing an option and sort by first meal date.
Selection alone does not confirm a reservation or available seats.
Show route-change options at the day's bottom and exclude them from current-route
reservation prompts. Keep suggested seating times separate from the timetable.

Reuse recorded accommodation amounts for cards and Costs. Separate currencies,
booking totals, estimated extras and unknown prices; booking amounts do not imply
payment. Label accommodation tax explicitly when it is the only recorded extra.
Show supplied tax scope, rates and per-person/per-night calculations clearly.

## 6. Visuals and local names

Use warm cream, forest green and terracotta, clear typography, spacing and concise
practical labels. Remove unsolicited ornamental, motivational or promotional
prose and repeated descriptions. Requested cover copy and poems follow section 7.
Keep the removed Idea/About and editable notebook features absent unless
requested. Maintain readable layouts at 320px, accessible controls
and reduced-motion behavior.

Use real photos of named places in a manual top gallery, with visible author,
source and license credits, swiping and keyboard controls. Link concise daily
sight introductions to their photos. Prioritize the first image, lazy-load
later images and avoid autoplay.
Reuse verified brand marks with original colors/proportions, honest provenance
and a named fallback when no exact mark is available.

Key destinations, daily-map places, sights and gallery photos may carry an
optional shared `TripLocalName`. Keep the trip-language name primary and show a
small accurate local name only when it differs from that text. Preserve its native script and
language tag, using supplied or verified local forms. Use an appropriate native
font or platform fallback with glyph coverage checked. Japanese labels use
system native fonts. Schedule sentences stay in the trip's primary language.
Carry destination local-name metadata into the visited atlas when those visits
are explicitly confirmed.

## 7. Optional cultural content

Requested cover introductions, epigraphs and cultural motifs are optional for
each trip. Preserve quotation spelling, punctuation, spacing and line breaks,
with separate language tags for originals and supplied interpretations. Keep
author, primary work and excerpt status visible; fold secondary bibliography,
context and literary references. State any supplied original-location context
accurately. Literary links do not establish independent verification.

Japan currently uses a quiet paper card and original decorative sakura artwork.
Choose appropriate motifs or plain backgrounds for future trips. Keep artwork
noninteractive, protect text contrast and reading width, respect reduced motion
and use plain print backgrounds. Dates without supplied poems remain unchanged.

## 8. Sources and publication

Archive each authorized public submission separately before applying it; preserve
its original language and append an English history entry covering changes,
superseding decisions and unresolved questions. Keep the current structured plan
in `trip.ts` and official website references in `Trip.sources`.

Tracked archives are public on GitHub. Keep private originals and reservation
documents in ignored `.local/trips/<slug>/` storage with a separate private backup.
An excerpt or redacted copy requires explicit authorization for the exact content
being published; identify its scope and provenance in the file and history.
Removing private links does not establish publication permission. Existing
explicit authorization applies within its stated scope.

Check relevant content, mobile layouts and controls before publishing authorized
updates through the existing workflow. Internal documentation and comments stay
in English; public trip content and source originals retain their own languages.
