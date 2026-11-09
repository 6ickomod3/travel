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
| Costs | Closed | Recorded amounts, estimates and any supplied spending range, labeled by scope and currency |
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

After the day title, show a compact forecast when configured, then the daily
map or guide. Follow it with any supplied epigraph, the description, overnight
stay and daily reminders, and the timetable.
Keep optional schedules separate, retain practical walking/stamp details, and
put meal options at the very bottom.

When several route variants are supplied, offer a concise comparison linked
to their complete labeled alternatives. Show whole-day bus rides, the supplied
walking distance or qualitative walking scope, and planned stamp ranges.
Keep the first shared note visible as short guidance. Put remaining scope and
travel notes in an initially closed native disclosure with a count, manual
toggle and print-state restoration, preserving a compact phone comparison.
Derive ranges from optional walking extensions and optional stamp stops;
do not copy totals into another record. State excluded transfers and walking,
terrain limitations and connection assumptions. Weather can inform a decision
but does not select a route. Preserve the accepted main schedule, guide and
budget until an explicit change is recorded; a shorter variant does not imply
early hotel check-in or a new transport reservation.

### Daily weather

Use a compact forecast for the trip date at a named location, with low/high
temperature, precipitation probability and wind visible. Keep total
precipitation, other referenced locations and location-scope notes in a native
disclosure. Hourly details use an initially closed disclosure for each location,
with destination-local times, temperature, precipitation probability, precipitation
and wind in explicit units. Label precipitation as the preceding hour's amount
and wind as speed at 10 m; show GMT offsets and any partial coverage.
Keep the compact daily card as the default reading;
opening hourly detail must not change the selected route. Use wrapping rows on
phones and contain any horizontal table scrolling within the forecast card,
preserving that gesture rather than switching days.
Preserve text labels alongside weather icons and keep
weather styling distinct from confirmed booking or practical-arrangement badges.

Fetch forecasts in the browser through Open-Meteo's free noncommercial API,
using sourced trip-place coordinates and the explicit destination timezone.
Match the requested date exactly. A forecast horizon is not a promise that every
trip date already has data: show a labeled future, past or unavailable state
without replacing it with today's weather. Show loading and network failures,
retain a readable fallback without JavaScript, and keep adjacent Open-Meteo
credit and its CC BY 4.0 license link visible.
Name the retrieval time accurately; do not present it as the model's issue time.

Use a 30-minute cache and refresh visible, open days after page restoration,
return to a visible tab, reconnect and destination-local midnight. Recheck
expiry while visible. Previously retrieved values may remain labeled updating
during a refresh. After failure, cached values up to 24 hours old may remain
with an explicit stale label. Weather can update without another deployment. Print
available forecast data with its retrieval time, otherwise preserve its labeled no-data
state, and restore disclosure states. Do not infer a full hiking-route forecast
from a single model grid point or change the accepted plan from a forecast.
Request additional locations only after opening their forecast disclosure, and
suspend rendering during printing so late responses preserve the print snapshot.
Request hourly data only for an open hourly disclosure whose day and location
are visible. Keep daily and hourly cache entries separate, with the same expiry,
refresh, updating and stale rules. Hourly rows use the exact destination-local
trip date and preserve unavailable readings rather than inventing values.
Printing includes already retrieved hourly detail without requesting new data,
then restores its previous disclosure state.

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

Direct geographic-view fragment links select that view before opening containing
disclosures and scrolling. When maps sit within a guide panel, reveal the guide
panel first and the geographic view next. Preserve existing print selection and
restoration while handling these links.

When a relevant guidebook is supplied, a walking day can lead with its official
route map after a compact heading. Group multi-part walks into labeled segments
and offer the existing geographic stop/transfer view alongside it. Area maps
remain supporting references on transport or sightseeing days. On phones,
show one map at a time with manually selected, full-title choices; retain the
map grid on larger screens and remember each day's choice across day and
viewport changes. Keep distance and recorded ascent/descent compact below the
map, with the full walking estimate on its own row. Source estimates stay
distinct from the agreed timetable.

