---
paths:
  - "src/data/**"
  - "src/sim/**"
---

# Data & Simulation Guidelines

Rules for the object catalogue in `src/data/` and the orbit, time and scale maths in `src/sim/`.

## Object model

- `CelestialObject` is a discriminated union on `kind`. Cover the full set a kid will meet:
  `star`, `planet`, `dwarf-planet`, `moon`, `asteroid`, `comet`, `ring-system`, `belt`
  (asteroid belt, Kuiper belt), `exoplanet`, `nebula`, `star-cluster`, `galaxy`, `black-hole`.
  Add a kind rather than bending an existing one.
- Each kind has one kid-facing explanation of the concept (what a moon is, what a comet is),
  separate from the facts of any one object.
- Classification follows the IAU (Pluto is a dwarf planet). Where a class is debated or informal,
  say so in the data.

## Shape (never a generic sphere)

- Round bodies: `equatorialRadiusKm` and `polarRadiusKm`. Saturn and Jupiter are visibly flattened.
- Irregular bodies (small moons, asteroids, comet nuclei): triaxial `dimensionsKm` and, where one
  exists, a shape model. Do not draw Phobos or a comet nucleus as a ball.
- Rings: inner and outer radius in km, in the body's equatorial plane.
- Orientation: `axialTiltDeg` and `rotationPeriodHours` (negative or flagged for retrograde, e.g.
  Venus). Tilt and spin are part of the shape a kid sees.
- Non-solid objects (nebula, galaxy, black hole) record real extent and structure type, and are
  never given a fake hard surface.

## Units and fields

1. Units in every numeric field name: `Km`, `Au`, `Kg`, `Deg`, `Days`, `Hours`, `Ly`.
   Never a bare `radius` or `distance`.
2. Angles in degrees in the catalogue; convert to radians inside `src/sim/` only.
3. Orbital elements are stored as a set with their epoch and reference frame: semi-major axis,
   eccentricity, inclination, longitude of ascending node, argument (or longitude) of perihelion,
   mean anomaly (or mean longitude) at epoch, plus rates if the source gives them.
4. A moon's elements are relative to its planet, in the frame the source states. Record the frame.
5. Unknown values are `null` with a reason, never `0` and never a guess.

## Sources

Every record carries `sources`: URL, what was taken from it, date retrieved. Preferred:

| Data | Source |
|---|---|
| Planet orbital elements | JPL "Approximate Positions of the Planets" — https://ssd.jpl.nasa.gov/planets/approx_pos.html |
| Positions to check against | JPL Horizons — https://ssd.jpl.nasa.gov/horizons/ |
| Sizes, masses, tilt, rotation | NASA Planetary Fact Sheets — https://nssdc.gsfc.nasa.gov/planetary/factsheet/ |
| Moons | JPL planetary satellites — https://ssd.jpl.nasa.gov/sats/ |
| Asteroids, comets | JPL Small-Body Database — https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html |
| Exoplanets | NASA Exoplanet Archive — https://exoplanetarchive.ipac.caltech.edu/ |
| Names, classes | IAU — https://www.iau.org/ |

Wikipedia is fine for finding a source, never as the source.

## Orbits

- Orbits are real ellipses from the elements: eccentric, inclined and oriented. No circles, no
  flattening everything into one plane.
- Position at time *t*: mean anomaly → solve Kepler's equation (iterate to a named tolerance) →
  true anomaly → rotate into the reference frame. Bodies move faster near perihelion.
- State the validity range of the elements used (the JPL approximate elements are fitted for a
  limited span of years) and clamp or warn outside it.
- Relative speeds are real: one time scale drives every body, so periods keep their true ratios.
- Simulation time is explicit (a date the kid can see and change), never frame count.

## Coding rules

1. `src/sim/` is pure: no rendering library, no DOM, no globals, no `Date.now()` inside maths
   (time is an argument).
2. Named constants for every physical constant and tolerance, with a comment giving the source.
3. No pre-scaled values. Display scaling happens only through `src/sim/scale.ts`.
4. No `any`; narrow on `kind` instead of casting.

## Testing

- Kepler solver: circular orbit, high eccentricity, perihelion and aphelion, a full period
  returning to start.
- Positions: compare with JPL Horizons at several dates. The tolerance is named and documented;
  never widen it to make a test pass.
- Scale: in true-scale mode the size ratio and distance ratio of any two bodies equal the
  catalogue ratio.
- Catalogue: schema validation, sources present on every record, units sane (a planet's radius is
  not larger than its star's).
- Floating-point comparisons always use a tolerance, never `===`.
