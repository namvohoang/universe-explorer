# Universe Explorer — Engineering Plan

> Source of truth for architecture, phases and acceptance criteria.
> Read it fully before starting any task, and work one task at a time.
> Conventions live in `CLAUDE.md` and `.claude/rules/`.
> Task state: `[ ]` not started, `[~]` in progress, `[x]` done.

---

## 1. Product in one paragraph

Universe Explorer is a web app where kids aged 6 to 9 explore space in 3D. They tap an object to
fly there, see what it really looks like, read (or listen to) a short true explanation, and
compare how big and how far things are. It starts in the solar system and zooms out to the Milky
Way and beyond. It runs in a browser on a tablet, laptop or phone, with no account and no tracking.

## 2. Starting point: the prototype

A single-file prototype exists (`index.html`, three.js r160 bundled inline, built in a Claude chat
and published as a static Hugging Face Space). This repo rebuilds it in TypeScript.

| Prototype has | Keep | Change |
|---|---|---|
| Three scenes: Solar System, Milky Way, Black Hole | Yes | Add more object kinds (§5.1) |
| Tap a body or its name to fly there; info card with stats and "cool facts" | Yes | Every stat and fact re-checked against a source |
| Speed control, running clock, name labels on/off | Yes | Clock becomes a real date |
| "Read it to me" (browser voice, optional Kokoro natural voice) | Yes | Kokoro loads from third parties: see §8 |
| Planets as plain spheres with painted (procedural) textures | No | Real shapes and real mission imagery |
| Circular, flat orbits at hand-picked distances; random start angles | No | Real ellipses from JPL elements, real positions for the date |
| Hand-picked sizes ("squished") | No | Real sizes through named scale modes |
| Google Fonts loaded from Google | No | Fonts served by the app |

Nothing in the prototype's numbers or text is treated as verified.

## 3. Non-negotiable principles

1. **Real numbers only.** Every value comes from a cited primary source with a retrieval date.
2. **True ratios.** Data is in real units; display scaling goes through named scale modes; any
   view that is not true scale says so on screen.
3. **Real shapes.** Flattening, irregular bodies, rings, tilt and spin direction are drawn from data.
4. **Real images.** Only from trusted agencies, credited in `CREDITS.md`; artist's concepts,
   simulations and false-colour images are labelled for the kid.
5. **True, then simple.** A kid-friendly sentence must still be correct. Unknown is said as unknown.
6. **Kids first.** No ads, analytics, accounts or personal data; calm tone; accessible.

## 4. Stack

| Concern | Choice |
|---|---|
| Language | TypeScript, strict |
| Build | Vite, static output (no server) |
| 3D | three.js, used directly (no UI framework) |
| UI | Plain DOM and CSS over the canvas, as in the prototype |
| Tests | Vitest |
| Lint / format | ESLint, Prettier |
| Read aloud | Web Speech API; natural voice is an open decision (§8) |
| Hosting | GitHub Pages, deployed by `.github/workflows/pages.yml` on every push to `main` |

Pin versions when scaffolding, after checking current docs (context7). `package.json` scripts:
`typecheck`, `lint`, `test`, `validate`, `build`, `dev`.

### Layout

```
universe-explorer/
├── PLAN.md  CLAUDE.md  CREDITS.md
├── src/
│   ├── data/      # catalogue: types, one file per object, concept texts' data
│   ├── sim/       # kepler.ts, time.ts, frames.ts, scale.ts (pure, tested)
│   ├── scene/     # three.js: bodies, rings, orbit paths, camera, lighting
│   ├── ui/        # cards, controls, labels, strings, read-aloud
│   └── main.ts
├── public/media/  # images, textures, shape models
├── tools/         # validate script, media preparation
└── docs/prototype/  # the original single-file prototype, for reference
```

Dependencies go one way: `ui` → `scene` → `sim` → `data`.

## 5. Design

### 5.1 Object model

`CelestialObject` is a discriminated union on `kind`:
`star`, `planet`, `dwarf-planet`, `moon`, `asteroid`, `comet`, `ring-system`, `belt`,
`exoplanet`, `nebula`, `star-cluster`, `galaxy`, `black-hole`.

Every object has: `id`, `kind`, `name`, `parentId`, `shape`, `orbit` (or `null`), `media`,
`sources`, and kid text keys. Every kind has one **concept** entry ("What is a moon?") shared by
all objects of that kind.

### 5.2 Shape

| Shape type | Used for | Data |
|---|---|---|
| `spheroid` | Stars, planets, round moons | Equatorial and polar radius |
| `triaxial` | Irregular bodies with no model | Three axis lengths |
| `model` | Irregular bodies with a published shape model | Model file + its credit |
| `ring` | Ring systems | Inner and outer radius, in the parent's equatorial plane |
| `belt` | Asteroid belt, Kuiper belt | Inner and outer radius around the star; no surface |
| `extended` | Nebulae, clusters, galaxies | Real extent and structure type; no hard surface |
| `horizon` | Black holes | Event-horizon radius derived from mass |

Orientation is part of shape: axial tilt, pole direction, rotation period, retrograde flag.

### 5.3 Orbits and time

