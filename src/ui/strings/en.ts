/** Every user-facing string lives here, never inline in components. */
export const en = {
  appTitle: 'Universe Explorer',
  wholeView: 'Whole view',
  goTo: 'Go to',
  scaleControl: 'How big and how far things are drawn',
  scaleOptionTrue: 'Real',
  scaleOptionTrueSizes: 'Real sizes',
  scaleOptionEasy: 'Easy view',
  scaleLabelTrue: 'Real sizes and real distances.',
  scaleLabelTrueSizes:
    'Planets are the right size next to each other. They are really much farther apart.',
  scaleLabelEasy: 'Drawn bigger and closer so you can see everything.',
  mapAltMercury: "A map of Mercury's surface: grey and covered in craters.",
  mapAltVenus: 'A map of the ground on Venus made with radar, with colours added by scientists.',
  mapAltEarth:
    'A map of Earth from space: blue oceans, green and brown land, white ice at the poles.',
  mapAltMoon: "A map of the Moon's surface: grey with darker patches and many craters.",
  mapAltMars: 'A map of Mars: rusty orange with darker regions and white ice at the poles.',
  mapAltJupiter: "A map of Jupiter's clouds in cream and brown stripes, with the Great Red Spot.",
  mapAltSaturn: "An artist's drawing of Saturn's pale yellow cloud bands.",
  mapAltUranus: "An artist's drawing of Uranus: smooth pale blue-green.",
  mapAltNeptune: "An artist's drawing of Neptune: deep blue with a few white clouds.",
  mediaKindComposite: 'Made from many pictures joined together.',
  mediaKindFalseColour: 'Colours added by scientists.',
  mediaKindArtistConcept: "An artist's drawing, not a photo.",
  mediaKindSimulation: 'A computer simulation, not a photo.',
  mediaKindDiagram: 'A diagram, not a photo.',
} as const;

export type StringKey = keyof typeof en;
