# Travel

A personal travel website for planning trips and keeping the memories afterward. The first trip is **Japan, November 13–21, 2026, for two people**. Its Chinese itinerary follows the agreed route: Osaka → Hiroshima and Miyajima → Kii-Tanabe → Kumano Kodo → Kawayu Onsen → Osaka and Nara. The page records the day-by-day schedule, accommodation confirmations, outstanding bookings, and source links.

Live: [Travel collection](https://6ickomod3.github.io/travel/) · [日本，秋日之旅](https://6ickomod3.github.io/travel/trips/japan-2026/)

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

Edit `src/data/trips.ts`, following the Japan entry. Give each new trip a unique slug, then add its dates, images, destinations, and itinerary. Set `language` to `zh-CN` for a Chinese trip page or `en` for English. Optional schedules, hotel stays, checklists, practical notes, and sources keep detailed plans together; `mapRoute` records return journeys separately from the unique destination list.

Trip entries automatically appear on the homepage and generate a `/trips/{slug}/` page. On GitHub Pages, those pages live under `/travel/`, such as `/travel/trips/japan-2026/`.

Trip content lives in the repository. Because the website is public, keep booking confirmation codes, passport details, and private reservation files out of published content.

## Hosting and maps

Astro builds static pages, so there is no backend to maintain. The interactive map uses Leaflet and externally fetched OpenStreetMap tiles; no map key is needed. Images and fonts are served locally, and no analytics or tracking scripts are included.

The notebook on each trip page saves notes in that browser on that device. Use **Export notes / 导出笔记** to keep a copy or move them elsewhere; notes do not sync to GitHub or between devices. Accommodation confirmation states are maintained in the trip data.

The default hosting settings are `BASE_PATH=/travel/` and `SITE_URL=https://6ickomod3.github.io`. To build for the root of a custom domain instead:

```sh
BASE_PATH=/ SITE_URL=https://example.com pnpm build
```

Use those same environment settings in your publishing workflow when changing hosts.
