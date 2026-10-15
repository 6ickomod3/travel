# Brand asset provenance

These assets identify airlines and accommodation brands at a small scale in travel
plans. The source pages, original asset URLs, retrieval date, and any transformations
are recorded in `provenance.json`.

Sourced artwork retains its original colors and proportions. The owners'
trademark and copyright rights remain applicable; no open reuse license is claimed
here. Image-credit licenses for sightseeing photographs do not apply to these
marks.

`src/lib/brands.ts` defines stable brand identities and attaches locally available
assets from this manifest. `BrandMark.astro` displays a linked, accessible real name
with the mark, or a plain initials fallback where a verified mark is unavailable.
The airline identities remain separate for codeshare flights: United Airlines is
UA, China Eastern Airlines is MU, and Shanghai Airlines is FM.
Shanghai Airlines uses its own FM initials and full name until a verified static
mark is available. The official airport listing confirms the identity, but its
referenced asset did not return image bytes during this lookup.

The United mark is an English-Wikipedia/Wikimedia-hosted trademark image, not a
Commons photograph. Its source-page license text was unavailable under external
input filtering, so no Creative Commons or public-domain claim is made. The
China Eastern image comes from its official corporate profile header and retains
the original SkyTeam lockup.

RESPIRE uses the official Hankyu-Hanshin-Daiichi Hotel Group mark as a chain
identifier, rather than a property-specific logo. The Comfort Hotel and SEN.
RETREAT marks are brand marks shown on the verified Kii Tanabe and Chikatsuyu
property pages. The exact hotel names remain in itinerary data. 川湯まつや uses
its own name and initials because an exact property asset and official URL have
not been verified.

Further verified assets can be added to this directory and manifest without
changing the component interface. Keep source marks intact and record their
actual provenance and stated rights.
