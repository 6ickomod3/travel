# The Journey Atlas

A personal travel website with a next-trip highlight, trip pages, and a visited atlas. Each trip has its own content, original source submissions, and planning history.

Live: [Trips](https://6ickomod3.github.io/travel/) · [Japan 2026](https://6ickomod3.github.io/travel/trips/japan-2026/) · [UK 2026](https://6ickomod3.github.io/travel/trips/uk-2026/)

## Project context and design

[AGENTS.md](AGENTS.md) records the project context and design guidelines in English. Internal documentation, development plans, handoffs, and code comments use English; public trip content follows each trip's language, with language-tagged quotations and translations.

The site uses concise labels and factual travel information. The Idea/About section, editable travel notebooks, and unsolicited ornamental prose have been removed. Requested cover copy and daily epigraphs keep their poetic wording. Visual design comes from typography, spacing, images, and interactive maps.

The homepage highlights the current or next dated trip, links to each trip through compact cards, and shows a visited atlas. Routes, schedules, accommodation, and other itinerary details live on the individual trip pages. The next-trip highlight and date-based status labels update with the calendar in the browser, including after returning to an open tab.

Trip pages show outstanding tasks with recorded booking progress, reuse local brand marks, and provide date navigation with a focused day or full-trip view. Printing includes all days, alternatives, ticket details, and references and restores the previous view afterward.

Meal options appear at the bottom of each day. A separate dining-reservation
section near the pending checklist groups unbooked candidates by restaurant,
ordered by their first meal date, with links to the relevant day.

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
docs/                    Content management workflow
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

Edit the relevant `itineraries/<slug>/trip.ts`. This is the current structured plan; its `history.md` records decisions and source references, and `inputs/` preserves each original publishable submission. Keep internal history and guidelines in English, while original text and website content can stay Chinese or English.

For a new trip, copy [templates/trip/](templates/trip/) into `itineraries/<slug>/`, rename `trip.ts.example` to `trip.ts`, and replace the example values. Add its images and `credits.json` under `public/images/trips/<slug>/`. The folder and data slug must match.

New `*/trip.ts` files are discovered automatically and appear in the homepage collection, trip routes, and sitemap. On GitHub Pages, their pages live under `/travel/trips/{slug}/`. No central trip list needs editing.

Use a year-only `TripPlaceholder` until dates and plans are known, following UK 2026. Once an itinerary is ready, change that same file to a dated `Trip`, keeping its slug and URL. Optional schedules, flights, stays, ticket options, reservation opening times, checklists, practical notes, and official sources keep detailed plans together. `mapRoute` records returns and transfers separately from unique destinations; complete alternative day plans have their own labeled schedules.

Pending checklist items appear first on each trip page, grouped into To do actions and To check confirmations through their optional `kind` field. Each group sorts by optional `timing`: immediate actions, referenced reservation openings or calendar dates, then undated items. Related travel dates are labeled separately from deadlines. Optional `priority: "high"` and `priorityReason` identify important dependencies. Ticket comparisons, reservation-opening times, and practical reminders remain in Preparations.

Add optional `cost` records to accommodation `checkIns` for booking totals and estimated extra charges. The same values appear on accommodation cards and in a final Costs section, totaled by currency; unknown prices stay unpriced and booking amounts do not imply payment.

Optional `diningOptions` stores reusable restaurant details and public booking
contacts within each trip. Daily `dining` groups refer to those options by meal,
or provide practical meal guidance with collapsed public references. Keep
food suggestions separate from the existing timetable. Only an explicit
confirmation marks a date-and-meal reservation as booked; route-change
alternatives remain visible but are excluded from current reservation reminders.

Daily `stamps` can store ordered collection stops and route conditions; `stampGuide` stores booklet and eligibility guidance. These describe a plan without marking stamps collected or qualifications completed. Research references start collapsed across trip pages and remain available when printing.

Optional `gallery` photos appear in a manual carousel at the top of a trip page. `sights` holds concise introductions and links to gallery photos; days and alternatives select them with `sightIds`. Photo credits remain visible, and optional sights stay with their separate routes.

Optional `coverIntroduction` displays requested cover copy and its
language-tagged translations together. The factual `summary` remains
available for page metadata.

Optional daily `poem` stores the exact quotation, language-tagged interpretation,
author, work, excerpt status, context and literary sources within its trip.
It appears after daily accommodation and reminders, before the timetable.
Credits stay visible; detailed references start collapsed and open for printing.
Dates without a supplied poem remain unchanged.

You can supply plain text or attachments. The workflow is: save the source, compare it with the existing plan, apply clear additions/corrections, record unresolved questions, then check and publish the trip page. New fragments do not silently replace unrelated accepted decisions.

## Record visited places

Set a dated trip's `status` to `completed` after confirming it was taken. Before doing so, make its destinations reflect the places actually visited: remove skipped stops and update the trip details as needed. Keep each destination's ID stable when revisiting the same place on another trip.

The visited atlas automatically combines destinations from explicitly completed trips, deduplicates places within each country, and links each place to its completed trips. It shows no planned destinations or route lines. Calendar dates alone never mark a trip as completed. Until visits are recorded, the homepage shows a world graphic and an empty state.

Tracked input archives are publicly readable on GitHub, even though they are not website pages. Store private originals and reservation documents in ignored `.local/trips/<slug>/` storage and keep only publishable or identified redacted copies in the tracked archive. GitHub does not back up ignored local files.

## Hosting and maps

Astro builds static pages, so there is no backend to maintain. The interactive map uses Leaflet and externally fetched OpenStreetMap tiles; no map key is needed. Images and fonts are served locally, and no analytics or tracking scripts are included.

Accommodation confirmation states are maintained in the trip data.

`pnpm build` runs content validation, type checks, and the static build. Content checks catch missing images, duplicate IDs, invalid dates, and broken destination/stay/source references. Run `pnpm check:content` for the content check alone.

The default hosting settings are `BASE_PATH=/travel/` and `SITE_URL=https://6ickomod3.github.io`. To build for the root of a custom domain instead:

```sh
BASE_PATH=/ SITE_URL=https://example.com pnpm build
```

Use those same environment settings in your publishing workflow when changing hosts.
