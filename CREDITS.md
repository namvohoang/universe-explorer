# Credits

Everything in Universe Explorer that was made by someone else: images, textures, shape models,
datasets, fonts and software. Rules for adding a row are in `.claude/rules/media.md`.

## Images, textures and shape models

Files under `public/media/`. A row is added in the same commit as its file, and only after the
image's own page has been opened and read.

| File | Object | Kind | Credit | Licence | Source | Retrieved | Changes |
|---|---|---|---|---|---|---|---|
| `public/media/maps/mercury.webp` | mercury | composite | MESSENGER Team, Arizona State University, Johns Hopkins Applied Physics Laboratory, Carnegie Science. Published by USGS Astrogeology Science Center. | Use constraints on the page: "Please cite authors". | https://astrogeology.usgs.gov/search/map/mercury_messenger_mdis_global_basemap_bdr_166m | 2026-10-04 | The 1024-pixel preview of the mosaic offered on the page, converted to WebP. It is monochrome: brightness at one near-infrared wavelength (750 nm), not colour. |
| `public/media/maps/venus.webp` | venus | false-colour | NASA/JPL-Caltech. The page gives no credit line; it says "From the database of JPL/Caltech generated planetary maps". | NASA media usage guidelines: generally not subject to copyright in the US, NASA acknowledged as the source. No copyright notice on the page. | https://science.nasa.gov/3d-resources/venus/ | 2026-10-04 | Venus.jpg converted to WebP. The page says: "Stitched from Magellan RADAR imagery. Gaps filled in with global texture." Radar, not visible light. |
| `public/media/maps/earth.webp` | earth | composite | NASA Earth Observatory, Blue Marble: Next Generation. The page gives no credit line. | NASA media usage guidelines: generally not subject to copyright in the US, NASA acknowledged as the source. No copyright notice on the page. | https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-topography-bathymetry/ | 2026-10-04 | The July 2004 image with topography and bathymetry shading, resized from 5400x2700 to 2048x1024 and converted to WebP. |
| `public/media/maps/moon.webp` | moon | composite | NASA's Scientific Visualization Studio | NASA media usage guidelines: generally not subject to copyright in the US, NASA acknowledged as the source. No copyright notice on the page. | https://svs.gsfc.nasa.gov/4720/ | 2026-10-04 | lroc_color_2k.jpg from the CGI Moon Kit (Lunar Reconnaissance Orbiter camera data), converted to WebP. |
| `public/media/maps/mars.webp` | mars | composite | NASA/Jet Propulsion Laboratory & Caltech | NASA media usage guidelines: generally not subject to copyright in the US, NASA acknowledged as the source. No copyright notice on the page. | https://science.nasa.gov/3d-resources/mars/ | 2026-10-04 | Mars.jpg converted to WebP. The page says: "From Viking images processed at the USGS." |
| `public/media/maps/jupiter.webp` | jupiter | composite | JPL & Caltech | NASA media usage guidelines: generally not subject to copyright in the US, NASA acknowledged as the source. No copyright notice on the page. | https://science.nasa.gov/3d-resources/jupiter/ | 2026-10-04 | Jupiter.jpg converted to WebP. The page says: "From Voyager images." |
| `public/media/maps/saturn.webp` | saturn | artist-concept | NASA/JPL-Caltech. The page gives no credit line; it says "From the database of JPL/Caltech generated planetary maps". | NASA media usage guidelines: generally not subject to copyright in the US, NASA acknowledged as the source. No copyright notice on the page. | https://science.nasa.gov/3d-resources/saturn/ | 2026-10-04 | Saturn.jpg converted to WebP. The page calls this texture "Fictional": it is not made from spacecraft images. |
| `public/media/maps/uranus.webp` | uranus | artist-concept | NASA Visualization Technology Applications and Development (VTAD) | NASA media usage guidelines: generally not subject to copyright in the US, NASA acknowledged as the source. No copyright notice on the page. | https://science.nasa.gov/resource/uranus-3d-model/ | 2026-10-04 | Texture taken out of the glTF model offered on the page and converted to WebP. The page does not say how the texture was made, so it is treated as an artist's rendering. |
| `public/media/maps/neptune.webp` | neptune | artist-concept | Don Davis & JPL/Caltech | NASA media usage guidelines: generally not subject to copyright in the US, NASA acknowledged as the source. No copyright notice on the page. | https://science.nasa.gov/3d-resources/neptune/ | 2026-10-04 | Neptune.jpg converted to WebP. The page says: "Fictional. Texture created by Don Davis with cloud features." |

The Sun has no map: it has no fixed surface, and the trusted sites offer pictures of its disc but no map to wrap on a globe.

Kind is one of `photo`, `composite`, `false-colour`, `artist-concept`, `simulation`, `diagram`.

## Data

Astronomical values carry their own source and retrieval date in each catalogue record
(`src/data/`). Datasets used as a whole are listed here.

| Dataset | Used for | Credit | Licence | Source | Retrieved |
|---|---|---|---|---|---|
| Orbits of the first 1500 numbered main-belt asteroids (`src/data/belts/asteroidBeltOrbits.ts`) | The dots of the asteroid belt | NASA/JPL Small-Body Database | NASA media usage guidelines: generally not subject to copyright in the US, NASA acknowledged as the source. | https://ssd.jpl.nasa.gov/tools/sbdb_query.html | 2026-10-04 |
| Orbits of 787 numbered trans-Neptunian objects within 50 AU (`src/data/belts/kuiperBeltOrbits.ts`) | The dots of the Kuiper Belt | NASA/JPL Small-Body Database | NASA media usage guidelines: generally not subject to copyright in the US, NASA acknowledged as the source. | https://ssd.jpl.nasa.gov/tools/sbdb_query.html | 2026-10-04 |

Both are rounded for drawing; the exact queries are in the records' sources.

## Fonts

Bundled with the app from the npm packages below and served from the app's own origin. Latin
subset only.

| Font | Used for | Copyright | Licence | Package | Upstream |
|---|---|---|---|---|---|
| Atkinson Hyperlegible (400, 700) | Body text | Copyright 2020 Braille Institute of America, Inc. | SIL Open Font License 1.1 — `public/licenses/atkinson-hyperlegible-OFL.txt` | `@fontsource/atkinson-hyperlegible` 5.3.0 | https://github.com/google/fonts |
| Lilita One (400) | Titles | Copyright (c) 2011 Juan Montoreano (juan@remolacha.biz), with Reserved Font Names "Lilita One" | SIL Open Font License 1.1 — `public/licenses/lilita-one-OFL.txt` | `@fontsource/lilita-one` 5.3.0 | https://github.com/google/fonts |

Copyright lines and licence texts are taken from each package's `LICENSE` and `metadata.json`.

## Software shipped in the app

| Library | Licence | Source |
|---|---|---|
| three.js 0.186.1 | MIT | https://github.com/mrdoob/three.js |

Build and test tools (Vite, TypeScript, Vitest, ESLint, Prettier) are not shipped; their licences
are in `package-lock.json`.
