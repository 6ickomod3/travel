# New trip template

Copy this folder to `itineraries/<slug>/`, rename `trip.ts.example` to
`trip.ts`, and replace every example value. Keep the folder and slug identical.
The example file is not discovered or published until it is renamed.

Add a real cover and its attribution under `public/images/trips/<slug>/`.
Save the first original input in `inputs/`, then record its origin and accepted
decisions in `history.md`. Use a dated `Trip` once actual dates and plans are
available; keep a `TripPlaceholder` while they are unknown.

See [the complete workflow](../../docs/content-workflow.md).

Follow [the shared trip design principles](../../docs/trip-design-principles.md)
for page structure, navigation, status and visual conventions. Destinations,
sights and gallery photos may have `localName: { text, language }` to display
accurate local-script names alongside the trip's primary language. Choose
quotes, motifs and native fonts to suit the destination.