Use native disclosures for route reminders, original terrain profiles and
linked checkpoints, with useful summaries and list counts. Preserve printed
scales, native labels and cumulative-distance axes. Keep concise facilities
and route guidance with the checkpoints, and shared preparation advice in
Preparations. Explicitly confirmed practical arrangements may use green check
notes without implying a seat reservation, payment or completed walk.

Provide an enlarged image viewer with accessible controls, pinch zoom, pan and
focus restoration, plus ordinary full-image links. Keep image credits visible
and research references closed. Fragment links reveal the selected guide panel
before opening ancestor disclosures and scrolling to their target. Without
JavaScript, show all source figures and preserve native text disclosures.
Printing includes every figure and restores map selection, disclosures and
viewer state. Load these source figures eagerly with low fetch priority so the
first print snapshot contains every map and terrain image. Preserve supplied
PDF provenance and extraction changes with the images.

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

Record ticket purchases, reservations and payment independently. A purchased
pass does not confirm every train seat, and a booking does not establish payment.
Transport `reservationKind` defaults to `seat`; use `time-slot` for a reserved
boarding window and label its confirmation accordingly. Keep fare purchase and
payment separate from both kinds of reservation.
Use paid, pay on arrival or unknown only as supported by the submission. Temporary
reservation messages remain pending checks; verify an existing attempt before
prompting a duplicate booking. Confirmed dining, seat and time-slot badges
describe those specific bookings, while unresolved arrangements stay visible separately.

Keep a hero link to pending items. Separate To do actions from To check
confirmations. Sort immediate actions first, actual reservation openings or
relevant dates next, and undated items last, retaining stable ties. Important
badges explain dependencies without reordering items. Related travel dates are
labeled as travel dates; deadlines require an actual supplied deadline. A
supplied price cutoff remains a price condition rather than a seat-sale deadline.
Put ticket comparisons and opening tables in Preparations; only an explicit
decision selects a ticket strategy. Compare multiple current options, or show
the single selected strategy with its per-person and traveler prices. Selection
does not establish purchase or reservation.

Restaurants remain candidates until explicitly selected or booked. Reservation
reminders are conditional on choosing an option and sort by first meal date.
Selection alone does not confirm a reservation or available seats.
Show route-change options at the day's bottom and exclude them from current-route
reservation prompts. Keep suggested seating times separate from the timetable.

Reuse recorded accommodation amounts for cards and Costs. Separate currencies,
booking totals, estimated extras and unknown prices; booking amounts do not imply
payment. Label accommodation tax explicitly when it is the only recorded extra.
Show supplied tax scope, rates and per-person/per-night calculations clearly.
Recorded dining order amounts belong to their specific date and meal and cover
the traveling party. Reuse them in Costs; keep unbooked menu estimates separate,
and avoid charging again for meals already included with accommodation.

When supplied, keep dated transport coverage, extra fares and payment guidance
in Preparations. Compute a distinct transport budget in Costs from the selected
pass and referenced extra fares, with per-person and traveler totals. Label
discount, payment and purchase-date conditions, and explain omitted city rides,
taxis or other unknown costs. Omit unknown amounts and avoid counting covered
journeys or included fees twice. The collapsed Costs summary keeps accommodation
and transport scopes separate; neither estimate establishes payment or a complete
trip cost.

When the user supplies a broader spending estimate, derive its range from the
existing lodging, transport and booked-meal records plus explicit allowances for
unbooked meals, admissions or other extras. Keep allowances as party amounts,
with their ranges and exclusions clear; do not copy grand totals into the plan.
Show any suggested preparation reserve separately from calculated spending.
Label the scope of recorded paid amounts. Unknown payment statuses neither count
as zero nor establish that the difference from a budget is an unpaid balance.

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