- Elements per object: semi-major axis, eccentricity, inclination, longitude of ascending node,
  argument or longitude of perihelion, mean anomaly or mean longitude at epoch, their rates when
  the source gives them, plus epoch and reference frame.
- Planets: JPL approximate elements. Moons: JPL satellite mean elements, relative to the planet.
  Small bodies: JPL Small-Body Database.
- Position: elements at date → Kepler's equation (iterate to a named tolerance) → position in the
  orbit plane → rotate to the ecliptic frame → scene coordinates.
- Simulation time is a real date. Controls: pause, speeds, "today". The date is limited to the
  validity span the source states for its elements.
- One time scale drives every body, so periods and speeds keep their true ratios.

### 5.4 Scale modes (`src/sim/scale.ts`)

| Mode | Sizes | Distances | On-screen label |
|---|---|---|---|
| `true` | One factor | Same factor | "Real sizes and real distances" |
| `true-sizes` | One factor for all bodies | Compressed, order and directions kept | "Planets are the right size next to each other. They are really much farther apart." |
| `easy` | Compressed, order kept | Compressed, order kept | "Drawn bigger and closer so you can see everything." |

In `true` mode planets are too small to see from far away; the camera, labels and markers handle
that, not a hidden multiplier. Compression functions are monotonic, named and tested. They act
on each position's distance from its parent, so directions stay true and nothing lands inside its
parent; a stretched orbit looks rounder than it is in the two compressing modes. The
default mode is an open decision (§8).

Two extra views give the true ratios directly:
- **Size line-up**: chosen bodies side by side at true relative size.
- **Distance line**: the planets on a line at true relative distance.

### 5.5 Media

Each object lists its media with `kind` (`photo`, `composite`, `false-colour`, `artist-concept`,
`simulation`, `diagram`), alt text and a `CREDITS.md` row. Surface maps wrapped on 3D bodies come
from mission data (candidate sources: NASA Scientific Visualization Studio, USGS Astrogeology,
JPL). Where no real global map exists, the body is shown with what does exist and the card says
what is and is not real.

### 5.6 Kid-facing text

Per object: a one-line hello, up to four stats, up to three facts, and the concept text for its
kind. All strings live in `src/ui/strings/`. Numbers in text are produced from the catalogue at
display time (rounding, units, comparisons such as "N Earths wide"), never typed by hand.

## 6. Phases and tasks

### Phase 0 — Foundations

- [x] 0.1 Copy the prototype into `docs/prototype/` and list its features and texts as a checklist.
- [x] 0.2 Scaffold Vite + TypeScript strict + three.js + Vitest + ESLint/Prettier with the scripts in §4.
- [x] 0.3 CI: typecheck, lint, test, validate, build on every push.
- [x] 0.4 `CREDITS.md` with the table from `.claude/rules/media.md`; self-host the two fonts and credit them.
- [x] 0.5 `tools/validate`: every media file credited in `CREDITS.md` with a complete row from a trusted source.

**Acceptance:** an empty scene builds and deploys as a static site; the quality gate runs green;
the app requests nothing from a third party.

### Phase 1 — Data and simulation core (no rendering)

- [x] 1.1 Types for §5.1–5.3 (`CelestialObject`, shapes, orbital elements, sources).
- [x] 1.2 Catalogue records for the Sun, the eight planets and the Moon, each value sourced. `validate` gains
      the catalogue checks: schema, and a source with retrieval date on every record.
- [x] 1.3 `kepler.ts`: Kepler solver and elements → position, with unit tests.
- [x] 1.4 `time.ts`: dates, Julian date, centuries since epoch, speed control, validity limits.
- [x] 1.5 `frames.ts`: orbit plane → ecliptic → scene axes; pole orientation for tilt.
- [x] 1.6 Position tests against JPL Horizons at several dates per body, with a named tolerance.
- [x] 1.7 `scale.ts`: the three modes of §5.4 with ratio and monotonicity tests.

**Acceptance:** planet positions match Horizons within the documented tolerance across the
supported date range; in `true` mode every size and distance ratio equals the catalogue ratio;
`src/sim/` imports nothing from three.js or the DOM.

### Phase 2 — The solar system, done right

