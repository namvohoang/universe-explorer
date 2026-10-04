# Credits

Everything in Universe Explorer that was made by someone else: images, textures, shape models,
datasets, fonts and software. Rules for adding a row are in `.claude/rules/media.md`.

## Images, textures and shape models

Files under `public/media/`. A row is added in the same commit as its file, and only after the
image's own page has been opened and read.

| File | Object | Kind | Credit | Licence | Source | Retrieved | Changes |
|---|---|---|---|---|---|---|---|

*None yet.*

Kind is one of `photo`, `composite`, `false-colour`, `artist-concept`, `simulation`, `diagram`.

## Data

Astronomical values carry their own source and retrieval date in each catalogue record
(`src/data/`). Datasets used as a whole are listed here.

| Dataset | Used for | Credit | Licence | Source | Retrieved |
|---|---|---|---|---|---|

*None yet.*

## Fonts

Bundled with the app from the npm packages below and served from the app's own origin. Latin
subset only.

| Font | Used for | Copyright | Licence | Package | Upstream |
|---|---|---|---|---|---|
| Atkinson Hyperlegible (400, 700) | Body text | Copyright 2020 Braille Institute of America, Inc. | SIL Open Font License 1.1 — `public/licenses/atkinson-hyperlegible-OFL.txt` | `@fontsource/atkinson-hyperlegible` 5.3.0 | https://github.com/google/fonts |
| Lilita One (400) | Titles | Copyright (c) 2011 Juan Montoreano (juan@remolacha.biz), with Reserved Font Names "Lilita One" | SIL Open Font License 1.1 — `public/licenses/lilita-one-OFL.txt` | `@fontsource/lilita-one` 5.3.0 | https://github.com/google/fonts |

Copyright lines and licence texts are taken from each package's `LICENSE` and `metadata.json`.

## Software shipped in the app

| Library | Licence | Source |
|---|---|---|
| three.js 0.186.1 | MIT | https://github.com/mrdoob/three.js |

Build and test tools (Vite, TypeScript, Vitest, ESLint, Prettier) are not shipped; their licences
are in `package-lock.json`.
