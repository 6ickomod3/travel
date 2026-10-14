# Trip packages

Each trip has one folder named after its stable website slug:

- `trip.ts`: the current structured website content.
- `inputs/`: original publishable submissions, stored separately and unchanged.
- `history.md`: source references, decisions, changes, and open questions in
  English.

The site discovers `*/trip.ts` automatically. Trip images and their credits
live under `public/images/trips/<slug>/`; private material belongs in ignored
`.local/trips/<slug>/` storage.

See [the content workflow](../docs/content-workflow.md) for ingestion rules,
private storage, and the reusable [trip template](../templates/trip/).
