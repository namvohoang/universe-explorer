# CLAUDE.md — conventions for Universe Explorer

A web app where kids explore the universe: what each kind of object is, what it really looks
like, how big it is and how it moves. Written in TypeScript.

Read `PLAN.md` before starting any task. Work one task at a time and update its
checkbox when done.

## Principles
- Real numbers only: every size, distance, mass and orbital element comes from a cited source
  (JPL, NASA fact sheets, IAU). Never write an astronomical value from memory.
- True ratios: sizes and distances are stored in real units. Anything shown out of true scale goes
  through a named scale mode, and the screen tells the kid it is not to scale.
- Real shapes: a body is drawn with its real shape (flattened, irregular, ringed, tilted), not as
  a generic sphere.
- Real images: pictures come from NASA or another trusted agency, with source, credit and licence
  recorded. An artist's concept is always labelled as one.
- Built for kids: short, plain, correct explanations. No ads, trackers, accounts or data
  collection. Prefer saying "scientists don't know yet" to a made-up answer.

## Code
- TypeScript strict; no `any`. Object kinds are a discriminated union.
- Units in field names (`radiusKm`, `semiMajorAxisAu`, `periodDays`, `inclinationDeg`).
- Orbit and scale maths are pure functions with tests, separate from rendering.
- Keep functions small and tested.

## Layout
| Path | What |
|---|---|
| `src/data/` | Catalogue of objects: typed records with sources |
| `src/sim/` | Orbital mechanics, time, scale modes. No rendering, no DOM |
| `src/scene/` | Rendering of bodies, orbits, rings |
| `src/ui/` | Kid-facing screens and text |
| `public/media/` | Images and textures, each listed in `CREDITS.md` |

Detailed rules are in `.claude/rules/`.

## Sources
- Every new image, texture or dataset goes into `CREDITS.md` with source URL, credit and licence,
  in the same commit.
- Every new dependency must have a permissive licence (MIT, Apache-2.0, BSD, ISC). Fonts may be
  OFL-1.1, credited in `CREDITS.md` with their licence text shipped in `public/licenses/`.

## Git
- Commits are authored by the repo owner only. Do not add `Co-Authored-By` or other
  attribution trailers to commits or PR descriptions.
