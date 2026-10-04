---
description: Audit the object catalogue and orbit maths against primary sources (JPL, NASA fact sheets, IAU) — values, units, shapes, orbits and scale ratios.
---

# Data Accuracy Check

> Universe Explorer's core promise: **what a kid sees is real.** Sizes, shapes, distances and
> motions come from cited data, and anything not to scale says so.

Scope: no argument → records and sim code changed in the diff. An object id or `kind` → those
records. `all` → the whole catalogue.

## Steps

1. **Sources present**: every record in scope has `sources` with URL and retrieval date for each
   group of values. List records with none.

2. **Verify values against the source**: open the cited page (or the preferred source in
   `.claude/rules/data.md`) and compare each value. Report: object, field, catalogue value,
   source value, difference. Do not "correct" a value from memory — only from a page you opened.

3. **Units and sanity**: unit suffix on every numeric field; degrees in the catalogue;
   eccentricity in [0, 1) for bound orbits; polar radius ≤ equatorial radius; a moon smaller than
   its planet; `null` (with reason) rather than `0` for unknowns.

4. **Shape**: flattened bodies have both radii; irregular bodies have triaxial dimensions and are
   not rendered as spheres; ringed bodies have ring radii; tilt and rotation (with retrograde
   flagged) are present.

5. **Orbits**: elements complete, with epoch and frame; orbit paths use eccentricity and
   inclination (grep `src/scene/` for circles or flattened planes); the Kepler solver tolerance is
   a named constant; elements are not used outside their validity range without a warning.

6. **Positions**: run the Horizons comparison tests (`npm test`). For each failure give body,
   date, expected, actual, delta, tolerance.

7. **Scale and ratios**:
   ```bash
   grep -rnE "\* ?[0-9]+(\.[0-9]+)?|scale\.set|setScalar" src/scene
   ```
   Each hit must go through `src/sim/scale.ts`. Confirm true-scale mode uses one factor for sizes
   and distances, and every other mode shows the not-to-scale label.

8. **Report** by severity:
   - 🔴 Critical: wrong or unsourced value shown to kids; ratio broken without a label; body off
     its orbit path
   - 🟡 Warning: missing retrieval date, generic sphere for an irregular body, elements used
     outside their validity range
   - 🔵 Info: a newer or better source exists
