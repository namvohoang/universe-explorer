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
- [ ] 8.12 Lighter first load: Deep Space, Spaceships and Compare load on demand so no chunk
      passes 500 kB; the service worker stores the shell and the first view at once and the rest
      when used or afterwards in the background; the render loop stops when the page is hidden and
      the pixel ratio drops when frames run slow (it is already capped at 2).
- [ ] 8.13 Vietnamese (ask the owner first: open decision 3): `vi.ts` with the same keys, a
      language choice, fonts with Vietnamese letters, Vietnamese recordings, all kid text
      reviewed by the owner.

**Acceptance:** at all five sizes nothing overlaps and every control is reachable, with 44 px
targets. Keyboard order is top bar, card, controls, place row. The gate passes and no third-party
origin is requested. No astronomical data changes.

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
3. **Languages.** English only, or English and Vietnamese from the start.
4. **Hosting.** Decided: GitHub Pages.
5. **Supported dates.** Limited by the planet elements chosen in 1.2; the longer-span JPL table
   trades accuracy for range.
