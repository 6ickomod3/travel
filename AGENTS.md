# Project context and design guidelines

## Language

- Write all internal project context, guidelines, documentation, plans, handoffs,
  and code comments in English. Keep this file in English when updating it.
- Public website content follows each trip's `language` field. Local place
  names, quotations and translations retain their own language tags.
- Chat with the user in the language appropriate to their latest message.
- Itinerary text, quotations, destination names, image descriptions, source
  labels, and font glyph subsets are public content, not internal instructions.

## Purpose

The Journey Atlas is an evergreen personal travel website for practical trip planning.
The user owns the repository at https://github.com/6ickomod3/travel and publishes
the site at https://6ickomod3.github.io/travel/ using GitHub Pages.

- Each trip owns its current content, source submissions, and English decision
  history under `itineraries/<slug>/`. Read that trip's `history.md` before
  updating its plan. Keep trip-specific facts out of the shared guidelines.
- Follow `docs/content-workflow.md` for source ingestion, conflict handling,
  templates, and private storage.

## Design and content

Read [Trip design principles](docs/trip-design-principles.md) before changing
shared presentation or content conventions. That concise reference defines
section order and disclosure states, focused daily navigation and maps,
booking/cost semantics, local-language names, optional cultural content and
source privacy.
Keep the implementation contracts below aligned with that guide.

## Implementation

- Astro builds static pages. The package uses pnpm and Node.js 24 in CI.
- Keep the GitHub Pages base path `/travel/`, the trailing slash convention,
  and `withBase()` for internal links and local assets.
- `itineraries/<slug>/trip.ts` is the sole structured plan for that trip.
  Its folder and slug must match; keep the slug stable through later changes.
- `src/data/types.ts` defines shared content types. Trip modules default-export
  objects checked with `satisfies Trip` or `satisfies TripPlaceholder` and
  import types directly from this file, never from the registry. Use explicit
  `.ts` extensions for any runtime imports between content modules so the
  Node.js content check can load them.
- `src/data/trips.ts` is a small registry with eager discovery of
  `itineraries/*/trip.ts`. It re-exports shared types and exposes `trips` for
  dated itineraries, `tripPlaceholders` for year-only entries, and the combined
  `tripCollection`. New trip folders automatically receive pages and sitemap
  entries. Duplicate slugs and folder/slug mismatches fail validation.
- Use `templates/trip/` to create a trip package. Rename `trip.ts.example` only
  after replacing its example values; templates are excluded from discovery.
- Keep each trip's public images and `credits.json` under
  `public/images/trips/<slug>/`; retained unused images belong in `archive/`.
  Shared illustrations and font metadata belong in `public/images/shared/`.
  Fonts remain in `public/fonts/`. Use `src/lib/image-credits.ts` for credit
  lookup by full public image path.
- Reusable brand identities live in `src/lib/brands.ts` and use
  `BrandMark.astro`. Brand assets and English source records belong in
  `public/images/brands/`, separately from photo licenses. A missing official
  logo must use the real name or initials instead of a different brand.
  For user-supplied logo files, record the supplied source page, original
  filename, receipt date and SHA-256; verify the copied bytes without
  inventing a direct website asset URL or claiming an independent download.
- Only dated trips may enter date formatting, duration, and travel-status
  calculations. Do not supply fake dates for placeholders.
- `formatTripLabel()` identifies a trip by its country and supplied start
  month (`YYYY/MM`); year-only placeholders use their known year. Use the
  same compact label for covers, breadcrumbs, cards and static/runtime
  header rendering. Do not assign collection-order trip numbers.
- `selectNextTrip()` chooses a trip whose inclusive UTC date range is current,
  then the earliest upcoming dated trip. Completed trips, ended plans, and
  year-only placeholders cannot be selected. Show an honest empty state when
  no dated trip qualifies.
- Header and homepage use compact `TripPreview` metadata. Their next-trip
  highlight and date-based status labels refresh at load, page restore,
  return to a visible tab, and UTC midnight without a new deployment.
- `aggregateVisitedAtlas()` includes only explicitly completed trips. Dates
  alone never establish that a place was visited. When recording completion,
  make the trip's destinations reflect actual visits: remove skipped stops
  and correct the route/details as needed. Reuse stable destination IDs for
  the same place across trips so the atlas deduplicates within a country.
- The visited atlas shows aggregate places, country counts, and links to
  completed trips, without itinerary route lines or planned destinations.
  With no recorded visits, show a simple world graphic and empty state;
  do not load an interactive map or show unusable controls.
