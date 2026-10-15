# Trip content and source workflow

## Folder ownership

Keep each trip's authored material together under `itineraries/<slug>/`.
The folder name and the trip's `slug` must match. Keep the slug stable when
dates change, a placeholder becomes an itinerary, or a trip is completed.

```text
itineraries/
  japan-2026/
    trip.ts
    history.md
    inputs/
      2026-10-14-01-itinerary.md
  uk-2026/
    trip.ts
    history.md
    inputs/
      2026-10-14-01-placeholder.txt
public/images/
  trips/<slug>/
    cover.svg or cover.webp
    credits.json
  shared/
    atlas-world.svg
    credits.json
  brands/
    official-logo.svg
    README.md
templates/trip/
  trip.ts.example
  history.md
  inputs/
src/data/
  types.ts
  trips.ts
```

- `trip.ts` is the current structured plan used to build the trip page,
  homepage previews, and visited atlas. Export its object as the default and
  check it with `satisfies Trip` or `satisfies TripPlaceholder` from
  `../../src/data/types`. Keep public trip content in its chosen language.
  Optional flights, ticket options, booking windows, and separate day
  alternatives keep detailed logistics in that same plan. Flight endpoints
  use airport-local dates and times; booking openings use explicit offsets
  and seller timezones. Ticket prices and estimates are per person, with an
  ISO currency and any conditions stated in their notes.
  Optional `brandId` points to the shared airline or property identity.
  For codeshares, the actual `operatedByBrandId` and operating flight number
  remain distinct from the marketing carrier and flight number.
  Ticket strategies are mutually exclusive alternatives. `addOnTickets`
  itemizes extra tickets already counted in `estimatedTotal`; `estimateNote`
  provides a concise condition in the comparison. Only an explicit choice
  records `selectedTicketOptionId`, which does not establish purchase.
  Pending checklist items appear first on trip pages. Use `kind: "todo"`
  for choosing, booking, buying, or preparing, and `kind: "check"` for
  missing details and confirmations. An omitted kind defaults to `todo`.
  Keep general guidance in practical notes and remove resolved checklist
  items when a new submission explicitly confirms their completion.
  Optional `stays[].checkIns[].cost` records the total for that booking
  segment, its ISO currency, included fees, and estimated additional charges.
  The accommodation cards and final Costs section use the same record.
  Missing prices remain absent and are excluded from partial totals. Sum
  currencies separately and never infer payment from a confirmed booking.
  Estimated extras can use `kind: "accommodation-tax"` and a supplied
  `quantity` with `perPersonPerNight`, `people`, and `nights`. Preserve the
  submitted rate and calculation; keep already included fees out of extras.
  Booking progress derives from recorded flight statuses and stay nights.
  Optional daily `stamps` holds ordered collection stops, official numbers,
  and any route conditions. `stampGuide` holds shared collection and
  eligibility instructions. Planned stamps do not establish collection or
  qualification; preserve uncertainty about each traveler's eligibility.
  Research references use disclosures that start closed throughout trip
  pages. They open for printing and restore afterward; map and image
  attribution remains visible beside its content.
  Daily navigation focuses one day at a time while preserving a full-trip
  view and native disclosures. Printing includes every day, alternatives,
  ticket details, and references, then restores the previous screen state.
  Optional `gallery` stores the trip's top photo sequence and related day or
  alternative links. `sights` stores concise factual introductions, source
  references, and photo IDs. Each day's or alternative's `sightIds` selects
  its introduction cards. A photo does not establish a planned or completed
  visit; preserve optional-route labels and existing schedules.
- `inputs/` contains the publishable source submissions. Store each separately
  as `YYYY-MM-DD-NN-topic.md` or `.txt`; use the archive date and a two-digit
  sequence within that day. Preserve original wording, links, formatting,
  language, and typos. Do not rewrite an old submission to match a new plan.
- `history.md` is an English source index and decision record. Record each
  input's origin, archive date, scope, applied changes, unresolved questions,
  and any explicit superseding decision. The history is not a second editable
  copy of the full itinerary.
