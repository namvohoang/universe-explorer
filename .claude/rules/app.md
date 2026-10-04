---
paths:
  - "src/scene/**"
  - "src/ui/**"
---

# App Guidelines (rendering and kid-facing UI)

Rules for rendering in `src/scene/` and screens and text in `src/ui/`.

## Rendering

1. `src/scene/` draws what `src/data/` and `src/sim/` give it. It holds no astronomical numbers
   and does no orbit maths of its own.
2. Every size and distance on screen comes from `src/sim/scale.ts`. No hand-tuned radius,
   distance or speed to "make it look right".
3. Shape comes from the catalogue: flattening, irregular shape, rings, axial tilt and spin
   direction are all drawn. A generic sphere is a bug unless the body really is close to one.
4. Orbit paths are drawn from the same elements that move the body, so a body always sits on its path.
5. Lighting comes from the star: day and night sides and phases are real, not decorative.
6. When the scale mode is not true scale, a visible label says so in kid words
   ("Planets are shown bigger so you can see them").
7. Keep per-frame work off framework state; no re-render per frame.

## Kid-facing text

- Written for a child: short sentences, everyday words, one idea at a time. A new word (orbit,
  gravity, light-year) is explained the first time it appears.
- True first, simple second. If a simple sentence would be wrong, find another simple sentence.
- Comparisons use the real ratio ("about 109 Earths side by side fit across the Sun"), taken from
  the catalogue, not typed in by hand.
- Numbers shown to the kid are rounded sensibly and carry a unit and, where it helps, a
  comparison. Rounding happens at display time, never in the data.
- Calm tone about scary topics. No doom, no jokes that teach something false.
- All user-facing strings live in one place, not inline in components.

## Safety and privacy

- No ads, analytics, trackers, third-party embeds or fonts loaded from another site, accounts,
  or personal data. Nothing is requested from a third party at runtime.
- Progress, if saved, stays in the browser.
- No external link without an adult-facing notice.

## Accessibility

- Everything works with keyboard and with touch; targets at least 44×44 px.
- Text meets WCAG AA contrast; do not rely on colour alone.
- Respect `prefers-reduced-motion`: orbits can be paused and the camera does not swoop.
- Every image and every 3D body has a text description.

## Testing

- Unit tests for data → display mapping (rounding, units, comparisons, not-to-scale label).
- A test that fails if the app requests any third-party origin.
