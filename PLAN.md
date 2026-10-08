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
- [x] 12.2 The Watch shell: a fifth tab, loaded on demand; a row of stories (in two groups once
      there are flights); a caption with the date; Previous and Next part; play and pause; a
      scrubber with a notch per part; the address follows the story (`#watch/moon-phases`);
      reduced motion waits to be played; layout test at the five screen sizes. A story is played
      in the solar system view itself, on its own clock, with only its own bodies, paths and
      names drawn, and the view is drawn in the room above the panel. A part can hold the camera
      on a line between two bodies (the Moon as seen from Earth); "Look around" lets it loose
      over the whole stage. A story that has been watched
      is ticked off on its chip and counted on its group's tab, kept in this browser only and
      cleared with the rest of the progress.
- [x] 12.3 The Moon's phases, at the app's `true` scale (Earth, the Moon and the gap between
      them already share one factor there, so no new scale mode was needed). The four instants
      are the US Naval Observatory's, since NASA's pages give no table of phase times; a test
      holds the app's Moon to the named phase at each.
      Day, night and the seasons: Earth seen from the Sun on the four days of 2027 when a
      season begins (the Naval Observatory's instants), turning once each day. A part of a
      story can now stop and skip on to the next, so the months between are not raced through.
      A test holds the Sun over the equator at each equinox and over a tropic at each solstice.
      Which countries face the Sun at each hour is not real: the catalogue does not know which
      side of Earth faced where, and no turning was fetched for these four days.
- [x] 12.4 The two eclipses: the total solar eclipse of 2 August 2027 and the total lunar
      eclipse of 31 December 2028. `src/sim/shadow.ts` works out, from the real sizes and
      places, what share of the Sun's disc one body hides from a point, and the surface shader
      does the same sum at every point, so a shadow has its dark middle and its pale edge where
      they truly fall. The catalogue's Moon was not near enough (a degree or so out), so for
      these hours the Moon and Earth are where JPL Horizons has them, and for the solar eclipse
      Earth is turned the way it will face. The shadow is taken from where its caster was when
      the light passed it, 1.3 s earlier: leaving that out put the shadow 38 km off. With it,
      the middle of each eclipse falls within 2 s of the instant NASA lists, and the Moon's
      shadow within a quarter of a degree of NASA's table of its path; tests hold both. The
      lunar eclipse is two or three minutes shorter than NASA's, which draws Earth's shadow a
      little bigger for its air. How red the Moon glows in the shadow is a drawing choice.
- [x] 12.5 Halley's Comet growing its glow and tails as it rounds the Sun in 1986 (the
      camera backs away as the glow grows; a test holds "too cold to have a tail" to the days
      the app draws none), and Saturn's rings seen from Earth from 2017 to 2032, closing to a
      line and opening again. On the catalogue's own orbits and pole Earth crosses the plane of
      the rings on 23 March 2025, the very day NASA gives; a test holds it there.
      Done too: a supermoon. The farthest and the nearest full Moon of 2026 (31 May and
      24 December, by JPL Horizons' distances at the Naval Observatory's thirteen full-Moon
      times) are seen from Earth itself through one narrow field, like a telescope, so the
      nearer is drawn bigger by what it really is: 14 percent, the most NASA says a supermoon
      can be. The card says the word is a nickname.
      And Mars going backwards: Mars seen from Earth from November 2026 to June 2027, the
      camera on one patch of sky and Mars's track drawn across it, so the loop it makes while
      Earth overtakes it can be seen. On the catalogue's orbits Mars turns back on 10 January
      and forward again on 1 April 2027; a test holds the turning points and that Earth passes
      nearest between them. No stars are drawn behind the track: there is no star map for this
      view.
- [x] 12.6 A meteor shower: Earth passing through the dust of Halley's Comet in May and
      again in October 2027. On the catalogue's orbits Earth is nearest the comet's path on
      7 May (0.07 AU) and 26 October (0.15 AU), when NASA says the Eta Aquariids ("early May")
      and the Orionids ("mid-October") peak; a test holds each shower to its day. The dust is
      strewn round the comet's path out to 0.17 AU, a width NASA does not give, so the screen
      says "The dust is a drawing: real dust is tiny." Not shown: the streaks in the sky as
      seen from the ground.
- [x] 12.7 Aurora: a glowing green band round each of Earth's geomagnetic poles, seen from
      over the north and then the south on a winter's day. The poles' places and how far from
      them the bands lie are NOAA's (the World Magnetic Model for 2025.0; "between 15° and 25°
      from the geomagnetic poles"), the height of the green glow is NASA's, and Earth is turned
      the way it will face, so the northern band lies over Greenland and northern Canada. NOAA
      is not on the list of preferred sources; it is the agency that publishes the model.
      That the bands are evenly bright all the way round is a drawing, and the screen says so.
      Not done: the wind from the Sun and Earth's magnetism are told in words, not drawn, and
      no NASA photo from the space station is shown (a story has no place for a picture yet).
