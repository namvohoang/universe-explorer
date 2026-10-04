# Prototype (reference only)

The original single-file Universe Explorer, built in a Claude chat and published as a static
Hugging Face Space. It is kept here to port from. It is not built, linted, tested or shipped, and
nothing in it counts as verified (`PLAN.md` §2).

| File | What |
|---|---|
| `index.html` | The whole app: markup, CSS, three.js r160 (MIT) bundled inline, app code minified at the end of the script |
| `space-README.md` | The Space's README with its Hugging Face front matter |
| `deploy.py` | Script that uploaded `index.html` and the README to a Space |
| `TEXTS.md` | Every card text, extracted as a checklist for verification |

Open `index.html` in a browser to run it. It loads fonts from Google and, if "Natural voice" is
turned on, a library from jsDelivr and a model from Hugging Face.

## Feature checklist

Tick a line when the TypeScript app does the same thing (or the plan replaces it, as noted).

### Scenes and navigation
- [ ] Three scenes switched by tabs: Solar System, Milky Way, Black Hole
- [ ] Hint line under the title that changes per scene
- [ ] Each scene opens on a whole-view camera position with an intro card
- [ ] Tap a body, or its name label, or its chip in the tray, to fly there and open its card
- [ ] "Whole view" chip returns to the start view
- [ ] Fly-to animation with easing; the camera then follows the moving body
- [ ] Drag to orbit, pinch or scroll to zoom, with damping; no panning; zoom limits per scene and per body
- [ ] Slow auto-rotate when nothing is selected
- [ ] Zoom-out limit adapts to portrait screens
- [ ] Pointer cursor over tappable bodies; a drag is not treated as a tap
- [ ] Larger invisible hit areas so small bodies are easy to tap

### Solar System scene
- [ ] Sun with glow, eight planets, the Moon, asteroid belt, orbit lines *(replaced: real shapes, maps and orbits)*
- [ ] Earth cloud layer; rings on Saturn and Uranus; axial tilt and spin, Venus backwards *(replaced: from data)*
- [ ] Planets move at true relative periods *(kept; now from real elements and a real date)*
- [ ] Speed control: Pause, Slow, Normal, Fast
- [ ] Clock: "N Earth years went by" and "1 year = N seconds" *(replaced: a real date)*
- [ ] The intro card says sizes and distances are not real *(replaced: scale modes with on-screen label)*

### Milky Way scene
- [ ] Spiral galaxy of points with a bright bulge, slowly turning *(replaced: built from published structure, labelled as a model)*
- [ ] "You Are Here" marker with a pulsing ring
- [ ] Galactic centre marker for Sagittarius A*

### Black Hole scene
- [ ] Black sphere, glowing disk, lensed ring facing the camera, particles spiralling in *(kept as a labelled simulation, beside real images)*
- [ ] Separate cards for the black hole and its disk

### Info card
- [ ] Colour swatch, eyebrow line, name, one-line hello, four stats, "Cool facts" list
- [ ] Close button and Escape key close the card
- [ ] Card content announced to screen readers when it changes

### Labels and tray
- [ ] Name labels that track bodies on screen and hide when off-screen or too far away
- [ ] "Names" toggle
- [ ] Chips with a colour dot for each place in the current scene; the current one is highlighted

### Read aloud
- [ ] "Read it to me" reads the name, hello and facts; the button becomes "Stop reading"
- [ ] Text is cleaned for speech (minus signs, °C, %, ¼, the star in A*)
- [ ] Browser voice by default, at a slightly slow rate
- [ ] Optional "Natural voice" (Kokoro, in a web worker) with download progress, remembered choice and fallback to the browser voice *(open decision, `PLAN.md` §8)*
- [ ] Changing card or closing it stops the reading

### Look and behaviour
- [ ] Dark space theme; display font Lilita One, body font Atkinson Hyperlegible *(fonts to be self-hosted)*
- [ ] Layout for narrow screens and safe-area insets
- [ ] Reduced motion: instant camera moves, no auto-rotate
- [ ] Visible keyboard focus on buttons
- [ ] Loading screen, and a plain message if start-up fails
- [ ] Toast messages for voice status
