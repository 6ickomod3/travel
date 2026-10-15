# Brand asset provenance

These assets identify airlines and accommodation brands at a small scale in travel
plans. The source pages, original asset URLs, retrieval date, and any transformations
are recorded in `provenance.json`.

User-supplied files record their filename, receipt date, SHA-256 and supplied
public source page. Content checks verify their copied bytes against that hash.
An unknown original asset URL stays unclaimed; downloaded marks retain their
direct public asset URL.

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

Hotel Granvia Hiroshima South Gate has a separate property identity, official
website link, and a purple property logo supplied by the user as `logo.svg`
after they identified it on the official English page. The supplied SVG is
retained byte for byte. Its original website asset URL was not independently
retrieved because external webpage reading was security-filtered. This identity
remains distinct from other Granvia properties.

The renderer gives vertical or near-square marks more height than horizontal
wordmarks, using the recorded intrinsic dimensions. Hotel cards keep the full
property name and original artwork proportions. This applies to both the South
Gate and Comfort Hotel marks and can be reused for future brands.

Further verified assets can be added to this directory and manifest without
changing the component interface. Keep source marks intact and record their
actual provenance and stated rights.