- [x] 12.8 `tools/horizons/fetchPath.ts` (position and velocity in km and km/s into
      `src/data/paths/`, thinned to the fewest samples that still draw every one left out to
      within 1 km, with some of those left out kept as a test fixture) and
      `src/sim/trajectory.ts` (the curve between samples, tested). A spacecraft is not drawn
      bigger than life after all: at true scale it is a point of light with a ring and its
      name, like any body too small to see, on a trail that lights up behind it.
- [x] 12.9 Artemis I round the Moon, `tracked`: Orion's 223 samples and, for this story, the
      Moon's own from Horizons too, since the catalogue's Moon is a degree or so out and Orion
      passes 130 km above the ground. Six parts, the two passes seen close up. The path starts
      two hours after launch and stops 40 minutes before splashdown, as Horizons does, so the
      launch and the landing are told in words, not shown. Not done: an Orion model (the craft
      is a named point), and the stories still wait for their recordings (12.12).
- [x] 12.10 Artemis II: four astronauts round the Moon, `tracked`, in five parts: one big loop
      round Earth, the engine burn that sends Orion to the Moon, the swing round the far side
      seen close up, the way home, and the landing. The times of the burn, the pass and the
      dropping of the service module are from Horizons' data sheet for the flight; a test
      holds the drawn pass to the sheet's distance and minute.
