# Project context and design guidelines

## Language

- Write all internal project context, guidelines, documentation, plans, handoffs,
  and code comments in English. Keep this file in English when updating it.
- Public website content can be English or Chinese. Follow each trip's
  `language` field; Japan 2026 is in Simplified Chinese and UK 2026 is in English.
- Chat with the user in the language appropriate to their latest message.
- Chinese itinerary text, destination names, image descriptions, source labels,
  and font glyph subsets are public content, not internal instructions.

## Purpose and current content

Elsewhere is an evergreen personal travel website for practical trip planning.
The user owns the repository at https://github.com/6ickomod3/travel and publishes
the site at https://6ickomod3.github.io/travel/ using GitHub Pages.

- Japan 2026: November 13–21, nine days, two travelers, with an agreed itinerary.
  Its route covers Osaka, Hiroshima, Miyajima, Kii-Tanabe, Kumano Kodo,
  Kawayu Onsen, and Nara.
- UK 2026: a placeholder with a year only. Dates and itinerary are undecided.
  Keep the existing `uk-2026` slug when adding its itinerary later.

## Design and content

- Use concise, practical headings and labels: Trips, Map, Route, Accommodation,
  Daily itinerary, Preparations, and Official sources. Use direct equivalents
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
- Show useful information: dates, routes, schedules, transport, accommodation,
  booking states, walking details, and official sources.
- Preserve uncertainty and distinguish reference departures from confirmed
  tickets. Do not invent dates, cities, activities, travelers, or reservations.
- Keep image and map attribution visible beside the relevant content.

## Implementation

- Astro builds static pages. The package uses pnpm and Node.js 24 in CI.
- Keep the GitHub Pages base path `/travel/`, the trailing slash convention,
  and `withBase()` for internal links and local assets.
- `src/data/trips.ts` is the content registry. `trips` holds dated itineraries;
  `tripPlaceholders` holds year-only entries; `tripCollection` combines them.
- Only dated trips may enter date formatting, duration, and travel-status
  calculations. Do not supply fake dates for placeholders.
- The homepage features a dated itinerary. Its trip/country totals include
  placeholders; its day total includes only trips with known dates.
- `src/pages/trips/[slug]/index.astro` chooses between `TripItinerary.astro`
  and `TripPlaceholder.astro`. New entries also belong in the sitemap.
- Keep Leaflet maps, destination lists, expand/collapse, and itinerary printing.
  Images and fonts are local assets; map tiles come from OpenStreetMap.

## Verification and publication

- Run `pnpm build` to check types and build the static site.
- Verify the changed pages and relevant controls in a browser, including a
  narrow mobile viewport when layout changes. Use focused checks.
- Preserve the existing GitHub Actions Pages workflow. Push authorized site
  updates to `main`, wait for the deployment, and verify the public URLs.
- Update this English context and README when project conventions change.
