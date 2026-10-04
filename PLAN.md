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
| Hosting | Any static host; current target is a Hugging Face static Space |

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
| `true-sizes` | One factor for all bodies | Compressed, order and ellipse shape kept | "Planets are the right size next to each other. They are really much farther apart." |
| `easy` | Compressed, order kept | Compressed, order kept | "Drawn bigger and closer so you can see everything." |

In `true` mode planets are too small to see from far away; the camera, labels and markers handle
that, not a hidden multiplier. Compression functions are monotonic, named and tested. The
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
- [ ] 1.3 `kepler.ts`: Kepler solver and elements → position, with unit tests.
- [ ] 1.4 `time.ts`: dates, Julian date, centuries since epoch, speed control, validity limits.
- [ ] 1.5 `frames.ts`: orbit plane → ecliptic → scene axes; pole orientation for tilt.
- [ ] 1.6 Position tests against JPL Horizons at several dates per body, with a named tolerance.
- [ ] 1.7 `scale.ts`: the three modes of §5.4 with ratio and monotonicity tests.

**Acceptance:** planet positions match Horizons within the documented tolerance across the
supported date range; in `true` mode every size and distance ratio equals the catalogue ratio;
`src/sim/` imports nothing from three.js or the DOM.

### Phase 2 — The solar system, done right

- [ ] 2.1 Scene shell: renderer, camera, orbit controls, fly-to, resize, reduced-motion handling.
- [ ] 2.2 Bodies as spheroids with real flattening, tilt, pole direction and spin (including retrograde).
- [ ] 2.3 Real surface maps for the Sun, planets and Moon, each credited; honest labels for false-colour maps.
- [ ] 2.4 Saturn's rings (and the fainter ring systems) at real radii; ring shadow and planet shadow.
- [ ] 2.5 Orbit paths drawn from the same elements that move the bodies.
- [ ] 2.6 Lighting from the Sun: day and night sides, Moon phases.
- [ ] 2.7 Scale-mode switch with the on-screen label; markers so tiny bodies can be found in `true` mode.
- [ ] 2.8 Date clock with pause, speeds and "today".
- [ ] 2.9 Info card, name labels, chips and scene tabs, ported from the prototype.
- [ ] 2.10 Card content for the ten bodies: every prototype stat and fact re-sourced or removed; numbers generated from the catalogue.
- [ ] 2.11 Read aloud with the browser voice.

**Acceptance:** everything the prototype's Solar System scene does, now with real shapes, real
maps, real orbits and a real date; a body always sits on its drawn path; `/data-check all` and
`/credits-check` report no critical findings.

### Phase 3 — The rest of the solar system

- [ ] 3.1 Major moons of Mars, Jupiter, Saturn, Uranus and Neptune, with orbits relative to their planet.
- [ ] 3.2 Irregular bodies drawn from shape models or triaxial dimensions (never as spheres).
- [ ] 3.3 Dwarf planets.
- [ ] 3.4 Asteroids and the asteroid belt and Kuiper belt as real distributions, not decorative rings.
- [ ] 3.5 Comets: eccentric orbits, a tail that points away from the Sun and grows near it.
- [ ] 3.6 Concept cards for each new kind.
- [ ] 3.7 Size line-up and Distance line views (§5.4).

**Acceptance:** each object kind in the solar system has at least one object and a concept card;
the two comparison views use catalogue ratios only.

### Phase 4 — Beyond the solar system

- [ ] 4.1 Zoom-out ladder: solar system → nearby stars → Milky Way → other galaxies, with the scale stated at each step.
- [ ] 4.2 Milky Way scene rebuilt from published structure, with "You are here"; labelled as a model, since no photo from outside exists.
- [ ] 4.3 Black hole scene; the real Event Horizon Telescope images beside the labelled simulation.
- [ ] 4.4 Stars of different kinds and sizes; star clusters.
- [ ] 4.5 Nebulae and galaxies with real telescope images, false colour explained.
- [ ] 4.6 Exoplanets: sourced facts, artist's concepts labelled.

**Acceptance:** every `kind` in §5.1 has a concept card and at least one object; every non-photo
image carries its label.

### Phase 5 — Kid experience and release

- [ ] 5.1 Natural voice, per the decision in §8.
- [ ] 5.2 Photo gallery per object with credits a grown-up can open.
- [ ] 5.3 Accessibility pass: keyboard, screen reader, contrast, reduced motion, touch targets.
- [ ] 5.4 Reading-level review of every string with the target age in mind.
- [ ] 5.5 Performance pass on a mid-range tablet: texture sizes, lazy loading per scene.
- [ ] 5.6 Works offline after first load.
- [ ] 5.7 Release: deploy script, final `/data-check all`, `/credits-check`, grown-ups' page (sources, credits, privacy).

**Acceptance:** smooth on a mid-range tablet; usable with keyboard only and with a screen reader;
no third-party request at runtime; credits page complete.

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

1. **Natural voice (Kokoro).** The prototype downloads the library from a CDN and a ~90 MB model
   from Hugging Face, which breaks "no third-party request". Options: serve both from the app's
   own host behind an explicit opt-in, or drop it and keep the browser voice.
2. **Default scale mode.** `easy` (like the prototype) or `true-sizes`.
3. **Languages.** English only, or English and Vietnamese from the start.
4. **Hosting.** Stay on a Hugging Face static Space or move to another static host.
5. **Supported dates.** Limited by the planet elements chosen in 1.2; the longer-span JPL table
   trades accuracy for range.
