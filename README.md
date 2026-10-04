# Universe Explorer

A 3D space explorer for kids aged 6 to 9. Tap an object to fly there, see what it really looks
like, read or listen to a short true explanation, and compare how big and how far things are.

**Try it: https://namvohoang.github.io/universe-explorer/**

It runs in a browser on a tablet, laptop or phone. There is no account, no ads and no tracking,
and the app asks nothing of any other website while it runs. After the first load it works offline.

## What is in it

- **The solar system in 3D**: the Sun, the planets, their major moons, dwarf planets, asteroids,
  comets, the asteroid belt and the Kuiper belt, plus the International Space Station and Hubble
  round Earth.
- **Deep Space**: other stars, star clusters, nebulae, galaxies, a black hole, planets round
  another star, and star patterns such as Orion shown in 3D.
- **A real date**: the clock is a real calendar date, and every body is where it really is on
  that date. Pause it, speed it up, or jump back to today.
- **Three ways to see scale**: real sizes and distances, real sizes with distances squeezed, or
  everything drawn bigger and closer. The screen always says which one is on and what is not to
  scale. A size line-up and a distance line show the true ratios directly.
- **Read it to me**: every card has a recorded reading that ships with the app.
- **A grown-ups' page**: privacy, accuracy, picture credits and sources.

## What it promises

1. **Real numbers only.** Every size, distance, mass and orbit comes from a cited source (JPL,
   NASA fact sheets, IAU, ESA) with the date it was looked up.
2. **True ratios.** Data is stored in real units. Anything drawn out of true scale goes through a
   named scale mode, and the screen says so.
3. **Real shapes.** Bodies are flattened, irregular, ringed and tilted as they really are, not
   generic spheres.
4. **Real images.** Pictures and maps come from NASA and other trusted agencies, each credited in
   [CREDITS.md](CREDITS.md). An artist's drawing or a picture with colours added is labelled as one.
5. **True, then simple.** A sentence written for a kid must still be correct. When scientists
   don't know yet, the app says so.

## Run it

Needs Node.js 22.13 or newer.

```sh
npm install
npm run dev
```

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run typecheck` | Check types (`tsc --noEmit`) |
| `npm run lint` | ESLint and Prettier check |
| `npm run format` | Format with Prettier |
| `npm test` | Run the tests (Vitest) |
| `npm run validate` | Check the catalogue (schema, sources) and that every media file is credited |
| `npm run build` | Build the static site into `dist/` |
| `npm run preview` | Serve the built site locally |

Before a commit, run `typecheck`, `lint`, `test`, `validate` and `build`. CI runs them on every
push, and a push to `main` deploys to GitHub Pages.

## How it is built

TypeScript (strict), [three.js](https://threejs.org/) used directly, plain DOM and CSS for the
screens, Vite for the build. The output is a static site with no server.

| Path | What |
|---|---|
| `src/data/` | The catalogue: one typed record per object, every value with its source |
| `src/sim/` | Orbit maths, time and scale modes. Pure functions with tests; no rendering, no DOM |
| `src/scene/` | three.js rendering of bodies, rings, orbits, belts and comet tails |
| `src/ui/` | Kid-facing screens, cards, controls, text and read-aloud |
| `public/media/` | Surface maps, pictures and 3D models, each listed in `CREDITS.md` |
| `public/voice/` | The recorded card readings |
| `tools/validate/` | The data and credits checks behind `npm run validate` |
| `tools/narrate/` | Dev-only scripts that record the card readings |
| `docs/prototype/` | The original single-file prototype, kept for reference |

Dependencies go one way: `ui` → `scene` → `sim` → `data`.

[PLAN.md](PLAN.md) holds the architecture, the task list and what is still open.
[CLAUDE.md](CLAUDE.md) and `.claude/rules/` hold the conventions.

## Adding or changing something

- **A number** is never typed from memory. Look it up in a primary source and record the source
  and the retrieval date next to the value.
- **A picture, map or model** comes only from a trusted agency, is stored in the repo (never
  hotlinked), and gets its row in `CREDITS.md` in the same commit.
- **Kid-facing text** lives in `src/ui/strings/`. Numbers in it are produced from the catalogue
  when shown, not written by hand.
- **A card's reading** is re-recorded with the scripts in `tools/narrate/` (setup is described at
  the top of `kokoro_narrate.py`).
- **A dependency** must have a permissive licence (MIT, Apache-2.0, BSD, ISC).

## Credits

Images, maps, shape models, datasets, fonts and software made by others are listed with their
source, credit and licence in [CREDITS.md](CREDITS.md). The app shows the same credits on its
grown-ups' page.
