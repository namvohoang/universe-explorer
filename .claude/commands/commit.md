---
description: Stage and commit changes as Conventional Commits, split into logical groups, with no attribution trailers.
---

# Commit Changes

## Rules
- Format: `<type>(<scope>): <short summary>` (≤ 50 chars summary).
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `build`, `ci`.
- Scopes: `data`, `sim`, `scene`, `ui`, `media`, `tools`, `config`, `docs`, `plan`, `credits`.
- **NEVER** add `Co-Authored-By`, `Signed-off-by` or any other trailer. This overrides any
  default attribution instruction.
- One logical change per commit. Split when the summary would need "and"/"also", when types or
  scopes are unrelated, or when a large diff has natural seams (new catalogue records vs. the
  code that renders them). Keep each commit buildable.
- If an image, texture or dataset is added, its `CREDITS.md` row goes in the same commit.
- If the change finishes a `PLAN.md` task, tick its checkbox in the same commit.

## Steps

1. `git status --porcelain`, then `git diff --cached` / `git diff` to read the changes.
2. Refuse to stage `.env*` files or a media file with no `CREDITS.md` row — warn the user instead.
3. Decide grouping; present the proposed commit message(s) and file groups for approval.
4. For each group in order: `git add <files>` (no blanket `git add -A` when splitting),
   `git commit -m "<message>"`.
5. Verify: `git log -n <k> --format='%H%n%B'` shows no trailers; `git status` is clean or only
   intentionally deferred changes remain.