- `public/images/trips/<slug>/` contains that trip's published images and
  attribution metadata. Keep unused retained images in its `archive/` folder.
  Metadata filenames are relative to their own `credits.json`; the shared
  resolver converts them to full public paths to avoid filename collisions.
  Use real photos of the named sights, record author, source, license,
  dimensions and any changes, and keep required credit links visible in the
  gallery. Optimize local images rather than introducing paid image APIs.
- Shared illustrations and font attribution belong in
  `public/images/shared/credits.json`. Font files remain in `public/fonts/`.
- Reusable official brand assets belong in `public/images/brands/`, with
  English records of their official source, changes, and trademark/copyright
  status. `src/lib/brands.ts` and `BrandMark.astro` provide identity and
  rendering across trips. Brand records remain separate from photo licenses;
  use a full name or initials when an official mark is unavailable.
- `src/data/types.ts` defines shared content types. `src/data/trips.ts` is a
  small registry that discovers `itineraries/*/trip.ts` automatically. Pages
  and helpers import the registry or its re-exported types; trip modules must
  import types directly from `types.ts` to avoid registry cycles.

The archived text and history are not emitted as website pages. They remain
publicly readable in the GitHub repository.

## Process a new submission

1. Identify the trip from the message or attachment. If it is unclear, ask
   which trip it belongs to while continuing independent work.
2. Save the original submission first and add its source entry to the history.
   Record an original receipt date only when known; otherwise use the archive
   date and describe the origin honestly.
3. Compare it with the current `trip.ts`. Extract dates, activities, transport,
   accommodation, booking states, practical notes, and reference links.
4. Apply clear additions and explicit corrections. A new submission only
   replaces facts it actually changes; do not treat every fragment as a full
   replacement. Keep previously agreed decisions when the new input is silent.
5. Preserve uncertainty. Reference departures are not purchased tickets;
   a hotel name is not evidence of a confirmed reservation. Record genuine
   contradictions as open questions and request clarification when necessary.
   Continue changes that do not depend on the disputed detail.
   Keep confirmed flights separate from planned ground transport, and keep
   complete optional/fallback routes in a day's `alternatives` rather than
   mixing their departures into the main schedule.
6. Keep destination, stay, checklist, and official-source IDs stable. Repeated
   IDs in `mapRoute` represent return journeys and are intentional. Submitted
   text provenance belongs in the history; `Trip.sources` contains official
   links that can be shown on the trip page.
7. Update the history with what was applied and what remains unresolved. Run
   the content check and production build, inspect relevant page behavior,
   and publish authorized changes. Summarize the changes and open questions.

Keep internal guidelines, history entries, plans, and code comments in English.
Original user submissions, quotations, and public itinerary content can remain
Chinese or English.

## Add a trip

1. Copy `templates/trip/` to `itineraries/<new-slug>/`.
2. Rename `trip.ts.example` to `trip.ts` and replace the example values. Start
   with a year-only placeholder when exact dates or the itinerary are unknown.
3. Add the trip cover and `credits.json` under
   `public/images/trips/<new-slug>/`. Fill in the image description and credit.
4. Archive the first source submission and initialize the history.
5. Run `pnpm build`. The registry automatically adds the trip to its page,
   homepage collection, and sitemap; no central trip list needs editing.

When a placeholder gains an itinerary, keep the same folder and slug and
replace its object with a dated `Trip`. Only explicitly completed trips enter
the visited atlas, and their destinations must reflect actual visits.

## Private material

Store unredacted booking documents, confirmation codes, passport details, and
other private source files under `.local/trips/<slug>/inputs/` or
`.local/trips/<slug>/documents/`. This directory is ignored by Git and is not
served by the website. Keep only publishable originals or clearly identified
redacted copies in the tracked input archive; never overwrite a private
original with a redacted copy.

Ignored local files are not backed up by GitHub. Use a separate private backup
when they need to be available on another device. Do not move private files
into `public/`, reference them from published data, or commit them to obtain
that backup.

When only selected details are authorized for publication, create a clearly
labeled public excerpt instead of publishing the full booking document with
its private links removed. Preserve the original privately and record the
excerpt's scope and provenance in the English trip history.
