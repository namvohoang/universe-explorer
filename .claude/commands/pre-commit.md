---
description: Run the quality gate (typecheck, lint, tests, data and credits validation, build) and quick accuracy, media and kid-safety checks on the diff.
---

# Pre-Commit Quality Gate

## Steps

1. **Detect changes**: `git status --porcelain`. Map changed paths to areas: `src/data/`,
   `src/sim/`, `src/scene/`, `src/ui/`, `public/media/`, root docs.

2. **Run the checks** that exist in `package.json`:
   ```bash
   npm run typecheck
   npm run lint
   npm test
   npm run validate
   npm run build
   ```
   If a script is missing, report it as SKIPPED (not scaffolded) rather than skipping silently.
   Orbit and scale test failures are real failures — never widen a tolerance to pass.

3. **Quick data check** on the diff (see `/data-check` for the full audit): every new or changed
   astronomical value has a source and retrieval date; units are in the field name; nothing is
   pre-scaled; no magic size, distance or speed multiplier in `src/scene/`.

4. **Quick media check** on the diff (see `/credits-check`): every new file under `public/media/`
   has a complete `CREDITS.md` row from a trusted source; non-photos are labelled in the UI.

5. **Quick kid-safety check** on the diff: no new third-party request, script, font, embed or
   analytics; no external link without a notice.

6. **Dependencies**: any new entry in `package.json` has a permissive licence.

7. **Report**: a table of check → PASS/FAIL/SKIPPED. If anything fails, STOP and show the
   failure. If all pass, suggest `/commit`.
