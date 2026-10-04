# Universe Explorer Workflow & General Guidelines

Cross-cutting rules for AI assistants working in the **universe-explorer** repo — a TypeScript web
app where kids explore the universe: object catalogue (`src/data/`), orbit and scale maths
(`src/sim/`), rendering (`src/scene/`), kid-facing UI (`src/ui/`) and media (`public/media/`).

`PLAN.md` is the source of truth for architecture, phases and acceptance criteria.

## 1. Git Workflow & Commits

Use **Conventional Commits**:

```
<type>(<scope>): <short summary>

<optional body>
```

- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `build`, `ci`.
- **Scopes**: `data`, `sim`, `scene`, `ui`, `media`, `tools`, `config`, `docs`, `plan`, `credits`.
- **No attribution trailers**: NEVER add `Co-Authored-By`, `Signed-off-by` or similar trailers to
  commits or PR descriptions. Commits are authored by the repo owner only.
- One logical change per commit. Tick the `PLAN.md` checkbox in the same commit that finishes the task.

## 2. Pre-Commit Quality Gate

Run every check whose script exists in `package.json` (skip one that isn't scaffolded yet, and say so):

| Check | Command |
|---|---|
| Types | `npm run typecheck` (`tsc --noEmit`) |
| Lint | `npm run lint` |
| Tests | `npm test` |
| Data and credits | `npm run validate` (catalogue schema, sources present, every media file in `CREDITS.md`) |
| Build | `npm run build` |

Keep these script names when scaffolding, so the gate and `/pre-commit` stay valid.

An orbit or scale test failure is a real failure: never widen a tolerance just to get green.

## 3. Plan-First Workflow

For any feature or non-trivial fix:

1. **Read** the relevant `PLAN.md` section (task, acceptance criteria).
2. **Research** affected code and, for data or orbit work, the primary source (see `data.md`).
3. **Present a plan** (files, types, data sources, images and their licences, tests, kid-facing
   text) and wait for approval.
4. **Execute**, run the quality gate, update the `PLAN.md` checkbox (`[~]` while in progress, `[x]` when done).

Trivial fixes (typos, config) may skip the plan but not the quality gate.

## 4. Scientific Accuracy (non-negotiable)

- Never write an astronomical value from memory. Look it up in a primary source, and record the
  source and the retrieval date next to the value.
- If sources disagree, use the most authoritative and most recent one and note the choice.
- If a value is uncertain or unknown, the data says so and the UI says so. Never invent a number
  to fill a gap.
- A simplification for kids must still be true. "The Sun is a star" is fine; "the Sun is a ball of
  fire" is not.

## 5. Scale and Ratios

- The catalogue holds real values in real units. Nothing in `src/data/` is pre-scaled for display.
- All display scaling lives in `src/sim/scale.ts` as named scale modes. No magic multipliers in
  rendering code.
- In true-scale mode, sizes and distances share one factor. In any other mode the UI states
  plainly that sizes or distances are not to scale.
- Within a mode, the ratio between any two bodies' sizes stays true unless the mode is documented
  as compressing it (and the UI says so).

## 6. Images and Media

- Only from the trusted sources listed in `media.md`. No stock sites, no wallpaper sites, no
  search-engine image results, no AI-generated pictures.
- Every file in `public/media/` has a row in `CREDITS.md`: source page URL, credit line, licence,
  kind (photo, composite, artist's concept, diagram), date retrieved.
- An artist's concept, simulation or false-colour image is labelled as such wherever a kid sees it.
- Media is stored in the repo and served from the app, not hotlinked.

## 7. Kids First

- No ads, analytics, trackers, third-party embeds, accounts or personal data. The app makes no
  request to a third party at runtime.
- No link takes a child off the site without an adult-facing notice.
- Plain words, short sentences, no fear-mongering (black holes, asteroid impacts and the Sun's
  future are explained calmly and truthfully).
- Works with keyboard and screen reader; every image has alt text; respects reduced motion.

## 8. Dependencies

- Permissive licences only (MIT, Apache-2.0, BSD, ISC). No GPL-family code.
- Fonts may be OFL-1.1. Each font is credited in `CREDITS.md` and its licence text ships in
  `public/licenses/`.
- Check current library docs (context7) before using an API; never rely on memory for a
  fast-moving library.
- MCP servers in `.mcp.json` send queries to external services. Never include personal data.

## 9. Pull Requests

- Title in conventional-commit format.
- Body states the **why**, key technical decisions, the `PLAN.md` task it advances, data sources
  used and any media added (with licences).
- No attribution trailers or "generated with" footers.