- `src/pages/trips/[slug]/index.astro` chooses between `TripItinerary.astro`
  and `TripPlaceholder.astro` for every discovered entry.
- Keep Leaflet maps, destination lists, expand/collapse, and itinerary printing.
  Images and fonts are local assets; map tiles come from OpenStreetMap.
- Optional trip-owned `places` and `TripDay.map` share daily-map coordinates and
  labeled activity, transport, alternative or optional views. Follow the
  [daily-map data contract](docs/content-workflow.md#daily-map-data) and validate
  place, schedule, alternative and default-view references. Record coordinate
  sources; omit unknown locations instead of guessing. Dashed connections show
  stop order; a precise track requires sourced, verified geometry. Do not use
  runtime geocoding. Follow the design guide's placement, phone interaction and
  fallback rules: initialize only open, visible days, exclude map wrappers from
  day swipes, and preserve printable stop lists and external-map links.
  Optional compact daily jump links sit after the weather card and before
  the map, making route comparisons and linked-date options easy to reach.
  Keep any supplied poem immediately after the map or guide.
  Fragment navigation selects the target geographic view with
  `revealDailyMapTarget()` immediately after `revealGuideTarget()`, before
  opening ancestor disclosures and scrolling. Skip this selection during
  printing or print restoration so existing snapshot state remains intact.
- Optional `TripDay.weather` references sourced `Trip.places` through
  `locations: [{ placeId, label? }]` and records an explicit IANA `timeZone`.
  Use the day's exact destination-local date. The first location supplies a
  compact forecast above the map; additional locations and any `note` stay in
  a native disclosure. Each location offers initially closed hourly detail
  with destination-local times and temperature, precipitation probability,
  precipitation and wind in explicit units. Identify preceding-hour precipitation,
  10 m wind speed rather than gusts, GMT offsets and partial hourly coverage.
  Alternative panels can link to configured forecast locations represented
  in their geographic views, reusing the same day's hourly disclosures.
  These links add neither forecast configuration nor route selection.
  Keep hourly values in runtime data, independent of the selected itinerary.
  Open-Meteo's free noncommercial API supplies browser forecasts without
  API keys, geolocation or runtime geocoding. Keep forecast
  values out of the structured plan. Show min/max temperature, precipitation
  probability, precipitation and wind with explicit units, visible attribution
  and a retrieval timestamp distinct from a model issuance time. Respect the
  provider's horizon, show honest past, unavailable and network-error states,
  and include adjacent Open-Meteo credit and a CC BY 4.0 link. Identify
  localization and rounding as presentation changes. Cache for 30 minutes and
  refresh only visible, open days, including page restore, return
  to a visible tab, reconnect and destination-local midnight. Recheck expiry
  while visible. Previously retrieved values may remain during a refresh,
  explicitly labeled updating. After a failed refresh, cached values up to
  24 hours old may remain with an explicit stale label.
  Start weather loading after focused-day/history initialization, and fetch
  additional locations only when their forecast disclosure is opened. Fetch
  hourly data only when its location and hourly disclosure are open and its
  day is visible. Daily and hourly caches are separate and share the same
  expiry, refresh and stale rules. Contain hourly table scrolling on phones
  and preserve it from day swipes. Printing includes already retrieved hourly
  detail without initiating new requests and restores its disclosure state.
  Exact-date hourly API requests use `start_date` and `end_date` without
  `forecast_days`, which is mutually exclusive with those date bounds.
  Suspend weather rendering during printing so delayed responses cannot change the
  print snapshot or its restored state.
  Preserve labeled no-JavaScript and print fallbacks; never substitute today's
  weather for an unavailable trip date.
- Optional `TripDay.guide` adds trip-owned guidebook maps, original terrain
  profiles, a source legend and practical checkpoints. Keep figures separate
  from geographic tracks and gallery photos. Reuse existing schedule IDs for
  checkpoint links; illustrations do not add visits or establish GPS geometry.
  Walking guides may be the initial map view, with geographic stops and transfers
  alongside; area guides support the existing geographic view. Preserve source
  labels, scales and cumulative-distance axes. Keep attribution visible,
  provide full-image links and an accessible zoom viewer, and exclude its
  gestures from day swipes. Load guide figures eagerly with low fetch priority
  for complete first-print snapshots.
- Guide layouts put a compact heading before the source map. On phones,
  show one manually selected figure with full-title choices; retain a grid on
  larger screens and each day's figure choice across viewport and day changes.
  Keep distance/ascent/descent compact and the full walking estimate on its
  own row. Reminders, profiles and checkpoints use native disclosures with
  useful summaries and list counts. Fragment links reveal the target guide
  panel before opening ancestor disclosures and scrolling. No-JavaScript
  reading and printing show all figures; printing restores map selection,
  disclosures, viewer state and its previously focused control without
  moving the page scroll position.
- Optional `TripDayAlternative.guideFigureRefs: [{ date, figureId }]` reuses
  figures from an existing day's `guide.figures`. Validate the owning date,
  guide, figure ID and unique date/figure pairs. Link to the original local
  full image and existing zoom viewer with the owning guide's publisher,
  edition and printed-page caption; keep the focused day when opening it.
  Explain which portion applies to a shortened route. Do not copy image
  assets, provenance or geometry; printing includes the canonical figures
  without duplicating them for every reference.
- Store guide assets under `public/images/trips/<slug>/guide/`. A supplied PDF
  keeps its full original in ignored storage; image provenance records the
  publisher, edition, printed pages, source filename, receipt date, original
  SHA-256 and extraction changes. Do not invent a download URL or reuse license.
  Optional `fieldGuide` groups shared practical guidance in Preparations.
- `TripDay.confirmedNotes` records explicit practical confirmations in green,
  independently of seat bookings and payment. Remove the corresponding pending
  wording only within the confirmed scope; other details stay unresolved.
- `TripSection.astro` supplies native collapsible sections with stable IDs,
  visible summary text and accessible headings. Accommodation, Flights,
  Costs and the official-source catalog share this presentation. Section,
  stay, cost, flight and source fragment links reveal the target's containing
  disclosure. Print snapshots include section disclosures and restore them.
- The user chose the current free Leaflet/OpenStreetMap map to avoid paid
  mapping services. Keep maps free of API billing. Google Maps and Apple Maps
  can be used for ordinary external navigation links.
- Optional `flights` keep each endpoint's airport-local date and time; an
  inbound flight may depart before the trip's first local date. Confirmation
  belongs to each flight, not to all transport listed in the plan.
  `brandId` identifies the marketing carrier; `operatedByBrandId` identifies
  the actual operator when different and takes precedence for the visual mark.
  Keep both flight numbers and their roles clear on a codeshare.
- Checklist items use `kind: "todo"` for actions and `kind: "check"` for
  missing details or confirmations; an omitted kind defaults to an action.
  Only outstanding items belong in the checklist. Keep general guidance in
  practical notes, and update completion through the trip's confirmed data.
  Optional `timing` distinguishes `asap`, `reservation-opens`, `deadline`,
  and `trip-date`. Openings reference existing `bookingWindowIds` rather than
  duplicating timestamps. Related travel dates are not deadlines; never invent
  sales cutoffs or reservation openings. Same-date items retain source order,
  and undated items remain visible at the end. Use `priority: "high"` and
  `priorityReason` for material dependencies supported by the recorded plan.
- Stay segments may have `cost` with an ISO currency and booking total.
  Keep prices with their check-in/check-out segment as the single source for
  both accommodation cards and the final cost summary. Omit unknown costs;
  never substitute zero. Sum currencies separately and keep estimated extras
  separate from included fees. Booking amounts are not evidence of payment.
  Each estimated extra can have a `kind` and an explicit `quantity` calculation.
  Its total must agree with the supplied per-person/per-night estimate.
  Optional `paymentStatus` is `paid`, `pay-on-arrival` or `unknown`, recorded
  independently of booking. Unknown payment is not evidence of either payment
  or an unpaid balance; do not treat it as zero.
- `ticketOptions` store per-person prices, ISO currencies, and conditional
  estimates. `bookingWindows` use absolute opening timestamps and seller
  IANA timezones; display the seller's local time alongside Los Angeles time.
  Show ticket strategies as alternatives to choose between. `addOnTickets`
  itemizes tickets already included in an option's `estimatedTotal`.
  Only an explicit user decision sets `selectedTicketOptionId`; a design
  approval or selection preference does not confirm purchase or payment.
  Compare options only when multiple current strategies remain. A single
  explicitly selected strategy shows its per-person and traveler prices
  without retaining superseded alternatives or calling the choice a booking.
  Only an explicit purchase confirmation sets `purchaseStatus: "purchased"`;
  its independent `paymentStatus` uses the same recorded payment semantics.
- Optional `transport` owns a single ISO currency, dated `legs`, referenced
  `budgetItems`, `budgetNotes`, payment guidance and official-source IDs.
  Leg coverage is `pass`, `additional` or `mixed`; `fare` is the known
  additional amount per adult, and `regularFare` records a supplied
  alternative to a conditional discounted fare. Explain covered and extra
  amounts or choices for mixed coverage. Omit unknown fares rather than zero.
  Budget items reference either a `ticketOptionId` or `legIds`; compute
  per-person and traveler totals from those records without copied amounts.
  Validate currency, references, known referenced fares and overlapping budget
  entries. Keep covered fares and already included extras out of repeated
  totals. Show the journey/payment list in Preparations and the scoped
  transport budget separately from accommodation in Costs, with their scopes
  clear in the collapsed summary. Keep assumptions and exclusions with the
  budget. It is an estimate, not evidence of purchase, payment or a complete
  trip budget.
  A leg's `reservationStatus: "booked"` and `reservationNote` record an explicit
  reservation confirmation separately from coverage, fare purchase and payment.
  Optional `reservationKind` is `seat` by default or `time-slot` for a reserved
  boarding window; keep their confirmation labels distinct. Temporary reservation
  messages remain checks until completion is established; verify an existing
  attempt before prompting a duplicate booking.
- Optional `budget` stores one ISO currency, party-total `allowances`, a supplied
  `suggestedReserve` range and scope notes. Derive its spending range from
  existing stay costs/taxes, referenced transport amounts, dated booked-meal
  costs and these allowances; never store copied subtotals or grand totals.
  Allowances use `minimum`, optional `maximum`, and optional date/meal-option
  references for unbooked choices. Count a pass once in the overall transport
  budget; allowances exclude pass prices and meals already included elsewhere.
  Distinguish the spending estimate from the suggested preparation reserve
  and list exclusions.
  Show explicitly recorded paid amounts with their known scope; an incomplete
  payment record cannot establish remaining unpaid spending by subtraction.
- Keep `TripDay.alternatives` as separate labeled schedules. Never interleave
  an optional or fallback route into the main day's itinerary or map route.
  Optional `relatedAlternativeIds` references existing alternatives on the
  same day, with unique nonself IDs. Render ordinary fragment links with
  accessible touch targets and the existing disclosure-reveal behavior.
  Related schedules remain separate and viewing them does not select one.
  Printing opens both daily and alternative details, then restores their state.
  Printing also includes ticket details and temporarily shows every day,
  restoring the selected day, viewing mode, and disclosures afterward.
- Optional `Trip.linkedPlans: TripLinkedPlan[]` describes an unselected
  alternative spanning at least two dates. Each record has a stable `id`,
  `title`, `description`, `days: [{ date, alternativeId }]`, `notes` and
  optional `sourceIds`. Validate distinct ascending existing trip dates,
  every referenced day's alternative, unique IDs and official-source
  references. Reuse those complete schedules rather than copy them, store
  aggregate totals or establish selection, visits or qualification.
  Show the full native, initially closed panel only on its last
  referenced date, with ID `day-${lastDate}-linked-plan-${id}`. Earlier
  dates show compact links to that panel and their own referenced alternative.
  Keep cross-date dependencies and any completion conditions explicit.
  Fragment links reveal the target day and containing disclosures; printing
  includes the complete panel once and restores prior disclosure state.
  Linked-plan navigation does not change the accepted schedule or budget.
- Optional `TripDay.routeOptions` has `title`, `mainLabel`,
  `alternativeIds` and optional `notes`. It compares the existing main
  schedule with referenced alternatives without storing copied totals or a
  selected-route state. Keep the first comparison note visible as short
  guidance; remaining notes use an initially closed native disclosure with a
  note count, manual toggle and print-state restoration.
  `TripDay.busCount` and alternative `busCount` count
  whole-day planned bus rides, including the approach to a walking route.
  Alternative `walking` records `distanceKm`, optional additional
  `optionalDistanceKm` and an optional scope `note`; use `walkingNote`
  for qualitative walking rather than inventing a zero distance.
  Derive comparison distances from the main `hike` or alternative `walking`,
  and planned stamp ranges from required/optional stops. Validate references,
  count/range values and duplicate alternative IDs. Variant maps reference the
  corresponding alternative; optional detours stay labeled and outside core
  route connections. Comparison, forecasts and fragment navigation do not
  establish a changed accepted route, booking or payment. Keep unselected
  variant fares outside the main transport budget.
- Optional `TripDay.stamps` records planned stamp stops and official numbering,
  with route or eligibility conditions stated explicitly. It does not assert
  that a stamp was collected or a pilgrimage qualification was completed.
  Alternatives may own the same stamp-collection structure; a stop's optional
  `optional: true` identifies a conditional extra stop for comparison ranges.
  Keep shared booklet, collection, and registration guidance in `stampGuide`.
- Optional `Trip.diningOptions` owns reusable restaurant and meal-option
  details for that trip. `TripDay.dining` groups references by meal, with
  date-specific conditions and explicit reservation confirmations. Both
  daily panels and dining reminders use these records. Keep options marked
  `requiresItineraryChange` visible but outside current-route reservation
  prompts. Dining references remain collapsed and are included in printing.
  A dated choice's optional `cost` is the entire party's recorded order amount,
  with its ISO currency, independent payment status and public cost notes.
  Reuse it in daily dining and Costs; menu estimates for unbooked choices belong
  in budget allowances. Do not count meals included in lodging again.
- Optional `TripDay.poem` stores a requested epigraph's exact original,
  language-tagged interpretation, author, primary work, excerpt flag,
  bibliography, context and local literary references. Display it immediately
  after the daily map or guide, before the description, accommodation and
  daily reminders. Keep credits visible and detailed references collapsed;
  printing includes and restores
  their disclosures. Preserve original spelling, spacing and line breaks,
  distinguish borrowed imagery from the original location, and do not invent
  poems for days without a submission. Literary links stay outside the
  official-source catalog and do not establish independent verification.
- Scope epigraph decoration to its trip. Japan currently uses a quiet paper
  background and original local sakura illustrations. Keep decoration
  noninteractive, preserve text contrast and mobile reading width, and use
  plain print backgrounds.
- Source disclosures stay closed when expanding all days. Reveal a source's
  ancestor disclosures when following its direct fragment link.
- Optional `gallery` stores photo IDs, local images, captions, and related day
  or alternative links. `sights` stores introductions and photo/source IDs;
  days and alternatives refer to them with `sightIds`. Keep optional sights
  in their labeled alternative, and do not infer a new visit from a photo.
- Optional `localName: TripLocalName` belongs to destinations, daily-map places,
  sights and gallery photos, separate from primary names and `englishName`.
  Its `text` preserves the local script and `language` is a valid BCP 47 tag. Reuse
  `LocalPlaceName.astro` and `distinctLocalName()` for language-tagged display
  and NFC duplicate suppression; map labels use the same rule with safe DOM
  text nodes. Visited-location aggregation retains destination local names.
- Keep galleries out of homepage previews. Load the first gallery photo with
  priority, lazy-load later images, and avoid automatic slide rotation.

## Source submissions

- Archive each publishable user submission separately in that trip's `inputs/`
  before editing the structured plan. Preserve original text and language;
  append a new file for later submissions instead of rewriting old sources.
- Record the origin, archive date, applied changes, explicit superseding
  decisions, and open questions in that trip's English `history.md`.
- Apply clear additions and corrections. A partial submission replaces only
  the facts it explicitly changes. Keep accepted decisions when a new input
  is silent; ask about genuine unresolved contradictions while continuing
  independent updates.
- Keep raw-input provenance in the history. `Trip.sources` is the list of
  official reference links displayed on the website.
- Tracked archives are public on GitHub even though they are not website pages.
  Private originals and reservation documents belong in ignored
  `.local/trips/<slug>/` storage. Do not commit or publish private codes or
  documents. Ignored files need a separate private backup when required.
- For a submission containing private booking material, preserve the full
  original in ignored private storage. A public excerpt must contain only
  details explicitly authorized for publication and be labeled as an excerpt
  in its file and history. Removing email links alone does not establish permission
  to publish the remaining booking document.
  Private material can occur in daily or dining sections as well as booking
  appendices. Review every selected passage; preserve identities, exact seat
  records, private codes and order/document links only in ignored storage.

## Verification and publication

- Run `pnpm build` to check content references and images, run the weather
  date/unit/cache tests, check types, and build the static site.
  `pnpm check:content` runs only the content checks; `pnpm test:weather` runs
  the focused weather tests.
- Verify the changed pages and relevant controls in a browser, including a
  narrow mobile viewport when layout changes. Use focused checks.
- Preserve the existing GitHub Actions Pages workflow. Push authorized site
  updates to `main`, wait for the deployment, and verify the public URLs.
- Update this English context and README when project conventions change.
