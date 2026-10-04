---
name: plan-task
description: Plan-first workflow for implementing a PLAN.md task (e.g. "do task 1.3", "next task") or any significant feature/fix in universe-explorer — research, plan, approval, implement, quality gate, tick the checkbox.
---

# PLAN.md Task Workflow

Use for any `PLAN.md` task, new object kind, new scene or screen, or multi-file fix.

## 1. Pick the task

- If the user named one (e.g. "1.3"), use it. If they said "next", pick the first `[ ]` task
  whose prerequisites are met and confirm with the user.
- If `PLAN.md` does not exist yet, say so and agree the scope of this one task with the user
  before going further.
- Only one task at a time. Mark it `[~]` in `PLAN.md` when work starts.

## 2. Research

- Read the task and its phase's **acceptance criteria**.
- Read existing code in the affected area and `.claude/rules/` for that area.
- For data or orbit work, open the primary sources (`.claude/rules/data.md`) and collect the
  values with their URLs. Do not rely on memory for any number.
- For images, find candidates on trusted sites (`.claude/rules/media.md`) and read each image
  page's credit and licence.
- For a library API, check current docs (context7).

## 3. Plan (present, then wait for approval)

- Scope and what "done" means (tie to acceptance criteria)
- Files to add/modify
- Type changes (object kinds, fields with units)
- Data: which objects, which values, from which source
- Shape and orbit: how the real shape and real orbit are represented and drawn
- Scale: which scale mode applies and what the kid is told
- Media: which images, kind (photo / artist's concept / …), credit, licence
- Kid-facing text: the draft sentences
- Tests: Kepler and position checks, ratio checks, data → display mapping
- New dependencies with licences
- Open questions

## 4. Implement

- Data first, then sim, then scene, then UI.
- Small, pure, tested functions. Units in field names. No pre-scaled values, no magic multipliers.
- Add the `CREDITS.md` row with each media file.
- When a fact is uncertain, say so in the data and in the text rather than guessing.

## 5. Verify

- Run `/pre-commit`. Fix failures; never widen a tolerance.
- For visual work, run the app and look: body on its path, shape right, label shown when not to
  scale. Say what was and wasn't checked — don't claim it.

## 6. Close

- Tick `[x]` in `PLAN.md` only when acceptance criteria are actually met; otherwise leave `[~]`
  and list what remains.
- Summarize changes and offer `/commit` (no attribution trailers).
