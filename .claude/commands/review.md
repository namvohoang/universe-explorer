---
description: Structured code review against Universe Explorer conventions (accuracy, scale, shapes, media credits, kid safety, TS rules). Optional flags /data-check, /credits-check and /ux-audit.
---

# Code Review

## Flags (strip before scope detection)

- **`/data-check`** — expand section 2 into a full audit (see `.claude/commands/data-check.md`).
- **`/credits-check`** — expand section 4 into a full audit (see `.claude/commands/credits-check.md`).
- **`/ux-audit`** — add section 7 (kid UX and accessibility) for UI changes.

## Scope

- No argument → staged diff (`git diff --cached`), else unstaged (`git diff`).
- File path(s) → those files.
- Area name (`data`, `sim`, `scene`, `ui`, `media`) → recent changes in that area.

Read the full diff and surrounding code before reviewing. For each finding give
**Location** (file:line), **Severity** (🔴 Critical | 🟡 Warning | 🔵 Suggestion), **Finding**, **Fix**.

## Checklist

### 1. Conventions
- [ ] TS strict, no `any`; object kinds narrowed on `kind`, not cast
- [ ] Units in every numeric field name; degrees in the catalogue, radians only inside `src/sim/`
- [ ] `src/sim/` is pure (no rendering, DOM, globals or `Date.now()` in maths)
- [ ] `src/scene/` holds no astronomical numbers and no orbit maths
- [ ] Functions small and tested

### 2. Scientific accuracy
- [ ] Every new or changed value has a primary source and retrieval date
- [ ] No value written from memory; unknowns are `null` with a reason
- [ ] Orbits are real ellipses with inclination; bodies sit on their drawn paths
- [ ] Elements carry epoch and frame; validity range respected
- [ ] Test tolerances not loosened

### 3. Scale and shape
- [ ] Nothing pre-scaled in the catalogue; all scaling through `src/sim/scale.ts`
- [ ] No magic multiplier for size, distance or speed
- [ ] Not-to-scale modes are labelled on screen
- [ ] Flattening, irregular shapes, rings, tilt and spin direction are drawn from data

### 4. Media
- [ ] Every new image or texture is from a trusted source and has a complete `CREDITS.md` row
- [ ] Artist's concepts, simulations and false-colour images are labelled for the kid
- [ ] Nothing hotlinked; no agency logos; no AI-generated images

### 5. Kid safety and privacy
- [ ] No third-party request, analytics, ad, embed or remote font
- [ ] No personal data collected; saved progress stays in the browser
- [ ] No unguarded external link

### 6. Clean code & tests
- [ ] No dead code, commented-out blocks or stray TODOs
- [ ] Tests cover the new maths and data mapping; float comparisons use tolerances
- [ ] New dependencies have a permissive licence

### 7. Kid UX *(only with `/ux-audit`)*
- [ ] Text is short, plain and true; new words explained; calm tone
- [ ] Comparisons and rounded numbers are derived from the catalogue
- [ ] Keyboard and touch work; targets ≥ 44 px; AA contrast; reduced motion respected
- [ ] Alt text and text descriptions present

## Output

One `## N. <Dimension>` section per dimension with findings or "✅ No issues", then:

```
## Summary
🔴 Critical: N  |  🟡 Warning: N  |  🔵 Suggestion: N
<one-paragraph assessment and next step>
```
