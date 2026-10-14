# Project context and design guidelines

## Language

- Write all internal project context, guidelines, documentation, plans, handoffs,
  and code comments in English. Keep this file in English when updating it.
- Public website content can be English or Chinese. Follow each trip's
  `language` field.
- Chat with the user in the language appropriate to their latest message.
- Chinese itinerary text, destination names, image descriptions, source labels,
  and font glyph subsets are public content, not internal instructions.

## Purpose

Elsewhere is an evergreen personal travel website for practical trip planning.
The user owns the repository at https://github.com/6ickomod3/travel and publishes
the site at https://6ickomod3.github.io/travel/ using GitHub Pages.

- Each trip owns its current content, source submissions, and English decision
  history under `itineraries/<slug>/`. Read that trip's `history.md` before
  updating its plan. Keep trip-specific facts out of the shared guidelines.
- Follow `docs/content-workflow.md` for source ingestion, conflict handling,
  templates, and private storage.

## Design and content

- Use concise, practical headings and labels: Next trip, Trips, Visited atlas,
  Route, Accommodation, Daily itinerary, Preparations, and Official sources. Use direct equivalents
  for Chinese pages.
- Remove ornamental prose, motivational statements, promotional language,
  abstract section names, and repeated descriptions of the same information.
- The Idea/About section and free-form travel notebooks have been removed at
  the user's request. Do not reintroduce them unless the user asks.
- Keep factual day reminders and practical travel notes in the itinerary data.
  These are different from the removed editable notebook feature.
- Preserve a modern visual style through typography, spacing, the warm cream /
  forest green / terracotta palette, images, and interactive maps.
- Keep mobile layouts readable, controls accessible, and navigation direct.
- The homepage is an overview: highlight the next trip, provide compact trip
  links, and show an atlas of visited places. Trip previews show only covers,
  titles, countries, dates, status, and links. Keep routes, day/night totals,
  schedules, accommodation, and other itinerary details on the trip pages.
- Show useful information: dates, routes, schedules, transport, accommodation,
  booking states, walking details, and official sources.
- Preserve uncertainty and distinguish reference departures from confirmed
  tickets. Do not invent dates, cities, activities, travelers, or reservations.
- Keep image and map attribution visible beside the relevant content.

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
- Only dated trips may enter date formatting, duration, and travel-status
  calculations. Do not supply fake dates for placeholders.
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

## Verification and publication

- Run `pnpm build` to check content references and images, check types, and
  build the static site. `pnpm check:content` runs only the content checks.
- Verify the changed pages and relevant controls in a browser, including a
  narrow mobile viewport when layout changes. Use focused checks.
- Preserve the existing GitHub Actions Pages workflow. Push authorized site
  updates to `main`, wait for the deployment, and verify the public URLs.
- Update this English context and README when project conventions change.