- [x] 2.1 Scene shell: renderer, camera, orbit controls, fly-to, resize, reduced-motion handling.
- [x] 2.2 Bodies as spheroids with real flattening, tilt, pole direction and spin (including retrograde).
- [x] 2.3 Surface maps for the planets and Moon from trusted sites, each credited, with honest kinds (Saturn,
      Uranus and Neptune have only artist's textures). The Sun stays unmapped: no globe map of it exists there.
- [x] 2.4 Saturn's rings (and the fainter ring systems) at real radii; ring shadow and planet shadow.
- [x] 2.5 Orbit paths drawn from the same elements that move the bodies.
- [x] 2.6 Lighting from the Sun: day and night sides, Moon phases.
- [x] 2.7 Scale-mode switch with the on-screen label; markers so tiny bodies can be found in `true` mode.
- [x] 2.8 Date clock with pause, speeds and "today".
- [x] 2.9 Info card, name labels and chips, ported from the prototype. Scene tabs wait for Phase 4, when
      there is a second scene to switch to.
- [x] 2.10 Card content for the ten bodies: every prototype stat and fact re-sourced or removed; numbers generated from the catalogue.
- [x] 2.11 Read aloud with the browser voice.

**Acceptance:** everything the prototype's Solar System scene does, now with real shapes, real
maps, real orbits and a real date; a body always sits on its drawn path; `/data-check all` and
`/credits-check` report no critical findings.

### Phase 3 — The rest of the solar system

- [x] 3.1 Major moons of Mars, Jupiter, Saturn, Uranus and Neptune, with orbits relative to their planet.
- [x] 3.2 Irregular bodies drawn from shape models or triaxial dimensions (never as spheres).
- [x] 3.3 Dwarf planets: Ceres, Pluto, Makemake and Eris. Haumea waits for a trusted source of its three
      axes: NASA's page gives one diameter and calls it football-shaped, so it cannot be drawn truthfully yet.
- [x] 3.4 Asteroids and the asteroid belt and Kuiper belt as real distributions, not decorative rings.
- [x] 3.5 Comets: eccentric orbits, a tail that points away from the Sun and grows near it.
- [x] 3.6 Concept cards for each new kind.
- [x] 3.7 Size line-up and Distance line views (§5.4).

**Acceptance:** each object kind in the solar system has at least one object and a concept card;
the two comparison views use catalogue ratios only.

### Phase 4 — Beyond the solar system

Things beyond the solar system are shown in a Deep Space view as real, credited pictures with a
card, not as 3D models: no trusted source gives data to build them from, and a picture labelled
for what it is (photo, joined pictures, colours added, artist's drawing) is the honest way.

- [x] 4.1 Zoom-out ladder: the Deep Space view lists its objects nearest first, and each card states how
      far away it is and how long ago its light set out.
- [x] 4.2 The Milky Way, with the Sun marked, as NASA's illustration labelled as an artist's drawing,
      since no photo from outside exists.
- [x] 4.3 Black holes: the first Event Horizon Telescope image, of the black hole in M87, labelled as
      colours added by scientists.
- [x] 4.4 A star beyond the Sun (Proxima Centauri, the nearest) and a star cluster (the Pleiades).
      Stars of other kinds and sizes can be added the same way.
- [x] 4.5 Nebulae and galaxies with real telescope images, false colour explained.
- [x] 4.6 Exoplanets: the seven planets of TRAPPIST-1, with NASA's artist's concept labelled as one.

**Acceptance:** every `kind` in §5.1 has a concept card and at least one object; every non-photo
image carries its label. (Met, except that ring systems have objects but no card or concept of
their own: they are drawn with their planet.)

### Phase 5 — Kid experience and release

- [x] 5.1 Natural voice: every card is recorded beforehand with Kokoro's `af_heart` voice and the
      recordings ship with the app (task 6.4). A voice stored on the device is the fallback.
- [ ] 5.2 Photo gallery per object. (Each object's one picture or map is credited on the grown-ups' page.)
- [~] 5.3 Accessibility pass: keyboard order, labels, reduced motion and touch targets are in place; it has
      not yet been tried with a screen reader.
- [ ] 5.4 Reading-level review of every string with the target age in mind, by a person. (A test caps
      sentence length.)
- [ ] 5.5 Performance pass on a mid-range tablet: texture sizes, lazy loading per scene.
- [x] 5.6 Works offline after first load.
- [~] 5.7 Release: the grown-ups' page (privacy, accuracy, picture credits, sources) is done. A deploy
      script waits for the hosting decision in §8.

**Acceptance:** smooth on a mid-range tablet; usable with keyboard only and with a screen reader;
no third-party request at runtime; credits page complete.

### Phase 6 — Feedback from the first look (2026-10-04)

The owner's notes after trying the app, each turned into a task.

- [x] 6.1 Host on GitHub: GitHub Pages, deployed from `main`.
- [x] 6.2 Easier zoom and an obvious way back: on-screen zoom buttons and a Back button that is always there.
- [x] 6.3 The Sun and Halley's Comet should look like the real things in 3D, not a plain ball and a cone.
- [x] 6.4 A natural reading voice in place of the robotic device voice, with nothing sent to a server.
- [x] 6.5 3D objects for the things in Deep Space (black hole, galaxies, nebulae, the Pleiades, other
      stars and their planets, giant stars), each labelled for what it is: built from data, or a model.

### Phase 7 — More to explore (asked for on 2026-10-04)

The owner asked for more objects, and for the things people have put in orbit round Earth.

- [x] 7.1 More galaxies of different shapes, each from its NASA Hubble page with its real picture.
- [x] 7.2 More giant stars beside the Sun, each with a NASA source for its size.
- [x] 7.3 Space rocks: more asteroids with real orbits and shapes, and what a meteor and a meteorite are.
- [x] 7.4 The International Space Station and other satellites round Earth: a new `spacecraft` kind,
      real orbit heights and periods, real 3D models where NASA publishes one.
- [x] 7.5 Star patterns in 3D (Orion, the Big Dipper, Cassiopeia, the Southern Cross): a new `constellation`
      kind, each star placed from its ESA Hipparcos position and distance, first seen from the Sun
      and then turned to show how far apart the stars really are.
- [x] 7.6 More spacecraft: Juno at Jupiter, the Mars Reconnaissance Orbiter, and the Earth
      satellites Swift and Chandra, each with its Horizons orbit and NASA's 3D model. Left out for
      now: Parker Solar Probe (no published size), Europa Clipper (model too heavy), Terra (NASA's
      model file is broken), Voyager and New Horizons (escape paths, which the orbit code cannot draw).
- [x] 7.7 A Spaceships tab for craft shown as 3D models to turn round, with no made-up path:
      Gemini, the Saturn V rocket, the Apollo 11 command module Columbia, the Apollo Lunar Module,
      Pioneer 10, Voyager, the Space Shuttle (orbiter, tank and boosters), the shuttle Discovery,
      Cassini, New Horizons and the Curiosity rover. Columbia and Discovery are the Smithsonian's
      3D scans of the real craft. Each shows the year it was first used, and its size where a
      source gives one. Left out: Galileo (NASA's model is in made-up colours) and Mir (no
      source found yet for its facts).
- [x] 7.8 More black holes: Sagittarius A* at the centre of our galaxy (the real EHT image, from
      ESO) and Gaia BH1, the closest known (from ESA). A black hole that gives off no light is
      drawn dark, with no glowing disc.

**Acceptance:** every new object has a cited source for each number, a credited picture or model,
a card with a recording, and passes the gate.

### Phase 8 — Works on every screen (review of 2026-10-04)

A review at 1440×900, 1024×768 (iPad landscape), 820×1180 (iPad portrait), 390×844 (phone) and
844×390 (phone landscape) found that the card sits at a fixed offset and covers the tabs or the
clock once the header wraps, that markers show through the see-through card, that the place row
is one long mixed list, that the device back button leaves the app, that there is no icon or web
manifest, and that the first open downloads everything (one 1 MB script, about 33 MB in all).

- [x] 8.1 Layout shell that cannot overlap. Measure the top bar and the tray with a
      `ResizeObserver` into `--top-h` and `--bottom-h`; place the card, the view controls and the
      picture from them, in `dvh`. The card is opaque (`--panel-solid`) and its actions sit in a
      footer outside the scrolling part. A Playwright check at the five sizes proves that the card
      meets neither the header nor the tray and that its buttons are on screen.
- [x] 8.2 One top bar: brand, main tabs (Solar System · Deep Space · Spaceships · Compare, each
      with an icon; Compare opens the compare view), then a "View" menu holding the scale mode and
      the Names switch, and an icon button for grown-ups. "Real sizes" becomes "True sizes", and
      each mode gets a one-line explanation. The not-to-scale sentence stays on screen. One line
      from 1024 px wide up.
- [x] 8.3 Grouped place row: a pure, tested function maps each place to a group by kind. Solar
      System: Planets (with the Sun), Dwarf planets, Space rocks. Deep Space: Stars, Star pictures,
      Galaxies, Space wonders. Spaceships has no groups. Moons and spacecraft show only at the body
      they go round (Parker Solar Probe at the Sun). Chips carry a colour dot, the row follows the
      place picked in 3D, and "Whole view" becomes a fit button under + and −. Ring systems are
      not places.
- [x] 8.4 Compact bottom dock: a play/pause icon button, the date and its rate; speeds as a
      segmented control from 1280 px wide and a menu below that; Today stays. Two rows at most.
- [x] 8.5 Phone layout (700 px wide or less): brand and a menu button; a date pill and a scale
      pill; a bottom tab bar; the card as a bottom sheet that peeks and opens; a settings sheet
      that traps focus. At 390×844 the 3D view keeps at least 45% of the screen with the sheet peeking.
- [x] 8.6 Phone landscape (500 px high or less): the card is a side panel, the controls one
      column on the right, the place row one line.
- [x] 8.7 The URL follows the place: the focus id in the hash (`#saturn`) with `pushState`, read
      on load and on `popstate`, so the device back button goes up one level. The scale mode stays
      in `?scale=` and old `?go=` links keep working. Unknown ids fall back to the whole view.
- [x] 8.8 First visit and tapping: a pulsing ring on Earth and a "Tap a planet to fly there" hint,
      gone at the first touch and still under reduced motion; every 3D marker has a 44×44 px tap
      area. The flag lives in the browser, and the privacy text says so.
- [x] 8.9 Card reading help: Next and Previous step through the group; two facts first with a
      "More facts" button; the sentence being read is highlighted, from timings written when the
      recordings are made (all cards are recorded again for this).
- [x] 8.10 Space passport: the places opened are remembered in the browser only, counted on each
      group tab and marked on chips, with a "Clear progress" button for grown-ups.
- [x] 8.11 Install and icons: favicon, apple-touch-icon, web manifest and theme colour, the icons
      made here or from a credited NASA picture.
- [x] 8.12 Lighter first load: Deep Space, Spaceships and Compare load on demand so no chunk
      passes 500 kB; the service worker stores the shell and the first view at once and the rest
      when used or afterwards in the background; the render loop stops when the page is hidden and
      the pixel ratio drops when frames run slow (it is already capped at 2).
- [x] 8.13 Vietnamese, as text only (the owner's choice on 2026-10-05: no reading aloud in
      Vietnamese): `vi.ts` with every key of `en.ts`, a language choice in the settings that is
      remembered in the browser, fonts with Vietnamese letters (Baloo 2 and Be Vietnam Pro), and
      numbers and dates written the Vietnamese way. "Read it to me" is hidden in Vietnamese. Tests
      hold the translation to the English: same keys, same blanks, same numbers. The owner still
      has to read the Vietnamese through.

**Acceptance:** at all five sizes nothing overlaps and every control is reachable, with 44 px
targets. Keyboard order is top bar, card, controls, place row. The gate passes and no third-party
origin is requested. No astronomical data changes.

### Phase 9 — More of everything (asked for on 2026-10-06)

The owner asked for stars of every colour, more star pictures to compare with what a telescope
shows, more galaxies and space wonders, and spaceships from other countries and companies.

- [x] 9.1 Stars of every colour: blue Rigel, blue-white Sirius and Vega, the white dwarf Sirius B
      (smaller than Earth), Sun-like 51 Pegasi, and the orange giants Pollux and Aldebaran, each
      at true size beside the Sun and tinted from its measured temperature or colour. A far star
      with no picture on a trusted site (Rigel, Pollux, Aldebaran) is shown by its model alone.
- [x] 9.2 More star pictures: Scorpius, Leo, Cygnus (the Northern Cross), Gemini and the Little
      Dipper, each star from Hipparcos and each seen first as it looks in the sky; and two star
      clusters to look for with binoculars, Omega Centauri and the Hercules Cluster, with their
      real pictures. Left out: Taurus (no NASA page found for its card) and the Beehive Cluster
      (NASA's Hubble pictures show only its edge).
- [x] 9.3 More galaxies and space wonders, each from its NASA Hubble page with its real picture:
      Bode's Galaxy, the Cigar Galaxy, Centaurus A and the colliding Antennae; the Eagle Nebula
      (the Pillars of Creation), the Ring, Helix, Carina and Veil nebulae. A galaxy that is not
      a spiral is no longer laid flat and turned like a disc. Left out: the Pinwheel Galaxy
      (its picture carries a credit to a third party).
- [x] 9.4 Spaceships from other countries, as far as a trusted source publishes a 3D model that
      may be reused: Russia's Mir space station, the Soviet Soyuz joined to an American Apollo
      (Apollo–Soyuz), Europe's comet chaser Rosetta, and the Webb telescope that NASA built with
      Europe and Canada, all as NASA's own models. Left out: SpaceX and China. No site on the
      trusted list publishes a model of their craft (ESA's Sci Fleet models may not be copied),
      so they wait for the decision in §8.
- [x] 9.5 Three more by name (asked for on 2026-10-06): Mira (Omicron Ceti), a red giant whose
      light keeps changing; the Cat's Eye Nebula (NGC 6543); and the Cartwheel Galaxy
      (ESO 350-40), which adds `ring` to the structures a galaxy can have. Mira's
      temperature comes from a NASA Space Place poster.
- [x] 9.6 Everything in Deep Space has a 3D model (asked for on 2026-10-06): Mira at its size
      beside the Sun, and Omega Centauri and the Hercules Cluster as clouds of points made from
      their real pictures, since stars that far away cannot be placed one by one. The card
      says the depth of such a cloud is a guess.
- [~] 9.7 Better surfaces (asked for on 2026-10-06). Done: Titan's ground from NASA's global
      Cassini map, taken in infrared light through the haze, and the card says so; Deimos as
      NASA's 3D model with its real shape; Makemake and Eris with the surfaces of NASA's 3D
      models, labelled as drawings since nobody has seen them up close. Not done: Ida and
      Psyche stay plain. No site on the trusted list has a map or shape model of Ida, and no
      spacecraft has reached Psyche yet. NASA's Planetary Data System (Small Bodies Node) is
      where shape models of asteroids are kept, but it is not on the list and has not been
      looked at: the owner's decision.
- [x] 9.8 A more real Halley's Comet (asked for on 2026-10-06): the two hard cones are now soft
      clouds of points, a thin straight bluish gas tail in streamers and a wide cream dust tail
      that curves back along the comet's path and fans out; the nucleus is as dark as NASA says
      it is. Directions are real; sizes and brightness are still a drawing, as the card says.
      From NASA's 1P/Halley page: the real close-up by the Giotto spacecraft sits in the corner
      (ESA Standard Licence: educational use, with credit), jets burst from the sunlit side
      as in that picture, the nucleus turns once in 2.2 days, and the card's facts are Halley's
      own (back in 2061, among the darkest things known, photographed by Giotto). A body of
      the solar system may now show a real picture beside its 3D model. The nucleus is no
      longer a smooth egg: it is long with a narrow waist, as ESA says Giotto found it
      ("peanut-shaped"), with three jets; its small lumps are a drawing, and the card says so,
      since no trusted site publishes a model of its shape. While time runs, the gas, dust and
      jets stream outwards (still under reduced motion and when time is stopped), the jets
      glow white, and close to the nucleus the glow and tails thin out so the dark nucleus
      and its bright jets show as in Giotto's picture.
- [x] 9.9 Models stand still until asked (asked for on 2026-10-06): a model in Deep Space or
      Spaceships no longer turns by itself. A tap on it, or the new turn button under the zoom
      buttons, starts a slow turn; another stops it. A phone has no room for the button, so
      there the tap alone does it. The whole view of the solar system still turns gently.

**Acceptance:** as for Phase 7.

### Phase 10 — Checked against NASA's Universe pages (asked for on 2026-10-06)

The owner asked for the catalogue to be checked against https://science.nasa.gov/universe/ and
its pages on stars, galaxies, black holes, exoplanets, dark matter and dark energy, and for
everything found to be done. Nothing in the app contradicted those pages.

- [x] 10.1 What NASA's pages now say about things already here: the Milky Way's size (more than
      100,000 light-years) and how long the Sun takes to go round it (about 240 million years);
      Andromeda as a barred spiral, as NASA's page on galaxy types calls it; Proxima Centauri as
      a red dwarf; and, in "What is an exoplanet?", that more than 6,000 have been found. The
      Milky Way's card no longer says the picture is an artist's drawing in a fact of its own:
      the label on the picture still does.
- [x] 10.2 Galaxies of the kinds not shown yet, each with its real Hubble picture: the irregular
      dwarf NGC 5264, the lenticular NGC 4866 (`lenticular` is a new structure: a disc with no
      arms), the elliptical NGC 2865 and Markarian 231, the nearest quasar. NASA's page on
      galaxy types calls the lenticular "NGC 4886"; the ESA/Hubble page the picture comes from
      names it NGC 4866 in its data table, so that name is used.
- [x] 10.3 A neutron star, a kind of its own: the Vela pulsar, with its real X-ray picture from
      NASA's page on star types, a card and "What is a neutron star?". On cards already here:
      Proxima Centauri's planet Proxima b, the nearest known exoplanet, and the mass of M87's
      black hole (5.4 billion Suns), which the catalogue had as unknown. Left out: TON 618, the
      heaviest black hole found. The only picture of it on a NASA page is credited to the Sloan
      Digital Sky Survey, which is not on the trusted list (see §8). Proxima b has no card of
      its own: NASA's page for it shows a stock drawing of a super-Earth, not of this planet,
      and no radius is known to draw it from.
- [x] 10.4 The biggest ideas, on one card for the universe itself (a kind of its own, last in
      Space wonders): the big bang 13.8 billion years ago, the 5 parts in 100 that can be seen,
      dark matter and dark energy, and that scientists do not know yet what dark energy is.
      Its picture is NASA's map of the oldest light, from the WMAP spacecraft, labelled as
      colours added. It has no 3D model: the map shows the whole sky around us, not a thing
      that can be turned and looked at from outside.

- [x] 10.5 A Sun that shows what real pictures show (asked for on 2026-10-07, from NASA's
      gallery of the Sun): over NASA's model the app now draws a fine grain that churns while
      time runs, bright patches with loops of glowing gas, dark coronal holes, thin dark
      filaments, a brighter rim and an uneven glow. What these things are is real; where they
      sit is made up, since the Sun's face changes every day, and the model stays labelled as a
      drawing. NASA's real ultraviolet picture, with a coronal hole across the top, sits in the
      corner, and the card says what the dark patch is.
      The gas over the bright patches (prominences) is drawn as soft glowing clouds of
      specks, in arches and plumes, yellow at the feet and redder at the top, and streams
      along them while time runs; the first try, thin wire rings, did not look real.
      One patch has a solar tornado (asked for on 2026-10-07): a funnel of gas whose bands
      wind round it and seem to turn while time runs. NASA's page "Tornadoes On The Sun?"
      (https://svs.gsfc.nasa.gov/11691/) says scientists do not agree whether such gas truly
      turns or only looks as if it does; the card does not mention it yet, since a card has
      three facts.

**Acceptance:** as for Phase 7.

### Phase 11 — From NASA's 3D resources (asked for on 2026-10-07)

The owner asked for NASA's 3D resources (https://science.nasa.gov/3d-resources/, 375 entries on
2026-10-07) to be reviewed and for objects to be added or polished from them. Most entries are
Earth satellites, tools, spacesuits, landing sites and buildings, which are not places in this
app. What fits: shape models of small worlds, spacecraft that explored the solar system, and 3D
models of a few nebulae. NASA's own pages for single models (science.nasa.gov/resource/…-3d-model/)
often hold a better file of the same thing, with its surface, and are used where they do.

- [x] 11.1 Real shapes for three worlds already here: Phobos, Eros and Vesta are NASA's 3D models
      in place of smooth three-axis balls with a map wrapped on, as Deimos already was. Each
      model is turned by whole quarter turns so its longest side and its pole lie the way the
      app draws bodies; nothing is reshaped. Their old maps are gone with their credit rows.
- [x] 11.2 The asteroid Bennu, with NASA's shape model, its orbit and size from JPL's Small-Body
      Database and a card from NASA's page, and OSIRIS-REx, the spacecraft that brought bits of
      it to Earth, as NASA's model in Spaceships. Bennu passes close to Earth every few years
      and each pass bends its path, so its one ellipse is right to within about 4 degrees from
      2005 to 2049 and far out before 2000; the test against JPL Horizons starts in 2005 and
      says why. Left out: Haumea. NASA has a 3D model of it, but neither NASA's page nor JPL's
      database gives its three axes, so its size could only be guessed from the model.
- [x] 11.3 Two more spacecraft from the list, as NASA's models in Spaceships: the Perseverance
      rover and its helicopter Ingenuity, each with a card, a recording and Vietnamese text.
      Left out: Saturn's spongy moon Hyperion. NASA has its shape model, but Hyperion tumbles,
      and a body here can only turn forwards, backwards or keep one face to its planet; it
      waits for a fourth way of turning.
- [ ] 11.4 The Crab Nebula's 3D model. Looked at, not done: NASA's model is of the inside of the
      nebula as X-rays show it (the pulsar, a ringed disc and two jets), not of the whole cloud
      in the Hubble picture, so it cannot stand in for the cloud. It would need a way to show a
      second model beside the first, and a word for the kid about what each one is.

- [x] 11.5 Six more spacecraft from the list (asked for on 2026-10-07), as NASA's models in
      Spaceships, each with a card, a recording and Vietnamese text: Dawn, the Kepler and
      Spitzer space telescopes, the Viking lander, John Glenn's Friendship 7 capsule and Europa
      Clipper (its 35 MB model is cut down to 3.3 MB). Left out: Galileo, whose only ready
      model is coloured purple and orange and would teach a wrong picture of it; the Roman
      telescope, since NASA's page lists a launch date but still speaks of it in the future;
      Explorer 1 and the Space Launch System, which the list offers only in other file formats.
- [x] 11.6 One more small world from the list: Kleopatra, an asteroid shaped like a dog's bone,
      with its shape from NASA's file for 3D printers (plain grey, since the file has no
      surface) and its size and orbit from JPL. Left out: Itokawa, whose print file is not the
      asteroid's shape as it stands (it is flat, about a quarter as thick as JPL's sizes say);
      Toutatis, which tumbles and has no pole in JPL's database; and Arrokoth, which is
      neither an asteroid nor a dwarf planet and needs a kind of its own.
- [x] 11.8 A better space shuttle (asked for on 2026-10-07, from NASA's Space Shuttle Parts): the
      plain tank and boosters, which had been tinted by hand, are replaced by NASA's own
      textured external tank and solid rocket booster. They are in the same units as the
      orbiter, so they keep NASA's sizes against it; each is turned so its struts face its
      neighbour. Where exactly they join is a careful fit, not a NASA drawing, and the credits
      say so. The Canadarm, the shuttle's robot arm, is a place of its own in Spaceships
      (the owner said to add it): its model is the arm folded out straight, its facts come from
      the Canadian Space Agency, and its credit row says the model's source is a company
      (DigitalSpace Corporation), not NASA, with no licence stated.
- [x] 11.9 Star faces that are not flat (asked for on 2026-10-07): in Deep Space every star's
      face is now grained and slowly churns, as a ball of hot gas does, and the grain suits the
      star's own measurements: fine on a star the size of the Sun, growing with the star into
      the few huge patches of a giant, stronger on a cool star than a hot one, and a little
      redder in the darker parts. Where the patches sit is made up, and the note on the card
      says the grain is a drawing. Only the giants had patches before.
      The Sun that stands beside each star for size is now the same Sun as in the Solar System
      view, NASA's model with its details (the owner asked: kids would ask why the Sun had two
      colours). So the Sun is yellow-orange while every other star is the colour its
      temperature gives it, and it can look more orange than a cooler star such as Pollux; the
      note on the card says the Sun is NASA's drawing and the others are coloured by heat.
- [x] 11.10 Stars sorted by colour (asked for on 2026-10-07): the Stars row lists them red,
      orange, yellow, white, blue-white, coolest first, with a small label where each colour
      starts and a dot of that colour on every star; within a colour the nearest comes first.
      A star's colour name comes from its temperature in the catalogue, the same one its drawn
      colour comes from. NASA says only that colour follows temperature (red stars about
      3,000 K, the "yellow" Sun about 6,000 K, hotter stars white or blue), so where one name
      ends and the next begins is a choice made for sorting, and the code says so. No star
      here falls under white yet. The white dwarf Sirius B and the Vela pulsar stand last,
      under "what is left of a star". The other Deep Space rows are still nearest first.
- [ ] 11.7 Exploded stars with NASA 3D models (Cassiopeia A, Tycho, SN 1987A): they need the
      Deep Space view to show a ready-made model for a nebula.

**Acceptance:** as for Phase 7.

### Phase 12 — Watch: sky events and space flights (asked for on 2026-10-07)

The owner asked for a new screen that plays things happening: sky events (eclipses, the Moon's
phases, aurora, a meteor shower, a supermoon) and famous flights (a rocket launch, a flight to
the Moon, a landing, a shuttle joining the space station). Each is a **story**: a live 3D scene
on a real clock, cut into chapters with one or two sentences each, with play, pause, a
scrubber, and the camera free to turn and zoom.

A story's movement is one of three kinds, and the screen says which:

| Path | Meaning | What the kid is told |
|---|---|---|
| `orbits` | Worked out from the catalogue's own orbits | Only the scale label |
| `tracked` | Positions sampled from JPL Horizons | "This is the real path the spaceship flew." |
| `staged` | Real event times from the agency; the movement between them is drawn | "The times are real. The path is a drawing." |

Found on 2026-10-07: JPL Horizons holds tracked paths for Artemis I (-1023) and Artemis II
(-1024), and for Apollo 11 only its dropped S-IVB stage (-399110, from 1969-07-17 16:40); it
holds nothing for a space shuttle. So Apollo 11 and the shuttle can only be `staged`.

Decided on 2026-10-07 (the owner said to continue with what was recommended): staged stories
are allowed with their label, which sets aside task 7.7's "no made-up path" for this screen
only; a model an agency offers only in another file format may be converted, with the change in
`CREDITS.md`; the tab is called Watch; sky events come first; captions are text first and
recorded last.

- [x] 12.1 Story types (`src/data/types/story.ts`), the pure story clock (`src/sim/story.ts`:
      the chapter at a date, progress, a named rate per chapter) and `validate` checks (every
      chapter time sourced and in order; a staged story says so).
- [ ] 12.2 The Watch shell: a fifth tab, loaded on demand; a story row in two groups (Sky
      events, Space flights); a caption card; Previous and Next chapter; play and pause; a
      scrubber with a mark per chapter; the date; the path label; the address follows the
      story; reduced motion stops auto-play and swooping; layout test at the five sizes.
- [ ] 12.3 The Moon's phases, and day, night and the seasons: Earth, Moon and Sun from the
      catalogue, in a `near-earth` scale mode where Earth, the Moon and the gap between them
      share one true factor.
- [ ] 12.4 `src/sim/shadow.ts` (the dark middle and the pale edge of a shadow) and the two
      eclipses, each on a real date from NASA's eclipse pages. First measure how far the
      catalogue's Moon is from JPL Horizons at those hours; if the shadow would miss, the Moon
      takes Horizons samples for those hours. No tolerance is widened.
- [ ] 12.5 A supermoon (the Moon's stretched orbit: a full Moon at its nearest beside one at its
      farthest, the ratio from the catalogue; the word is not an official one and the card says
      so), Halley's tail growing near the Sun, Mars going backwards in Earth's sky, and
      Saturn's rings seen edge-on.
- [ ] 12.6 A meteor shower: Earth crossing the dust a comet leaves along its path. Halley if
      NASA's pages name it as a shower's comet, since its orbit is here. First a test of how
      near the comet's orbit passes Earth's; the dust and the streaks are a drawing, labelled.
- [ ] 12.7 Aurora: particles from the Sun steered by Earth's magnetism to a ring round each
      pole, where the air glows. Nothing in the catalogue describes Earth's magnetism, so the
      lines and particles are a diagram, labelled; NASA photos from the space station, credited.
- [ ] 12.8 `tools/horizons` (state vectors in km and km/s into `src/data/paths/`),
      `src/sim/trajectory.ts` (Hermite interpolation, tested against held-out samples), and
      the craft drawn bigger than life with its own label.
- [ ] 12.9 Artemis I round the Moon, `tracked`, with an Orion model from a trusted source (or
      a labelled marker if none exists).
- [ ] 12.10 Artemis II: four astronauts round the Moon, `tracked`.
- [ ] 12.11 Staged flights: how a rocket reaches space (the Saturn V's stages, times from
      NASA's Apollo reports), Apollo 11's landing (with the S-IVB's real path as a side note),
      and a shuttle joining the space station, seen from the station.
- [ ] 12.12 Recordings for the captions, Vietnamese text, and a note on the grown-ups' page
      about what "real path" and "drawing" mean.

**Acceptance:** every story's times and numbers have a cited source; a craft or body always
sits on its drawn path; every staged or enlarged thing carries its label on screen; each story
works by keyboard and with reduced motion; the gate passes.

## 7. Testing

| Layer | Tests |
|---|---|
| `sim` | Kepler solver cases; Horizons position comparison; scale ratios and monotonicity |
| `data` | Schema; sources and retrieval dates present; sanity checks (polar ≤ equatorial radius, eccentricity range) |
| `scene` | Body on its orbit path; no numeric literal for size, distance or speed outside `scale.ts` |
| `ui` | Number formatting and comparisons from catalogue values; not-to-scale label per mode |
| App | No third-party origin requested; every image has alt text |

Tolerances are named constants with a comment saying why. They are never widened to pass a test.

## 8. Open decisions

1. **Natural voice.** Decided: wanted, since the device voice sounds robotic. See task 6.4.
2. **Default scale mode.** `easy` (like the prototype) or `true-sizes`.
3. **Languages.** Decided: English and Vietnamese. Vietnamese is text only. See task 8.13.
4. **Hosting.** Decided: GitHub Pages.
5. **Supported dates.** Limited by the planet elements chosen in 1.2; the longer-span JPL table
   trades accuracy for range.
6. **Models of SpaceX and Chinese craft.** None is published by a source on the trusted list
   (`.claude/rules/media.md`). Either the owner approves another source, with its licence, or
   these craft are shown with an agency's photo in place of a 3D model.
7. **A picture of TON 618.** The heaviest black hole found has one picture on a NASA page, credited
   to the Sloan Digital Sky Survey (sdss.org), which is not on the trusted list. Either the owner
   approves that source, with its licence, or TON 618 stays out.
8. **Paths that are drawn.** Decided on 2026-10-07: on the Watch screen a flight with no
   published path may be shown as a drawing between real event times, labelled as one. See Phase 12.