- [x] 12.11 Staged flights: the launch of Apollo 11. The ten places the Saturn V passes
      through, with their times, are rows of NASA's own table of the climb (SP-2000-4029);
      JPL Horizons turns each place on the ground into a place in space
      (`tools/horizons/fetchAscent.ts`), and the app draws a curve through them, so the screen
      says "The line between real places is a drawing." For this story Earth is turned the way
      it really faced, from Horizons, so the rocket leaves Florida: the catalogue knows how
      fast Earth spins but not which side faced where. One row of the table is left out as a
      misprint (a longitude west of the pad). The rocket is a named point, and the time is
      shown to the second.
      Done too: Apollo 11's landing, with two craft, the lander and Columbia. The places they
      pass over the Moon are from Table 7-II of NASA's Apollo 11 Mission Report (read by eye
      from the scanned page, whose text layer is garbled), with times, heights and speeds from
      SP-2000-4029 and the landing place from its summary. Between two known places a craft
      may go right round the Moon; how many times is the count that fits the table's speeds,
      and a test holds Columbia's to NASA's own count of its orbits. The path is drawn in the
      Moon's own turning frame, so the lander stays put on the ground for the 21 hours it
      stood there. The Moon keeps one face to Earth exactly; its slight rocking is not drawn.
      Done too: space shuttle Discovery joining the space station on its last flight (STS-133,
      26 February 2011). The station flies its real path from JPL Horizons, Earth is turned the
      way it faced, and the instant of docking is NASA's. No path of a shuttle has been found
      published anywhere, so Discovery is drawn on the station's own path, a closing gap behind
      it, and the screen says "Station: real path. Shuttle: a drawing." The launch two days
      earlier is told in words. (NASA's catalogue page gives the launch hour in the wrong time
      zone; NASA's mission page is used.)
- [x] 12.13 Phone and tablet views (the owner's phone screenshot, 2026-10-07): a held view is
      stood back to fit the room above the panel, not the whole screen, so the caption no
      longer covers what is shown; on a phone the panel sits on the tab bar (it had left room
      for a card that is not there), its words are smaller, and the two groups and the stories
      share one line; from 1000 px wide the words stand in a card at the left, as a place's
      card does, and the view is drawn in the room beside it; a ringed world is stood back from
      far enough to see its rings whole.
- [x] 12.14 The same on every screen (the owner's phone screenshots of a star and of the Sun,
      2026-10-07): in the Solar System, Deep Space and Spaceships too, what is looked at is
      drawn in the middle of the room the top bar, the bottom panels and a card at the side
      leave, not in the middle of the whole screen, and is stood back where that room is small;
      the camera is aimed after the card is shown, so it knows the room; a ringed planet is
      stood back until its rings fit across a narrow screen; on a phone the real picture is a
      small card under the title, its credit read when it is tapped big.
- [x] 12.15 Two looks side by side (asked for by the owner, 2026-10-07): a part with a look
      of its own shows it in one half of the room and the whole picture in the other, each
      framed and named; the eye button still lets the camera loose over the whole picture.
- [x] 12.16 A whole picture that can be read (the owner's reference: a book diagram of a
      lunar eclipse marked "not to scale"). For the Moon's phases, the seasons, the two
      eclipses and Saturn's rings the whole picture is a diagram in a scale of its own
      (`diagram` in `src/sim/scale.ts`, not one a viewer picks), labelled "not to scale" in
      its frame and under the title when it fills the room. Same bodies, true directions,
      true lighting and turning; an eclipse's umbra and penumbra are drawn flat behind the
      caster. The shadow on a body is worked out from real places at any drawing scale.
      Not given a diagram: the supermoon (squeezed distances would hide the very thing it
      shows), Mars going backwards (Earth and Mars would touch), the comet, the meteor
      shower and the aurora, which keep the true-scale picture.
- [x] 12.17 The solar eclipse seen from Earth (asked for by the owner, 2026-10-07: sky events
      are to be seen from Earth). A part of a story can stand on a body's ground at a place
      (`standOn`), turning with it. The eclipse is watched from where the middle of the shadow
      falls at its greatest (25.464° N, 33.108° E, worked out from the Horizons positions):
      the Sun is whole, then bitten, then hidden for about as long as NASA lists, then whole.
      The seasons are still seen from the Sun, and the comet and the aurora close up: there
      is no sky with a horizon to stand under yet.
- [x] 12.18 The owner's notes on every sky story (2026-10-07). The eye button is gone: both
      looks are always on show. The whole picture marks the viewer ("You") and draws their
      line of sight. The eclipses and the supermoon are drawn like the Moon's phases: orbit
      rings kept, shadows as thin outlined shapes. Mars: whole orbits at true scale with the
      line of sight run out to the sky, and the app's star patterns behind its track. The
      comet is watched from Earth against the same stars, beside a true-scale picture that
      keeps the Sun, Earth and the comet in view. The seasons name the season in each half of
      Earth (worked out from how the pole leans, with a warm or an icy label), and the months
      between the four days are swept through in three seconds, a whole turn of Earth at a
      time, in place of a jump. The aurora and the meteor shower show a real NASA photo from
      the ground as the look from Earth (credited in `CREDITS.md`; the meteor is a Perseid,
      and its caption says so, since NASA's library has no ground photo of Halley's showers).
      Saturn's rings play slower: 32 seconds a part in place of 14, since each part covers
      years (`chapterSeconds` on a story).
- [x] 12.19 The owner's second round of notes (2026-10-07). A look from a world draws only
      what is looked at: no paths, no other worlds (the Sun still lights it). Spring and
      autumn have their own moving labels. In an eclipse's diagram the Moon is moved sideways
      so it is as deep in the drawn shadow as it really is in the real one, and is seen to
      cross it. The comet's look closes in on its glow and tails. The aurora is seen in 3D
      from the ground under each band (`lookUpAt`), level with the horizon, with the polar
      close-up beside it. The meteor shower is seen in 3D from Earth: streaks fly out of the
      spot worked out from Earth's and the comet's velocities (tested against NASA: just
      north of Betelgeuse, 66 km/s), and only while Earth is inside the trail. Both keep
      their real photo as a corner inset that a tap makes big. Mars: the start of each part
      and the end are numbered spots in the sky, and numbered lines of sight that stay in
      the whole picture.
- [x] 12.20 More of the owner's notes (2026-10-07). A new part that is looked at the same way
      as the one before no longer re-aims the camera (it stuttered at every mark). Halley's
      Comet is held close in the look from Earth. The aurora photo says why it is red. The
      seasons' whole picture is seen from low at the side, square to the way Earth's axis
      leans: Earth goes round the Sun with its axis drawn as a line that keeps pointing the
      same way, towards the Sun in June and away from it in December.
      Between the seasons' four days Earth keeps turning: the dates drawn are whole days
      apart plus a little more each time, so it swings round the Sun and turns on smoothly,
      and the Sun's own turning is held for that story (it would stand still and then whirl).
      The aurora has a green photo too (NASA/Christopher Perry, Alaska), beside the red one.
      The shooting stars are more, and keep falling while the story is stopped.
      Known: Earth's pole in the catalogue is the one for 2000, so the app's equinoxes of
      2027 fall about nine hours late; the season names allow for it.
- [x] 12.21 The supermoon (owner's notes, 2026-10-08). The story cuts from the May night to
      the December one: the Moon is tracked for those two nights only, and run through the
      months between it was drawn on a curve it never flew. Its whole picture is drawn at a
      `moon-path` scale: the diagram, but with the Moon's distances all shrunk by one factor,
      so its path keeps its true shape with Earth off the middle, and the December Moon is
      drawn as much nearer as it really is (about an eighth).
      The look at the shooting stars from Earth draws no Earth: zoomed out, the eye stepped
      back out of the world it stood on and showed it.
      The aurora's move from the northern ring to the southern one: the look from the ground
      dips to dark and comes back at the new place (flown, the eye went through Earth), and
      the second look swings round to its new side of a thing in place of cutting to it.
      Saturn's rings play slower still: a minute a part, in place of 32 seconds.
- [x] 12.22 Mars goes backwards, like the drawing the owner pointed to (2026-10-08, a video
      of the Sun, the two paths and a line from Earth through Mars out to the sky). In the
      whole picture the line of sight runs on past Mars to a far sky drawn round the Sun,
      and its end leaves a track that grows as the story plays: on, back and on again. The
      look from Earth draws the same track as Mars moves, with none of the way ahead shown.
      The numbered spots and kept lines of 12.19 are gone. The far sky is a drawing (the
      story says so): 4.8 times as far out as the two paths, since on a nearer one Earth's
      own move forward carries the end of the line on and it never goes back; and drawn 22%
      bigger by the end, so the way back lies beside the way out.
- [~] 12.12 Done: Vietnamese text for every story; a section on the grown-ups' page saying
      what in a story is real and what is drawn, with the stories' sources; and "Read it to
      me" on each part of a story, in English, with the voice on the device. The recording
      tool now writes out the stories' lines as well (`tools/narrate/lines.ts`, under
      `story-<id>`), and a story plays its own part of a recording once one exists.
      Left: the recordings themselves. Kokoro is not installed on the machine this was built
      on, so `tools/narrate/kokoro_narrate.py` has still to be run for the fifteen stories.

**Acceptance:** every story's times and numbers have a cited source; a craft or body always
sits on its drawn path; every staged or enlarged thing carries its label on screen; each story
works by keyboard and with reduced motion; the gate passes.

### Phase 13 — Menus and layouts a child can read (UX/UI review of 2026-10-08)

A review of the menus, the workflows and the five screen sizes, written up as the "UX/UI Fix
Spec" of 2026-10-08. Every control has a visible word, the settings are in one fixed place, and
the controls leave the view its room. Tasks keep the spec's names and its order of priority.

- [x] 13.1 **M2 — Every main tab has its word, at every width.** Beside the title where they
      fit; a bar along the bottom on an upright phone; a rail down the left on a phone on its
      side, which costs the view no height. No word is hidden by width or scrolled out of
      its row.
- [x] 13.2 **M3 — Every group of places has its word.** The switch is never squeezed: the
      chips are what scrolls. Where the line is short a group is its picture over its word.
- [x] 13.3 **M1 — One Settings button in a fixed place.** Last in the top right corner in
      every scene, with its word wider than a phone. The grown-ups page is a row in the
      settings. The pill that names the view opens the same settings at the choice of scale,
      and the sentence saying what is to scale stays on screen beside the title.
- [ ] 13.4 **W1 — The overview shows only the Sun and the planets**, with a "Which one?"
      picker where a tap lands on more than one.
- [ ] 13.5 **W4 — Compare is its own mode**, with the card, the tray and the clock put away.
- [ ] 13.6 **P1 — Slimmer bars on a phone**: 200 px or less at the bottom with no card open.
- [ ] 13.7 **T1 — An upright tablet uses the phone's layout**, and Fit frames the free room.
- [ ] 13.8 **M4 — One Back button that says where it goes.**
- [ ] 13.9 **M5 — A row of chips shows that it scrolls.**
- [ ] 13.10 **W3 — The same time control on every screen.**
- [ ] 13.11 **W2 — A card of three heights on a phone.**
- [ ] 13.12 **W5 — "Clear progress" is protected**, and can be undone.
- [ ] 13.13 **P2 — On a phone on its side the card is a drawer.**
- [ ] 13.14 **M6 — Group headers in place of "red:".**
- [ ] 13.15 **M7 — "Next:" is written on the next button.**
- [ ] 13.16 **W6 — The Deep Space photo has a caption.**
- [ ] 13.17 **D1 — No name is drawn under the card on a wide screen.**
- [x] 13.18 **The sizes in between.** A sweep of 27 screen sizes found what the five test
      screens miss: the pill pushed onto Settings just wider than a phone, a small phone on
      its side left with no room for the view, a tab's word cut on a 320 px phone, and the
      first-visit hint under the card. All are fixed and checked at five more sizes in
      `tests/e2e/navigation.spec.ts`.

**Acceptance:** each task's checks in the spec pass as Playwright tests on the five screens of
`tests/e2e/screens.ts`, in English and Vietnamese where words are measured; every control is
still 44 px or more; what is to scale is always said on screen; the gate passes.

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
